import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event } from '@/lib/db/models';

/**
 * POST /api/admin/events/[id]/reject
 * Reject an event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    const event = await Event.findById(params.id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    event.status = 'rejected';
    event.rejectionReason = reason || 'No reason provided';
    await event.save();

    return NextResponse.json({
      success: true,
      message: 'Event rejected successfully',
      event: {
        id: event._id,
        title: event.title,
        status: event.status,
        rejectionReason: event.rejectionReason,
      },
    });

  } catch (error: any) {
    console.error('Reject event error:', error);
    return NextResponse.json(
      { error: 'Failed to reject event', details: error.message },
      { status: 500 }
    );
  }
}
