import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, Ticket, User } from '@/lib/db/models';

/**
 * POST /api/organizer/events/[id]/cancel
 * Cancel an event and trigger refunds
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

    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Event is already cancelled' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Cancellation reason is required' }, { status: 400 });
    }

    // Update event status
    event.status = 'cancelled';
    event.rejectionReason = `Cancelled by organizer: ${reason}`;
    await event.save();

    // Get all valid tickets for this event
    const tickets = await Ticket.find({ 
      eventId: event._id,
      status: 'valid'
    }).populate('userId');

    // Process refunds (97% refund to buyers)
    const refundPromises = tickets.map(async (ticket) => {
      // Mark ticket as refunded
      ticket.status = 'refunded';
      await ticket.save();

      // TODO: Process actual refund via payment gateway
      // For now, just log the refund
      console.log(`Refund processed for ticket ${ticket._id}, user ${ticket.userId}`);
    });

    await Promise.all(refundPromises);

    // TODO: Send email notifications to all ticket holders
    // "Event cancelled – refund processing."

    return NextResponse.json({
      success: true,
      message: 'Event cancelled successfully. Refunds are being processed.',
      refundsProcessed: tickets.length,
      refundAmount: '97% of ticket price',
    });

  } catch (error: any) {
    console.error('Cancel event error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel event', details: error.message },
      { status: 500 }
    );
  }
}
