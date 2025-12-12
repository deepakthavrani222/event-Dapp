import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Ticket, Event, User, TicketType } from '@/lib/db/models';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * GET /api/admin/tickets
 * Get all tickets for admin dashboard
 */
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

    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get tickets with populated data
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get related data
    const ticketsWithDetails = await Promise.all(
      tickets.map(async (ticket: any) => {
        const event = await Event.findById(ticket.eventId).lean();
        const buyer = await User.findById(ticket.buyerId).lean();
        const ticketType = await TicketType.findById(ticket.ticketTypeId).lean();

        return {
          id: ticket._id.toString(),
          eventId: ticket.eventId?.toString(),
          eventTitle: event?.title || 'Unknown Event',
          eventImage: event?.image || null,
          buyerId: ticket.buyerId?.toString(),
          buyerName: buyer?.name || 'Unknown',
          buyerEmail: buyer?.email || '',
          ticketType: ticketType?.name || 'General',
          price: ticket.price || ticketType?.price || 0,
          status: ticket.status || 'ACTIVE',
          seatNumber: ticket.seatNumber,
          purchasedAt: ticket.createdAt,
          usedAt: ticket.usedAt,
        };
      })
    );

    // Get stats
    const totalTickets = await Ticket.countDocuments();
    const activeTickets = await Ticket.countDocuments({ status: 'ACTIVE' });
    const usedTickets = await Ticket.countDocuments({ status: 'USED' });
    const listedTickets = await Ticket.countDocuments({ status: 'LISTED' });

    return NextResponse.json({
      success: true,
      tickets: ticketsWithDetails,
      stats: {
        total: totalTickets,
        active: activeTickets,
        used: usedTickets,
        listed: listedTickets,
      },
      count: ticketsWithDetails.length,
    });

  } catch (error: any) {
    console.error('Get admin tickets error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch tickets' 
    }, { status: 500 });
  }
}
