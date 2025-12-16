import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Auction, Bid, Ticket } from '@/lib/db/models';
import { cancelAuctionOnChain } from '@/lib/blockchain/auction';

/**
 * GET /api/buyer/auctions/[auctionId]
 * Get auction details with bid history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auctionId: string }> }
) {
  try {
    await connectDB();
    const { auctionId } = await params;

    const auction = await Auction.findById(auctionId)
      .populate('ticketId')
      .populate('sellerId', 'name walletAddress')
      .populate('eventId', 'title date venue city image description organizerId')
      .populate('ticketTypeId', 'name description perks')
      .populate('currentBidderId', 'name')
      .populate('winnerId', 'name walletAddress');

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Auction not found' },
        { status: 404 }
      );
    }

    // Increment view count
    auction.views += 1;
    await auction.save();

    // Get bid history (anonymized)
    const bids = await Bid.find({ auctionId: auction._id })
      .populate('bidderId', 'name')
      .sort({ placedAt: -1 })
      .limit(50);

    // Anonymize bidder names
    const anonymizedBids = bids.map((bid: any, index: number) => ({
      id: bid._id,
      amountEth: bid.amountEth,
      bidderName: `Bidder ${bids.length - index}`, // Anonymous
      placedAt: bid.placedAt,
      status: bid.status,
      causedExtension: bid.causedExtension,
    }));

    // Calculate time remaining
    const now = new Date();
    const endTime = new Date(auction.endTime);
    const timeRemainingMs = Math.max(0, endTime.getTime() - now.getTime());

    // Calculate min next bid
    const minNextBidEth = auction.currentBidEth > 0
      ? auction.currentBidEth + auction.bidIncrementEth
      : auction.startingBidEth;

    // Calculate max allowed bid (price cap)
    const maxAllowedBidEth = auction.originalPriceEth * (auction.maxPriceCapPercent / 100);

    return NextResponse.json({
      success: true,
      auction: {
        ...auction.toObject(),
        timeRemainingMs,
        timeRemainingFormatted: formatTimeRemaining(timeRemainingMs),
        minNextBidEth,
        maxAllowedBidEth,
        isEnded: timeRemainingMs === 0 || auction.status !== 'active',
      },
      bids: anonymizedBids,
      stats: {
        totalBids: auction.totalBids,
        uniqueBidders: auction.uniqueBidders,
        views: auction.views,
      },
    });
  } catch (error: any) {
    console.error('Get auction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get auction' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/buyer/auctions/[auctionId]
 * Cancel auction (only before any bids)
 */
export async function DELETE(
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

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Auction not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (auction.sellerId.toString() !== auth.user!.id) {
      return NextResponse.json(
        { success: false, error: 'You do not own this auction' },
        { status: 403 }
      );
    }

    // Check if can cancel (no bids)
    if (auction.totalBids > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel auction with existing bids' },
        { status: 400 }
      );
    }

    if (auction.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Auction is not active' },
        { status: 400 }
      );
    }

    // Cancel on-chain if exists
    if (auction.onChainAuctionId) {
      try {
        await cancelAuctionOnChain(auction.onChainAuctionId);
      } catch (chainError) {
        console.error('On-chain cancel failed:', chainError);
      }
    }

    // Update auction status
    auction.status = 'cancelled';
    await auction.save();

    // Restore ticket status
    await Ticket.findByIdAndUpdate(auction.ticketId, { status: 'ACTIVE' });

    return NextResponse.json({
      success: true,
      message: 'Auction cancelled successfully',
    });
  } catch (error: any) {
    console.error('Cancel auction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel auction' },
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
