import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, TicketType } from '@/lib/db/models';

/**
 * POST /api/organizer/events/[id]/toggle-sales
 * Pause or resume ticket sales for an event
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
    const { paused } = body;

    // Update all ticket types for this event
    await TicketType.updateMany(
      { eventId: event._id },
      { isActive: !paused }
    );

    return NextResponse.json({
      success: true,
      message: paused ? 'Sales paused successfully' : 'Sales resumed successfully',
      salesPaused: paused,
    });

  } catch (error: any) {
    console.error('Toggle sales error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle sales', details: error.message },
      { status: 500 }
    );
  }
}
