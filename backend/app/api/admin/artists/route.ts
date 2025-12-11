import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { verifyAuth } from '@/lib/auth/verify';

// GET - Get all artists for admin review
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await User.findById(authResult.user.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const query: any = {};
    if (status !== 'all') {
      query.verificationStatus = status;
    }

    const artists = await Artist.find(query)
      .sort({ verificationSubmittedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get user details for each artist
    const artistsWithUserData = await Promise.all(
      artists.map(async (artist) => {
        const userData = await User.findById(artist.userId).select('name email');
        return {
          id: artist._id,
          userId: artist.userId,
          userName: userData?.name || 'Unknown',
          userEmail: userData?.email || 'Unknown',
          artistName: artist.artistName,
          realName: artist.realName,
          bio: artist.bio,
          genre: artist.genre,
          socialLinks: artist.socialLinks,
          verificationStatus: artist.verificationStatus,
          verificationDocuments: {
            idProof: artist.verificationDocuments?.idProof,
            artistProof: artist.verificationDocuments?.artistProof,
            additionalDocs: artist.verificationDocuments?.additionalDocs || []
          },
          verificationSubmittedAt: artist.verificationSubmittedAt,
          verifiedAt: artist.verifiedAt,
          rejectionReason: artist.rejectionReason,
          totalEvents: artist.totalEvents,
          totalRevenue: artist.totalRevenue,
          fanCount: artist.fanCount,
          royaltyPercentage: artist.royaltyPercentage,
          createdAt: artist.createdAt
        };
      })
    );

    const totalArtists = await Artist.countDocuments(query);

    // Get counts for different statuses
    const statusCounts = await Artist.aggregate([
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      artists: artistsWithUserData,
      pagination: {
        page,
        limit,
        total: totalArtists,
        pages: Math.ceil(totalArtists / limit)
      },
      statusCounts: {
        pending: counts.pending || 0,
        verified: counts.verified || 0,
        rejected: counts.rejected || 0,
        total: Object.values(counts).reduce((sum, count) => sum + count, 0)
      }
    });

  } catch (error) {
    console.error('Get artists for admin error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artists' 
    }, { status: 500 });
  }
}