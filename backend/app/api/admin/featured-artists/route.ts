import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { FeaturedRotation, ArtistTier } from '@/lib/db/models/ArtistPerks';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Get current featured artists
    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    }

    const featuredArtists = await FeaturedRotation.find(query)
      .populate({
        path: 'artistId',
        select: 'artistName profileImage verificationStatus socialLinks',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ position: 1 });

    // Get eligible artists for featuring (Gold tier and above)
    const eligibleArtists = await ArtistTier.find({
      tier: { $in: ['gold', 'platinum', 'diamond'] },
      'perks.featuredHomepage': true
    })
      .populate({
        path: 'artistId',
        select: 'artistName profileImage verificationStatus socialLinks',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ tierScore: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      featuredArtists,
      eligibleArtists: eligibleArtists.map(tier => ({
        ...tier.toObject(),
        artist: tier.artistId
      }))
    });
  } catch (error: any) {
    console.error('Get featured artists error:', error);
    return NextResponse.json(
      { error: 'Failed to get featured artists' },
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

    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { artistId, position, startDate, endDate, action } = await request.json();

    if (action === 'feature') {
      // Check if position is already taken
      const existingFeature = await FeaturedRotation.findOne({
        position,
        isActive: true,
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) }
      });

      if (existingFeature) {
        return NextResponse.json({ 
          error: `Position ${position} is already occupied during this time period` 
        }, { status: 400 });
      }

      // Create featured rotation
      const featuredRotation = await FeaturedRotation.create({
        artistId,
        position,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0
        }
      });

      const populatedFeature = await FeaturedRotation.findById(featuredRotation._id)
        .populate({
          path: 'artistId',
          select: 'artistName profileImage verificationStatus',
          populate: {
            path: 'userId',
            select: 'name email'
          }
        });

      return NextResponse.json({
        success: true,
        featuredRotation: populatedFeature,
        message: 'Artist featured successfully'
      });
    } else if (action === 'remove') {
      // Remove from featured rotation
      await FeaturedRotation.findByIdAndUpdate(artistId, { isActive: false });

      return NextResponse.json({
        success: true,
        message: 'Artist removed from featured rotation'
      });
    } else if (action === 'auto_rotate') {
      // Auto-rotate featured artists based on tier scores
      const topArtists = await ArtistTier.find({
        tier: { $in: ['gold', 'platinum', 'diamond'] },
        'perks.featuredHomepage': true
      })
        .populate('artistId', 'artistName profileImage verificationStatus')
        .sort({ tierScore: -1 })
        .limit(5);

      // Clear current rotation
      await FeaturedRotation.updateMany({ isActive: true }, { isActive: false });

      // Create new rotation
      const rotations = [];
      for (let i = 0; i < Math.min(topArtists.length, 5); i++) {
        const rotation = await FeaturedRotation.create({
          artistId: topArtists[i].artistId._id,
          position: i + 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          isActive: true,
          metrics: { impressions: 0, clicks: 0, conversions: 0 }
        });
        rotations.push(rotation);
      }

      return NextResponse.json({
        success: true,
        rotations,
        message: `Auto-rotated ${rotations.length} featured artists`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Manage featured artists error:', error);
    return NextResponse.json(
      { error: 'Failed to manage featured artists' },
      { status: 500 }
    );
  }
}