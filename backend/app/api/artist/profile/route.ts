import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { verifyAuth } from '@/lib/auth/verify';

// GET - Get artist profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await Artist.findOne({ userId: authResult.user.id });
    
    if (!artist) {
      // Return success: false with 200 status so frontend can handle gracefully
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found',
        artist: null
      });
    }

    return NextResponse.json({
      success: true,
      artist: {
        id: artist._id,
        userId: artist.userId,
        artistName: artist.artistName,
        realName: artist.realName,
        bio: artist.bio,
        genre: artist.genre,
        socialLinks: artist.socialLinks,
        verificationStatus: artist.verificationStatus,
        verifiedAt: artist.verifiedAt,
        totalEvents: artist.totalEvents,
        totalTicketsSold: artist.totalTicketsSold,
        totalRevenue: artist.totalRevenue,
        fanCount: artist.fanCount,
        averageRating: artist.averageRating,
        royaltyPercentage: artist.royaltyPercentage,
        canCreateGoldenTickets: artist.canCreateGoldenTickets,
        messagingEnabled: artist.messagingEnabled,
        goldenTicketPerks: artist.goldenTicketPerks,
        goldenTicketMultiplier: artist.goldenTicketMultiplier,
        createdAt: artist.createdAt,
      }
    });

  } catch (error) {
    console.error('Get artist profile error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch artist profile' 
    }, { status: 500 });
  }
}

// POST - Create or update artist profile
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      artistName,
      realName,
      bio,
      genre,
      socialLinks,
      goldenTicketPerks,
      messagingEnabled
    } = body;

    // Validation
    if (!artistName || !realName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist name and real name are required' 
      }, { status: 400 });
    }

    // Check if artist profile already exists
    let artist = await Artist.findOne({ userId: authResult.user.id });

    if (artist) {
      // Update existing profile
      artist.artistName = artistName;
      artist.realName = realName;
      artist.bio = bio || '';
      artist.genre = genre || [];
      artist.socialLinks = socialLinks || {};
      artist.goldenTicketPerks = goldenTicketPerks || [];
      artist.messagingEnabled = messagingEnabled !== undefined ? messagingEnabled : true;
      
      await artist.save();
    } else {
      // Create new artist profile
      artist = new Artist({
        userId: authResult.user.id,
        artistName,
        realName,
        bio: bio || '',
        genre: genre || [],
        socialLinks: socialLinks || {},
        goldenTicketPerks: goldenTicketPerks || [],
        messagingEnabled: messagingEnabled !== undefined ? messagingEnabled : true,
        verificationStatus: 'pending',
        royaltyPercentage: 15, // Default 15% for new artists
        canCreateGoldenTickets: false, // Enabled after verification
      });
      
      await artist.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Artist profile saved successfully',
      artist: {
        id: artist._id,
        artistName: artist.artistName,
        verificationStatus: artist.verificationStatus,
        canCreateGoldenTickets: artist.canCreateGoldenTickets,
      }
    });

  } catch (error) {
    console.error('Save artist profile error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save artist profile' 
    }, { status: 500 });
  }
}