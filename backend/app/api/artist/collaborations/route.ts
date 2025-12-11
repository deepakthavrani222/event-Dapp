import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Collaboration } from '@/lib/db/models/ArtistPerks';
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    // Find artist by user ID
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    // Build query
    const query: any = {
      $or: [
        { initiatorId: artist._id },
        { collaboratorIds: artist._id }
      ]
    };

    if (status !== 'all') {
      query.status = status;
    }

    const collaborations = await Collaboration.find(query)
      .populate('initiatorId', 'artistName profileImage verificationStatus')
      .populate('collaboratorIds', 'artistName profileImage verificationStatus')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      collaborations
    });
  } catch (error: any) {
    console.error('Get collaborations error:', error);
    return NextResponse.json(
      { error: 'Failed to get collaborations' },
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
      title,
      description,
      collaboratorIds,
      collabType,
      revenueShare,
      responsibilities,
      startDate,
      endDate
    } = await request.json();

    // Find artist by user ID
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    // Validate collaborators exist
    const collaborators = await Artist.find({ _id: { $in: collaboratorIds } });
    if (collaborators.length !== collaboratorIds.length) {
      return NextResponse.json({ error: 'Some collaborators not found' }, { status: 400 });
    }

    // Create collaboration
    const collaboration = await Collaboration.create({
      title,
      description,
      initiatorId: artist._id,
      collaboratorIds,
      collabType,
      terms: {
        revenueShare: revenueShare || [],
        responsibilities: responsibilities || []
      },
      timeline: {
        proposedAt: new Date(),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      },
      status: 'proposed'
    });

    const populatedCollab = await Collaboration.findById(collaboration._id)
      .populate('initiatorId', 'artistName profileImage verificationStatus')
      .populate('collaboratorIds', 'artistName profileImage verificationStatus');

    return NextResponse.json({
      success: true,
      collaboration: populatedCollab,
      message: 'Collaboration proposal created successfully'
    });
  } catch (error: any) {
    console.error('Create collaboration error:', error);
    return NextResponse.json(
      { error: 'Failed to create collaboration' },
      { status: 500 }
    );
  }
}