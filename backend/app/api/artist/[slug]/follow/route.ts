import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { FanEngagement } from '@/lib/db/models/Artist';
import { verifyToken } from '@/lib/auth/jwt';

// POST - Follow/Unfollow artist
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    // Verify user authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

    const { slug } = params;
    const { action } = await request.json(); // 'follow' or 'unfollow'
    
    // Find artist by slug
    const artist = await Artist.findOne({
      $or: [
        { artistName: { $regex: new RegExp(slug.replace(/-/g, ' '), 'i') } },
        { artistName: { $regex: new RegExp(slug, 'i') } }
      ],
      verificationStatus: 'verified'
    });
    
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 });
    }

    if (action === 'follow') {
      // Check if already following
      const existingFollow = await FanEngagement.findOne({
        userId: decoded.userId,
        artistId: artist._id,
        type: 'follow'
      });

      if (!existingFollow) {
        // Create new follow
        await FanEngagement.create({
          userId: decoded.userId,
          artistId: artist._id,
          type: 'follow',
          metadata: {
            followedAt: new Date()
          }
        });

        // Increment artist fan count
        await Artist.findByIdAndUpdate(artist._id, {
          $inc: { fanCount: 1 }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully followed artist',
        following: true
      });

    } else if (action === 'unfollow') {
      // Remove follow
      const deleted = await FanEngagement.findOneAndDelete({
        userId: decoded.userId,
        artistId: artist._id,
        type: 'follow'
      });

      if (deleted) {
        // Decrement artist fan count
        await Artist.findByIdAndUpdate(artist._id, {
          $inc: { fanCount: -1 }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully unfollowed artist',
        following: false
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 });

  } catch (error) {
    console.error('Follow/unfollow artist error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update follow status' 
    }, { status: 500 });
  }
}

// GET - Check if user is following artist
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    // Verify user authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ 
        success: true, 
        following: false 
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: true, 
        following: false 
      });
    }

    const { slug } = params;
    
    // Find artist by slug
    const artist = await Artist.findOne({
      $or: [
        { artistName: { $regex: new RegExp(slug.replace(/-/g, ' '), 'i') } },
        { artistName: { $regex: new RegExp(slug, 'i') } }
      ],
      verificationStatus: 'verified'
    });
    
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist not found' 
      }, { status: 404 });
    }

    // Check if following
    const following = await FanEngagement.findOne({
      userId: decoded.userId,
      artistId: artist._id,
      type: 'follow'
    });

    return NextResponse.json({
      success: true,
      following: !!following
    });

  } catch (error) {
    console.error('Check follow status error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check follow status' 
    }, { status: 500 });
  }
}