import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Ticket, Event, TicketType } from '@/lib/db/models';

/**
 * GET /api/inspector/history
 * Get check-in history for the inspector
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  const roleCheck = requireRole(auth.user!, ['INSPECTOR', 'ADMIN']);
  if (!roleCheck.authorized) {
    return unauthorizedResponse(roleCheck.error);
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: any = {
      status: 'USED',
      checkedInBy: auth.user!.id,
    };

    if (eventId) {
      query.eventId = eventId;
    }

    // Get tickets checked in by this inspector
    const tickets = await Ticket.find(query)
      .sort({ usedAt: -1 })
      .limit(limit);

    // Get event and ticket type details
    const historyWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await Event.findById(ticket.eventId);
        const ticketType = await TicketType.findById(ticket.ticketTypeId);

        return {
          id: ticket._id,
          tokenId: ticket.tokenId,
          usedAt: ticket.usedAt,
          event: event ? {
            id: event._id,
            title: event.title,
            venue: event.venue,
            startDate: event.startDate,
          } : null,
          ticketType: ticketType ? {
            name: ticketType.name,
            price: ticketType.price,
          } : null,
        };
      })
    );

    // Calculate stats
    const totalCheckedIn = tickets.length;
    const uniqueEvents = new Set(tickets.map(t => t.eventId.toString())).size;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = tickets.filter(t => t.usedAt && t.usedAt >= todayStart).length;

    return NextResponse.json({
      success: true,
      history: historyWithDetails,
      stats: {
        totalCheckedIn,
        uniqueEvents,
        todayCount,
      },
    });

  } catch (error: any) {
    console.error('Fetch history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history', details: error.message },
      { status: 500 }
    );
  }
}
