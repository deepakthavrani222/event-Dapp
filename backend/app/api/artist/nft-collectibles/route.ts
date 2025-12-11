import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { NFTCollectible } from '@/lib/db/models/ArtistPerks';
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

    const collectibles = await NFTCollectible.find({ artistId: artist._id })
      .populate('eventId', 'title date venue')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      collectibles
    });
  } catch (error: any) {
    console.error('Get NFT collectibles error:', error);
    return NextResponse.json(
      { error: 'Failed to get NFT collectibles' },
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

    const {
      collectionName,
      description,
      totalSupply,
      basePrice,
      royaltyPercentage,
      metadata,
      rarityTiers,
      eventId,
      launchDate
    } = await request.json();

    // Find artist by user ID
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    // Create NFT collectible
    const collectible = await NFTCollectible.create({
      artistId: artist._id,
      eventId: eventId || undefined,
      collectionName,
      description,
      totalSupply,
      basePrice,
      royaltyPercentage: royaltyPercentage || 10,
      metadata,
      rarityTiers: rarityTiers || [
        { tier: 'Common', percentage: 60, multiplier: 1 },
        { tier: 'Rare', percentage: 25, multiplier: 2 },
        { tier: 'Epic', percentage: 10, multiplier: 5 },
        { tier: 'Legendary', percentage: 5, multiplier: 10 }
      ],
      launchDate: launchDate ? new Date(launchDate) : new Date(),
      isActive: true
    });

    const populatedCollectible = await NFTCollectible.findById(collectible._id)
      .populate('eventId', 'title date venue');

    return NextResponse.json({
      success: true,
      collectible: populatedCollectible,
      message: 'NFT collectible created successfully'
    });
  } catch (error: any) {
    console.error('Create NFT collectible error:', error);
    return NextResponse.json(
      { error: 'Failed to create NFT collectible' },
      { status: 500 }
    );
  }
}