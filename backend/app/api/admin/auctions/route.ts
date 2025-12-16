import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Auction, Bid, User } from '@/lib/db/models';

/**
 * GET /api/admin/auctions
 * Get all auctions for admin monitoring
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, ['admin']);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const auctions = await Auction.find(query)
      .populate('ticketId')
      .populate('sellerId', 'name email walletAddress')
      .populate('eventId', 'title date')
      .populate('ticketTypeId', 'name')
      .populate('currentBidderId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Auction.countDocuments(query);

    // Get stats
    const stats = {
      total: await Auction.countDocuments(),
      active: await Auction.countDocuments({ status: 'active' }),
      settled: await Auction.countDocuments({ status: 'settled' }),
      cancelled: await Auction.countDocuments({ status: 'cancelled' }),
      totalBids: await Bid.countDocuments(),
      totalVolumeEth: await Auction.aggregate([
        { $match: { status: 'settled' } },
        { $group: { _id: null, total: { $sum: '$finalPriceEth' } } }
      ]).then(r => r[0]?.total || 0),
    };

    return NextResponse.json({
      success: true,
      auctions,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin get auctions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get auctions' },
      { status: 500 }
    );
  }
}
