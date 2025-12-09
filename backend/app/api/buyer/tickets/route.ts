import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Ticket, Event, TicketType } from '@/lib/db/models';

/**
 * GET /api/buyer/tickets
 * Get all tickets owned by the buyer
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const tickets = await Ticket.find({
      buyerId: auth.user!.id,
    }).sort({ purchaseDate: -1 });

    // Get event and ticket type details
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await Event.findById(ticket.eventId);
        const ticketType = await TicketType.findById(ticket.ticketTypeId);

        return {
          id: ticket._id,
          tokenId: ticket.tokenId,
          status: ticket.status,
          price: ticket.price,
          currency: ticket.currency,
          purchaseDate: ticket.purchaseDate,
          usedAt: ticket.usedAt,
          txHash: ticket.txHash,
          event: event ? {
            id: event._id,
            title: event.title,
            venue: event.venue,
            startDate: event.startDate,
            status: event.status,
          } : null,
          ticketType: ticketType ? {
            name: ticketType.name,
            description: ticketType.description,
          } : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      tickets: ticketsWithDetails,
      count: ticketsWithDetails.length,
    });

  } catch (error: any) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets', details: error.message },
      { status: 500 }
    );
  }
}
