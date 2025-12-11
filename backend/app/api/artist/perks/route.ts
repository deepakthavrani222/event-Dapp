import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ArtistTier, calculateArtistTier } from '@/lib/db/models/ArtistPerks';
import { Artist } from '@/lib/db/models/Artist';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find artist by user ID
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    // Get or calculate artist tier
    let artistTier = await ArtistTier.findOne({ artistId: artist._id })
      .populate('artistId', 'artistName profileImage verificationStatus');

    if (!artistTier || artistTier.nextReviewAt < new Date()) {
      // Recalculate tier
      await calculateArtistTier(artist._id.toString());
      artistTier = await ArtistTier.findOne({ artistId: artist._id })
        .populate('artistId', 'artistName profileImage verificationStatus');
    }

    return NextResponse.json({
      success: true,
      artistTier,
      tierBenefits: {
        bronze: {
          featuredHomepage: false,
          priorityApproval: false,
          collabTools: false,
          nftCollectibles: false,
          customBadge: false,
          exclusiveEvents: false
        },
        silver: {
          featuredHomepage: false,
          priorityApproval: false,
          collabTools: true,
          nftCollectibles: false,
          customBadge: true,
          exclusiveEvents: false
        },
        gold: {
          featuredHomepage: true,
          priorityApproval: true,
          collabTools: true,
          nftCollectibles: true,
          customBadge: true,
          exclusiveEvents: false
        },
        platinum: {
          featuredHomepage: true,
          priorityApproval: true,
          collabTools: true,
          nftCollectibles: true,
          customBadge: true,
          exclusiveEvents: true
        },
        diamond: {
          featuredHomepage: true,
          priorityApproval: true,
          collabTools: true,
          nftCollectibles: true,
          customBadge: true,
          exclusiveEvents: true
        }
      }
    });
  } catch (error: any) {
    console.error('Get artist perks error:', error);
    return NextResponse.json(
      { error: 'Failed to get artist perks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { action } = await request.json();

    // Find artist by user ID
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    if (action === 'recalculate') {
      const tierData = await calculateArtistTier(artist._id.toString());
      
      return NextResponse.json({
        success: true,
        message: 'Artist tier recalculated successfully',
        tierData
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Update artist perks error:', error);
    return NextResponse.json(
      { error: 'Failed to update artist perks' },
      { status: 500 }
    );
  }
}