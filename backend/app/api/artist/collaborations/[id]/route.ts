import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Collaboration } from '@/lib/db/models/ArtistPerks';
import { Artist } from '@/lib/db/models/Artist';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const collaboration = await Collaboration.findById(params.id)
      .populate('initiatorId', 'artistName profileImage verificationStatus')
      .populate('collaboratorIds', 'artistName profileImage verificationStatus')
      .populate('eventId', 'title date venue');

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      collaboration
    });
  } catch (error: any) {
    console.error('Get collaboration error:', error);
    return NextResponse.json(
      { error: 'Failed to get collaboration' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { action, message, status } = await request.json();

    // Find artist by user ID
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    const collaboration = await Collaboration.findById(params.id);
    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    // Check if user is part of this collaboration
    const isParticipant = collaboration.initiatorId.equals(artist._id) || 
                         collaboration.collaboratorIds.some(id => id.equals(artist._id));
    
    if (!isParticipant) {
      return NextResponse.json({ error: 'Not authorized for this collaboration' }, { status: 403 });
    }

    if (action === 'respond') {
      // Accept or reject collaboration
      if (status === 'accepted') {
        collaboration.status = 'accepted';
        collaboration.timeline.acceptedAt = new Date();
      } else if (status === 'cancelled') {
        collaboration.status = 'cancelled';
      }
    } else if (action === 'message') {
      // Add message to collaboration
      collaboration.messages.push({
        senderId: artist._id,
        message,
        timestamp: new Date()
      });
    } else if (action === 'update_status') {
      collaboration.status = status;
      if (status === 'completed') {
        collaboration.timeline.completedAt = new Date();
      }
    }

    await collaboration.save();

    const updatedCollab = await Collaboration.findById(params.id)
      .populate('initiatorId', 'artistName profileImage verificationStatus')
      .populate('collaboratorIds', 'artistName profileImage verificationStatus');

    return NextResponse.json({
      success: true,
      collaboration: updatedCollab,
      message: 'Collaboration updated successfully'
    });
  } catch (error: any) {
    console.error('Update collaboration error:', error);
    return NextResponse.json(
      { error: 'Failed to update collaboration' },
      { status: 500 }
    );
  }
}