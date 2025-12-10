import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, Ticket, User } from '@/lib/db/models';

/**
 * POST /api/organizer/events/[id]/message
 * Send a message to all ticket holders
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ORGANIZER', 'ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse('Organizer access required');
  }

  try {
    await connectDB();

    const event = await Event.findById(params.id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify ownership
    if (auth.user!.role !== 'ADMIN' && event.organizerId.toString() !== auth.user!.id) {
      return forbiddenResponse('You do not own this event');
    }

    const body = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Get all unique ticket holders
    const tickets = await Ticket.find({ 
      eventId: event._id,
      status: { $in: ['valid', 'used'] }
    }).populate('userId');

    // Get unique user IDs
    const uniqueUserIds = [...new Set(tickets.map(t => t.userId?.toString()).filter(Boolean))];
    
    // Get user details
    const users = await User.find({ _id: { $in: uniqueUserIds } });

    // TODO: Send actual email/push notifications
    // For now, just log the message
    console.log(`Sending message to ${users.length} ticket holders for event ${event.title}`);
    console.log(`Message: ${message}`);

    // In production, you would:
    // 1. Send email via SendGrid/SES
    // 2. Send push notification via Firebase/OneSignal
    // 3. Store message in database for history

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      recipientCount: users.length,
      eventTitle: event.title,
    });

  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    );
  }
}
