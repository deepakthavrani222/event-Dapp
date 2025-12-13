import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { Event } from '@/lib/db/models/Event';

// GET - Get public artists list (no auth required)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'verified';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');
    const genre = url.searchParams.get('genre');
    const search = url.searchParams.get('search');

    // Build query
    const query: any = {};
    
    // Only show verified artists by default for public
    if (status === 'verified') {
      query.verificationStatus = 'verified';
    } else if (status === 'all') {
      // Show all artists (for admin or special cases)
    } else {
      query.verificationStatus = status;
    }

    // Filter by genre
    if (genre) {
      query.genre = { $in: [genre] };
    }

    // Search by name
    if (search) {
      query.$or = [
        { artistName: { $regex: search, $options: 'i' } },
        { realName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get artists with pagination
    const artists = await Artist.find(query)
      .sort({ fanCount: -1, totalRevenue: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get user details and upcoming events count for each artist
    const artistsWithDetails = await Promise.all(
      artists.map(async (artist) => {
        const userData = await User.findById(artist.userId).select('name email');
        
        // Count upcoming events for this artist
        const upcomingEventsCount = await Event.countDocuments({
          organizerId: artist.userId,
          startDate: { $gte: new Date() },
          status: { $in: ['approved', 'published'] }
        });

        return {
          id: artist._id,
          userId: artist.userId,
          artistName: artist.artistName,
          realName: artist.realName,
          userName: userData?.name,
          bio: artist.bio,
          genre: artist.genre,
          profileImage: artist.profileImage,
          coverImage: artist.coverImage,
          socialLinks: artist.socialLinks,
          verificationStatus: artist.verificationStatus,
          verifiedAt: artist.verifiedAt,
          totalEvents: artist.totalEvents || 0,
          upcomingEvents: upcomingEventsCount,
          totalTicketsSold: artist.totalTicketsSold || 0,
          totalRevenue: artist.totalRevenue || 0,
          fanCount: artist.fanCount || 0,
          averageRating: artist.averageRating || 0,
          royaltyPercentage: artist.royaltyPercentage,
          canCreateGoldenTickets: artist.canCreateGoldenTickets,
          createdAt: artist.createdAt
        };
      })
    );

    const totalArtists = await Artist.countDocuments(query);

    return NextResponse.json({
      success: true,
      artists: artistsWithDetails,
      pagination: {
        page,
        limit,
        total: totalArtists,
        pages: Math.ceil(totalArtists / limit)
      }
    });

  } catch (error) {
    console.error('Get public artists error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artists' 
    }, { status: 500 });
  }
}
