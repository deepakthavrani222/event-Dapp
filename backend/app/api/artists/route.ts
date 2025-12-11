import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { Event } from '@/lib/db/models/Event';

// GET - Get all verified artists (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    
    // Build query for verified artists only
    const query: any = {
      verificationStatus: 'verified'
    };
    
    // Add genre filter
    if (genre && genre !== 'all') {
      query.genre = { $in: [genre] };
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { artistName: { $regex: search, $options: 'i' } },
        { realName: { $regex: search, $options: 'i' } },
        { genre: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Get artists with pagination
    const artists = await Artist.find(query)
      .select('artistName realName genre verificationStatus verifiedAt totalEvents totalTicketsSold fanCount averageRating profileImage')
      .sort({ verifiedAt: -1, fanCount: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Get upcoming shows count for each artist
    const artistsWithShows = await Promise.all(
      artists.map(async (artist) => {
        const upcomingShows = await Event.countDocuments({
          organizerId: artist.userId,
          status: { $in: ['approved', 'live'] },
          startDate: { $gt: new Date() }
        });
        
        return {
          id: artist._id,
          artistName: artist.artistName,
          realName: artist.realName,
          genre: artist.genre,
          verificationStatus: artist.verificationStatus,
          verifiedAt: artist.verifiedAt,
          totalEvents: artist.totalEvents,
          totalTicketsSold: artist.totalTicketsSold,
          fanCount: artist.fanCount,
          averageRating: artist.averageRating,
          profileImage: artist.profileImage,
          upcomingShows
        };
      })
    );
    
    // Get total count for pagination
    const totalCount = await Artist.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      artists: artistsWithShows,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get verified artists error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artists' 
    }, { status: 500 });
  }
}