import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, Ticket, TicketType, Withdrawal } from '@/lib/db/models';

/**
 * GET /api/organizer/earnings
 * Get earnings summary for the organizer with Phase 4 features
 */
export async function GET(request: NextRequest) {
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

    // Get all events by this organizer
    const events = await Event.find({ organizerId: auth.user!.id });
    
    // Auto-mark past events as completed
    const now = new Date();
    for (const event of events) {
      if (event.status === 'approved' && new Date(event.date) < now) {
        event.status = 'completed';
        await event.save();
      }
    }
    
    // Calculate earnings
    let totalPrimarySales = 0;
    let totalRoyalties = 0;
    let totalTicketsSold = 0;
    let totalResales = 0;
    let lifetimeRoyalties = 0;
    
    const eventEarnings = await Promise.all(
      events.map(async (event) => {
        const ticketTypes = await TicketType.find({ eventId: event._id });
        const tickets = await Ticket.find({ eventId: event._id });
        
        // Calculate primary sales
        let eventPrimarySales = 0;
        let eventTicketsSold = 0;
        let eventResaleCount = 0;
        
        for (const ticket of tickets) {
          const ticketType = ticketTypes.find(tt => tt._id.toString() === ticket.ticketTypeId?.toString());
          if (ticketType) {
            eventPrimarySales += ticketType.price;
            eventTicketsSold++;
          }
          // Count resales (tickets that have been transferred)
          if (ticket.resaleHistory && ticket.resaleHistory.length > 0) {
            eventResaleCount += ticket.resaleHistory.length;
          }
        }
        
        // Calculate royalties from resales
        const eventRoyalties = event.totalRoyaltiesEarned || 0;
        
        totalPrimarySales += eventPrimarySales;
        totalRoyalties += eventRoyalties;
        totalTicketsSold += eventTicketsSold;
        totalResales += eventResaleCount;
        lifetimeRoyalties += eventRoyalties;
        
        // Mock feedback data (in production, would come from Feedback model)
        const avgRating = event.status === 'completed' ? 4.2 + Math.random() * 0.8 : undefined;
        const feedbackCount = event.status === 'completed' ? Math.floor(eventTicketsSold * 0.3) : undefined;
        
        return {
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.date,
          status: event.status,
          primarySales: eventPrimarySales,
          royalties: eventRoyalties,
          ticketsSold: eventTicketsSold,
          totalCapacity: ticketTypes.reduce((sum, tt) => sum + tt.totalSupply, 0),
          resaleCount: eventResaleCount,
          avgRating,
          feedbackCount,
          royaltySettings: event.royaltySettings,
        };
      })
    );

    // Platform fee (10%)
    const platformFee = totalPrimarySales * 0.10;
    const netEarnings = totalPrimarySales - platformFee + totalRoyalties;
    
    // Get withdrawal history
    let withdrawalHistory: any[] = [];
    try {
      const withdrawals = await Withdrawal.find({ userId: auth.user!.id }).sort({ createdAt: -1 }).limit(10);
      withdrawalHistory = withdrawals.map(w => ({
        id: w._id,
        amount: w.amount,
        method: w.method,
        status: w.status,
        createdAt: w.createdAt,
      }));
    } catch (e) {
      // Withdrawal model might not exist yet
      withdrawalHistory = [];
    }
    
    // Calculate pending withdrawal (net earnings minus already withdrawn)
    const totalWithdrawn = withdrawalHistory
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0);
    const pendingWithdrawal = Math.max(0, netEarnings - totalWithdrawn);

    // Count completed events
    const completedEvents = events.filter(e => e.status === 'completed').length;

    return NextResponse.json({
      success: true,
      earnings: {
        totalPrimarySales,
        totalRoyalties,
        platformFee,
        netEarnings,
        pendingWithdrawal,
        totalTicketsSold,
        totalEvents: events.length,
        completedEvents,
        approvedEvents: events.filter(e => e.status === 'approved').length,
        totalResales,
        lifetimeRoyalties,
      },
      eventEarnings,
      withdrawalHistory,
    });

  } catch (error: any) {
    console.error('Fetch earnings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings', details: error.message },
      { status: 500 }
    );
  }
}
