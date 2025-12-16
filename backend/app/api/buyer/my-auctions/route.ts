import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Auction, Bid } from '@/lib/db/models';

/**
 * GET /api/buyer/my-auctions
 * Get user's auctions (as seller) and bids (as bidder)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // 'selling', 'bidding', 'won', 'all'

    const userId = auth.user!.id;
    const now = new Date();

    let sellingAuctions: any[] = [];
    let biddingAuctions: any[] = [];
    let wonAuctions: any[] = [];

    if (type === 'all' || type === 'selling') {
      // Auctions where user is seller
      sellingAuctions = await Auction.find({ sellerId: userId })
        .populate('ticketId')
        .populate('eventId', 'title date venue imageUrl')
        .populate('ticketTypeId', 'name')
        .populate('currentBidderId', 'name')
        .sort({ createdAt: -1 });

      // Add computed fields
      sellingAuctions = sellingAuctions.map((auction: any) => {
        const endTime = new Date(auction.endTime);
        const timeRemainingMs = Math.max(0, endTime.getTime() - now.getTime());
        return {
          ...auction.toObject(),
          timeRemainingMs,
          isEnded: timeRemainingMs === 0 || auction.status !== 'active',
        };
      });
    }

    if (type === 'all' || type === 'bidding') {
      // Auctions where user has active bids
      const activeBids = await Bid.find({
        bidderId: userId,
        status: { $in: ['active', 'outbid'] },
      }).distinct('auctionId');

      biddingAuctions = await Auction.find({
        _id: { $in: activeBids },
        status: 'active',
      })
        .populate('ticketId')
        .populate('eventId', 'title date venue imageUrl')
        .populate('ticketTypeId', 'name')
        .populate('sellerId', 'name')
        .sort({ endTime: 1 });

      // Add user's bid info
      for (let i = 0; i < biddingAuctions.length; i++) {
        const auction = biddingAuctions[i];
        const userBid = await Bid.findOne({
          auctionId: auction._id,
          bidderId: userId,
        }).sort({ placedAt: -1 });

        const endTime = new Date(auction.endTime);
        const timeRemainingMs = Math.max(0, endTime.getTime() - now.getTime());

        biddingAuctions[i] = {
          ...auction.toObject(),
          userBid: userBid ? {
            amountEth: userBid.amountEth,
            status: userBid.status,
            isWinning: auction.currentBidderId?.toString() === userId,
          } : null,
          timeRemainingMs,
          isEnded: timeRemainingMs === 0,
        };
      }
    }

    if (type === 'all' || type === 'won') {
      // Auctions user has won
      wonAuctions = await Auction.find({
        winnerId: userId,
        status: 'settled',
      })
        .populate('ticketId')
        .populate('eventId', 'title date venue imageUrl')
        .populate('ticketTypeId', 'name')
        .sort({ settledAt: -1 });
    }

    // Get summary stats
    const stats = {
      activeSellingCount: await Auction.countDocuments({ sellerId: userId, status: 'active' }),
      activeBiddingCount: await Bid.countDocuments({ bidderId: userId, status: 'active' }),
      totalWon: await Auction.countDocuments({ winnerId: userId, status: 'settled' }),
      totalSold: await Auction.countDocuments({ sellerId: userId, status: 'settled' }),
    };

    return NextResponse.json({
      success: true,
      selling: sellingAuctions,
      bidding: biddingAuctions,
      won: wonAuctions,
      stats,
    });
  } catch (error: any) {
    console.error('Get my auctions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get auctions' },
      { status: 500 }
    );
  }
}
