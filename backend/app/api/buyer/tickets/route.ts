import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Ticket, Event, TicketType } from '@/lib/db/models';
import { GoldenTicketPurchase, GoldenTicketTemplate } from '@/lib/db/models/GoldenTicket';
import { Artist } from '@/lib/db/models/Artist';

/**
 * GET /api/buyer/tickets
 * Get all tickets owned by the buyer (including golden tickets)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    // Fetch regular tickets
    const tickets = await Ticket.find({
      buyerId: auth.user!.id,
    }).sort({ purchaseDate: -1 });

    // Get event and ticket type details for regular tickets
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
          isGolden: false,
          event: event ? {
            id: event._id,
            title: event.title,
            venue: event.venue,
            city: event.city,
            image: event.image,
            startDate: event.date,
            status: event.status,
          } : null,
          ticketType: ticketType ? {
            name: ticketType.name,
            description: ticketType.description,
          } : null,
        };
      })
    );

    // Fetch golden ticket purchases
    const goldenPurchases = await GoldenTicketPurchase.find({
      buyerId: auth.user!.id,
    }).sort({ purchaseDate: -1 });

    // Get golden ticket details
    const goldenTicketsWithDetails = await Promise.all(
      goldenPurchases.map(async (purchase) => {
        const template = await GoldenTicketTemplate.findById(purchase.templateId);
        const artist = await Artist.findById(purchase.artistId);
        const event = template?.eventId ? await Event.findById(template.eventId) : null;

        return {
          id: purchase._id,
          tokenId: purchase.tokenId,
          status: purchase.status,
          price: purchase.purchasePrice,
          currency: 'INR',
          purchaseDate: purchase.purchaseDate,
          usedAt: purchase.usedAt,
          txHash: purchase.txHash,
          isGolden: true,
          perks: purchase.perksRedeemed || template?.perks || [],
          event: event ? {
            id: event._id,
            title: event.title,
            venue: event.venue,
            city: event.city,
            image: event.image,
            startDate: event.date,
            status: event.status,
          } : {
            id: template?._id || purchase._id,
            title: template?.name || `Golden Ticket - ${artist?.name || 'Artist'}`,
            venue: artist?.name || 'Artist Experience',
            city: 'Multiple Locations',
            image: template?.image || artist?.profileImage || '/golden-ticket-default.jpg',
            startDate: template?.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ACTIVE',
          },
          ticketType: {
            name: 'Golden VIP',
            description: template?.description || 'Exclusive Golden Ticket with special perks',
          },
          artist: artist ? {
            id: artist._id,
            name: artist.name,
            image: artist.profileImage,
          } : null,
        };
      })
    );

    // Combine all tickets
    const allTickets = [...ticketsWithDetails, ...goldenTicketsWithDetails];
    
    // Sort by purchase date (newest first)
    allTickets.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    return NextResponse.json({
      success: true,
      tickets: allTickets,
      count: allTickets.length,
      regularCount: ticketsWithDetails.length,
      goldenCount: goldenTicketsWithDetails.length,
    });

  } catch (error: any) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets', details: error.message },
      { status: 500 }
    );
  }
}
