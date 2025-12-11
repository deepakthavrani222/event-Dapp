import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { ArtistMessage, MessageDelivery } from '@/lib/db/models/ArtistMessage';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { Transaction } from '@/lib/db/models/Transaction';
import { GoldenTicketPurchase } from '@/lib/db/models/GoldenTicket';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get artist's messages
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
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

    // Get artist profile
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Build query
    const query: any = { artistId: artist._id };
    if (status) {
      query.status = status;
    }

    // Get messages with pagination
    const messages = await ArtistMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await ArtistMessage.countDocuments(query);

    return NextResponse.json({
      success: true,
      messages: messages.map(message => ({
        id: message._id,
        title: message.title,
        content: message.content,
        segmentation: message.segmentation,
        deliveryChannels: message.deliveryChannels,
        status: message.status,
        scheduledFor: message.scheduledFor,
        analytics: message.analytics,
        nftDrop: message.nftDrop,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get artist messages error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch messages' 
    }, { status: 500 });
  }
}

// POST - Create new message
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
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

    // Get artist profile
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    // Check if artist is verified
    if (artist.verificationStatus !== 'verified') {
      return NextResponse.json({ 
        success: false, 
        error: 'Only verified artists can send messages' 
      }, { status: 403 });
    }

    const {
      title,
      content,
      richContent,
      segmentation,
      deliveryChannels,
      scheduledFor,
      nftDrop,
      sendImmediately = false
    } = await request.json();

    // Validate required fields
    if (!title || !content || !segmentation) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Calculate estimated reach based on segmentation
    const estimatedReach = await calculateEstimatedReach(artist._id, segmentation);

    // Create message
    const message = await ArtistMessage.create({
      artistId: artist._id,
      eventId: segmentation.criteria?.eventId,
      title,
      content,
      richContent,
      segmentation: {
        ...segmentation,
        estimatedReach
      },
      deliveryChannels: deliveryChannels || {
        email: true,
        push: true,
        inApp: true
      },
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status: sendImmediately ? 'sending' : (scheduledFor ? 'scheduled' : 'draft'),
      nftDrop: nftDrop || { enabled: false }
    });

    // If sending immediately, queue for delivery
    if (sendImmediately) {
      await queueMessageDelivery(message._id);
    }

    return NextResponse.json({
      success: true,
      message: 'Message created successfully',
      messageId: message._id,
      estimatedReach,
      status: message.status
    });

  } catch (error) {
    console.error('Create artist message error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create message' 
    }, { status: 500 });
  }
}

// Helper function to calculate estimated reach
async function calculateEstimatedReach(artistId: string, segmentation: any): Promise<number> {
  try {
    let query: any = {};

    switch (segmentation.type) {
      case 'all':
        // All ticket holders for this artist
        const allTickets = await Transaction.countDocuments({
          'eventDetails.organizerId': artistId,
          status: 'completed'
        });
        const allGoldenTickets = await GoldenTicketPurchase.countDocuments({
          artistId: artistId
        });
        return allTickets + allGoldenTickets;

      case 'event':
        // Specific event ticket holders
        if (segmentation.criteria?.eventId) {
          return await Transaction.countDocuments({
            eventId: segmentation.criteria.eventId,
            status: 'completed'
          });
        }
        break;

      case 'city':
        // Ticket holders from specific city
        if (segmentation.criteria?.city) {
          return await Transaction.countDocuments({
            'eventDetails.organizerId': artistId,
            'eventDetails.city': segmentation.criteria.city,
            status: 'completed'
          });
        }
        break;

      case 'golden_only':
        // Only golden ticket holders
        return await GoldenTicketPurchase.countDocuments({
          artistId: artistId
        });

      case 'ticket_type':
        // Specific ticket type holders
        if (segmentation.criteria?.ticketType) {
          return await Transaction.countDocuments({
            'eventDetails.organizerId': artistId,
            'ticketDetails.type': segmentation.criteria.ticketType,
            status: 'completed'
          });
        }
        break;

      default:
        return 0;
    }

    return 0;
  } catch (error) {
    console.error('Error calculating estimated reach:', error);
    return 0;
  }
}

// Helper function to queue message delivery
async function queueMessageDelivery(messageId: string) {
  try {
    // In a real application, this would queue the message for background processing
    // For now, we'll just update the status
    await ArtistMessage.findByIdAndUpdate(messageId, {
      status: 'sent',
      'analytics.totalSent': 1 // Mock data
    });
    
    console.log(`Message ${messageId} queued for delivery`);
  } catch (error) {
    console.error('Error queueing message delivery:', error);
  }
}