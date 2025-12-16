import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Auction, Bid, User } from '@/lib/db/models';
import { createNotification } from '@/lib/services/notification';
import mongoose from 'mongoose';

// Anti-sniping settings
const ANTI_SNIPE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const ANTI_SNIPE_EXTENSION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_BIDS_PER_WALLET = 4;

/**
 * POST /api/buyer/auctions/[auctionId]/bid
 * Place a bid on an auction
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ auctionId: string }> }
) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();
    const { auctionId } = await params;

    const body = await request.json();
    const { amountEth, txHash, walletAddress } = body;

    if (!amountEth || amountEth <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid bid amount' },
        { status: 400 }
      );
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Auction not found' },
        { status: 404 }
      );
    }

    // Check auction is active
    if (auction.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Auction is not active' },
        { status: 400 }
      );
    }

    // Check auction hasn't ended
    const now = new Date();
    if (now >= auction.endTime) {
      return NextResponse.json(
        { success: false, error: 'Auction has ended' },
        { status: 400 }
      );
    }

    // Check not seller
    if (auction.sellerId.toString() === auth.user!.id) {
      return NextResponse.json(
        { success: false, error: 'Seller cannot bid on their own auction' },
        { status: 400 }
      );
    }

    // Check bid limits per wallet
    const user = await User.findById(auth.user!.id);
    const userWallet = walletAddress || user?.walletAddress;
    
    const activeBidCount = await Bid.countDocuments({
      bidderId: auth.user!.id,
      status: 'active',
    });

    if (activeBidCount >= MAX_BIDS_PER_WALLET) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_BIDS_PER_WALLET} active bids allowed per wallet` },
        { status: 400 }
      );
    }

    // Calculate minimum bid
    const minBid = auction.currentBidEth > 0
      ? auction.currentBidEth + auction.bidIncrementEth
      : auction.startingBidEth;

    if (amountEth < minBid) {
      return NextResponse.json(
        { success: false, error: `Bid must be at least ${minBid.toFixed(4)} ETH` },
        { status: 400 }
      );
    }

    // Check price cap
    const maxAllowedBid = auction.originalPriceEth * (auction.maxPriceCapPercent / 100);
    if (amountEth > maxAllowedBid) {
      return NextResponse.json(
        { success: false, error: `Bid exceeds maximum allowed (${maxAllowedBid.toFixed(4)} ETH)` },
        { status: 400 }
      );
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Mark previous bidder as outbid
      const previousBidderId = auction.currentBidderId;
      if (previousBidderId) {
        await Bid.updateMany(
          { auctionId: auction._id, bidderId: previousBidderId, status: 'active' },
          { status: 'outbid' },
          { session }
        );
      }

      // Check for anti-sniping extension
      let causedExtension = false;
      let newEndTime = auction.endTime;
      const timeUntilEnd = auction.endTime.getTime() - now.getTime();

      if (timeUntilEnd <= ANTI_SNIPE_WINDOW_MS) {
        newEndTime = new Date(now.getTime() + ANTI_SNIPE_EXTENSION_MS);
        causedExtension = true;
      }

      // Check if this is a new unique bidder
      const existingBidFromUser = await Bid.findOne({
        auctionId: auction._id,
        bidderId: auth.user!.id,
      });
      const isNewBidder = !existingBidFromUser;

      // Create new bid
      const bid = await Bid.create([{
        auctionId: auction._id,
        bidderId: new mongoose.Types.ObjectId(auth.user!.id),
        bidderWallet: userWallet || '',
        amountEth,
        status: 'active',
        txHash,
        placedAt: now,
        causedExtension,
        newEndTime: causedExtension ? newEndTime : undefined,
      }], { session });

      // Update auction
      auction.currentBidEth = amountEth;
      auction.currentBidderId = new mongoose.Types.ObjectId(auth.user!.id);
      auction.totalBids += 1;
      if (isNewBidder) {
        auction.uniqueBidders += 1;
      }
      if (causedExtension) {
        auction.endTime = newEndTime;
      }
      await auction.save({ session });

      await session.commitTransaction();

      // Send notifications (non-blocking)
      if (previousBidderId && previousBidderId.toString() !== auth.user!.id) {
        createNotification({
          userId: previousBidderId.toString(),
          type: 'SYSTEM',
          title: '⚠️ You\'ve been outbid!',
          message: `Someone placed a higher bid of ${amountEth} ETH. Place a new bid to stay in the auction!`,
          data: { auctionId: auction._id, newBid: amountEth },
        }).catch(console.error);
      }

      // Notify seller of new bid
      createNotification({
        userId: auction.sellerId.toString(),
        type: 'SYSTEM',
        title: '🎉 New bid on your auction!',
        message: `New bid of ${amountEth} ETH placed on your ticket auction`,
        data: { auctionId: auction._id, bidAmount: amountEth },
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        message: 'Bid placed successfully',
        bid: {
          id: bid[0]._id,
          amountEth,
          placedAt: now,
          causedExtension,
        },
        auction: {
          currentBidEth: auction.currentBidEth,
          endTime: auction.endTime,
          totalBids: auction.totalBids,
          timeExtended: causedExtension,
        },
      });

    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }

  } catch (error: any) {
    console.error('Place bid error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to place bid' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/buyer/auctions/[auctionId]/bid
 * Get user's bids on this auction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auctionId: string }> }
) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();
    const { auctionId } = await params;

    const bids = await Bid.find({
      auctionId,
      bidderId: auth.user!.id,
    }).sort({ placedAt: -1 });

    return NextResponse.json({
      success: true,
      bids,
    });
  } catch (error: any) {
    console.error('Get user bids error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get bids' },
      { status: 500 }
    );
  }
}
