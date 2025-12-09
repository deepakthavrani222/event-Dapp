import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event } from '@/lib/db/models';

/**
 * POST /api/admin/events/approve
 * Approve or reject an event
 * Only ADMIN role can access
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const hasAccess = requireRole(auth.user!.role, ['ADMIN']);
  
  if (!hasAccess) {
    return forbiddenResponse('Admin access required');
  }

  try {
    await connectDB();

    const body = await request.json();
    const { eventId, action, rejectionReason } = body;

    if (!eventId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      event.status = 'approved';
      event.rejectionReason = undefined;
    } else {
      event.status = 'rejected';
      event.rejectionReason = rejectionReason || 'No reason provided';
    }

    await event.save();

    return NextResponse.json({
      success: true,
      message: `Event ${action}d successfully`,
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
        rejectionReason: event.rejectionReason,
      },
    });

  } catch (error: any) {
    console.error('Event approval error:', error);
    return NextResponse.json(
      { error: 'Failed to update event status', details: error.message },
      { status: 500 }
    );
  }
}
