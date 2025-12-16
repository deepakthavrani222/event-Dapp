import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Ticket, Auction, Event, TicketType, User } from '@/lib/db/models';
import { createAuctionOnChain } from '@/lib/blockchain/auction';
import mongoose from 'mongoose';

// Anti-sniping settings
const ANTI_SNIPE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const ANTI_SNIPE_EXTENSION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * GET /api/buyer/auctions
 * Get all active auctions (with filters)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    
    if (eventId) {
      query.eventId = new mongoose.Types.ObjectId(eventId);
    }
    
    if (status === 'active') {
      query.status = 'active';
      query.endTime = { $gt: new Date() };
    } else if (status === 'ended') {
      query.status = { $in: ['ended', 'settled', 'no_bids', 'reserve_not_met'] };
    } else if (status !== 'all') {
      query.status = status;
    }

    const auctions = await Auction.find(query)
      .populate('ticketId')
      .populate('sellerId', 'name email walletAddress')
      .populate('eventId', 'title date venue city image')
      .populate('ticketTypeId', 'name description')
      .populate('currentBidderId', 'name')
      .sort({ endTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Auction.countDocuments(query);

    // Calculate time remaining for each auction
    const auctionsWithTime = auctions.map((auction: any) => {
      const now = new Date();
      const endTime = new Date(auction.endTime);
      const timeRemainingMs = Math.max(0, endTime.getTime() - now.getTime());
      
      return {
        ...auction.toObject(),
        timeRemainingMs,
        timeRemainingFormatted: formatTimeRemaining(timeRemainingMs),
        minNextBidEth: auction.currentBidEth > 0 
          ? auction.currentBidEth + auction.bidIncrementEth 
          : auction.startingBidEth,
      };
    });

    return NextResponse.json({
      success: true,
      auctions: auctionsWithTime,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get auctions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get auctions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/buyer/auctions
 * Create a new auction for a ticket
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const body = await request.json();
    const {
      ticketId,
      startingBidEth,
      reservePriceEth,
      bidIncrementEth = 0.001,
      durationHours = 24,
      referralCode,
    } = body;

    // Validation
    if (!ticketId || !startingBidEth || startingBidEth <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid ticket ID or starting bid' },
        { status: 400 }
      );
    }

    if (durationHours < 1 || durationHours > 168) { // 1 hour to 7 days
      return NextResponse.json(
        { success: false, error: 'Duration must be between 1 and 168 hours' },
        { status: 400 }
      );
    }

    // Get ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (ticket.buyerId.toString() !== auth.user!.id) {
      return NextResponse.json(
        { success: false, error: 'You do not own this ticket' },
        { status: 403 }
      );
    }

    // Check ticket status
    if (ticket.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: `Ticket is not available for auction (status: ${ticket.status})` },
        { status: 400 }
      );
    }

    // Check if already in auction
    const existingAuction = await Auction.findOne({
      ticketId: ticket._id,
      status: { $in: ['pending', 'active'] },
    });

    if (existingAuction) {
      return NextResponse.json(
        { success: false, error: 'Ticket is already in an active auction' },
        { status: 400 }
      );
    }

    // Get event and ticket type for royalty info
    const event = await Event.findById(ticket.eventId);
    const ticketType = await TicketType.findById(ticket.ticketTypeId);
    const seller = await User.findById(auth.user!.id);

    if (!event || !ticketType) {
      return NextResponse.json(
        { success: false, error: 'Event or ticket type not found' },
        { status: 404 }
      );
    }

    // Check if auctions are enabled for this event (default to true if not set)
    const auctionsEnabled = event.auctionSettings?.auctionsEnabled !== false;
    if (!auctionsEnabled) {
      return NextResponse.json(
        { success: false, error: 'Auctions are not enabled for this event' },
        { status: 400 }
      );
    }

    // Calculate original price in ETH
    // Use priceEth if available, otherwise convert from INR (1 ETH ≈ 250,000 INR)
    const ETH_TO_INR = 250000;
    let originalPriceEth = ticketType.priceEth;
    
    if (!originalPriceEth || originalPriceEth <= 0) {
      // Convert from INR to ETH
      const priceInr = ticketType.price || ticket.price || 1000; // Default to 1000 INR if no price
      originalPriceEth = priceInr / ETH_TO_INR;
    }
    
    // Ensure minimum original price of 0.001 ETH to avoid division issues
    originalPriceEth = Math.max(originalPriceEth, 0.001);

    // Check price cap (default 150% = no cap effectively for low prices)
    const maxPriceCapPercent = event.auctionSettings?.maxAuctionPriceCapPercent || 150;
    const maxAllowedBid = Math.max(originalPriceEth * (maxPriceCapPercent / 100), 1); // At least 1 ETH max
    
    if (startingBidEth > maxAllowedBid) {
      return NextResponse.json(
        { success: false, error: `Starting bid exceeds maximum allowed (${maxAllowedBid.toFixed(4)} ETH)` },
        { status: 400 }
      );
    }

    // Get organizer wallet
    const organizer = await User.findById(event.organizerId);

    const now = new Date();
    const endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

    // Create auction in database
    const auction = await Auction.create({
      ticketId: ticket._id,
      sellerId: new mongoose.Types.ObjectId(auth.user!.id),
      eventId: ticket.eventId,
      ticketTypeId: ticket.ticketTypeId,
      
      startingBidEth,
      reservePriceEth: reservePriceEth || 0,
      bidIncrementEth,
      currentBidEth: 0,
      
      startTime: now,
      endTime,
      originalEndTime: endTime,
      
      originalPriceEth,
      maxPriceCapPercent,
      
      platformFeePercent: 750, // 7.5%
      organizerRoyaltyPercent: event.auctionSettings?.organizerRoyaltyPercent || event.royaltySettings?.royaltyPercentage * 100 || 500, // 5%
      artistRoyaltyPercent: event.auctionSettings?.artistRoyaltyPercent || 1000, // 10%
      
      organizerWallet: organizer?.walletAddress,
      artistWallet: event.auctionSettings?.artistWallet || '',
      
      status: 'active',
      referralCode,
      
      totalBids: 0,
      uniqueBidders: 0,
      views: 0,
    });

    // Update ticket status
    ticket.status = 'LISTED';
    await ticket.save();

    // Try to create on-chain (non-blocking for now)
    try {
      const onChainResult = await createAuctionOnChain({
        ticketContract: process.env.TICKET_NFT_CONTRACT_ADDRESS || '',
        tokenId: ticket.tokenId,
        amount: 1,
        startingBidEth,
        reservePriceEth: reservePriceEth || 0,
        bidIncrementEth,
        durationSeconds: durationHours * 60 * 60,
        originalPriceEth,
        organizerRoyalty: event.resaleRoyaltyPercent || 500,
        artistRoyalty: event.artistRoyaltyPercent || 1000,
        organizerWallet: organizer?.walletAddress || '',
        artistWallet: event.artistWallet || '',
      });

      auction.onChainAuctionId = onChainResult.auctionId;
      auction.txHash = onChainResult.txHash;
      await auction.save();
    } catch (chainError) {
      console.error('On-chain auction creation failed (continuing with off-chain):', chainError);
    }

    return NextResponse.json({
      success: true,
      message: 'Auction created successfully',
      auction: {
        id: auction._id,
        startingBidEth: auction.startingBidEth,
        endTime: auction.endTime,
        status: auction.status,
        onChainAuctionId: auction.onChainAuctionId,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create auction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create auction' },
      { status: 500 }
    );
  }
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Ended';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
