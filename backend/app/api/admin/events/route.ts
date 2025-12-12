import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, User } from '@/lib/db/models';

/**
 * GET /api/admin/events
 * Get all events for admin review
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status) {
      // Case-insensitive status filter
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    const events = await Event.find(query)
      .populate('organizerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    const eventsWithDetails = events.map((event: any) => ({
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      city: event.city,
      date: event.date,
      time: event.time,
      status: event.status,
      rejectionReason: event.rejectionReason,
      createdAt: event.createdAt,
      organizer: event.organizerId ? {
        id: event.organizerId._id,
        name: event.organizerId.name,
        email: event.organizerId.email,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      events: eventsWithDetails,
      count: eventsWithDetails.length,
    });

  } catch (error: any) {
    console.error('Fetch events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    );
  }
}
