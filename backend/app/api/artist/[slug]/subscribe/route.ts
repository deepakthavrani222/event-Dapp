import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { FanEngagement } from '@/lib/db/models/Artist';
import { verifyToken } from '@/lib/auth/jwt';

// POST - Subscribe to artist updates
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    
    const { slug } = params;
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

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

    // Check if already subscribed
    const existingSubscription = await FanEngagement.findOne({
      email: email,
      artistId: artist._id,
      type: 'subscription'
    });

    if (existingSubscription) {
      return NextResponse.json({
        success: true,
        message: 'Already subscribed to artist updates'
      });
    }

    // Create new subscription
    await FanEngagement.create({
      email: email,
      artistId: artist._id,
      type: 'subscription',
      metadata: {
        subscribedAt: new Date(),
        source: 'artist_profile'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${artist.artistName} updates`
    });

  } catch (error) {
    console.error('Subscribe to artist error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to subscribe to artist updates' 
    }, { status: 500 });
  }
}