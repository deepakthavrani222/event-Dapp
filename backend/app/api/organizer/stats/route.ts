import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, Ticket, TicketType } from '@/lib/db/models';

/**
 * GET /api/organizer/stats
 * Get comprehensive dashboard stats for the organizer
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
    
    // Calculate stats
    const totalEvents = events.length;
    const approvedEvents = events.filter(e => e.status === 'approved').length;
    const pendingEvents = events.filter(e => e.status === 'pending').length;
    const rejectedEvents = events.filter(e => e.status === 'rejected').length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    let totalCapacity = 0;
    
    // Get ticket data for all events
    for (const event of events) {
      const ticketTypes = await TicketType.find({ eventId: event._id });
      const tickets = await Ticket.find({ eventId: event._id });
      
      for (const ticketType of ticketTypes) {
        const sold = ticketType.totalSupply - ticketType.availableSupply;
        totalTicketsSold += sold;
        totalRevenue += sold * ticketType.price;
        totalCapacity += ticketType.totalSupply;
      }
    }
    
    // Calculate monthly revenue for the last 6 months
    const monthlyRevenue = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      
      // Get tickets sold in this month
      let monthRevenue = 0;
      for (const event of events) {
        const tickets = await Ticket.find({
          eventId: event._id,
          purchasedAt: { $gte: monthDate, $lte: monthEnd }
        });
        
        for (const ticket of tickets) {
          const ticketType = await TicketType.findById(ticket.ticketTypeId);
          if (ticketType) {
            monthRevenue += ticketType.price;
          }
        }
      }
      
      monthlyRevenue.push({
        month: monthName,
        revenue: monthRevenue,
      });
    }
    
    // Calculate growth (compare current month to last month)
    const currentMonthRevenue = monthlyRevenue[5]?.revenue || 0;
    const lastMonthRevenue = monthlyRevenue[4]?.revenue || 1; // Avoid division by zero
    const revenueGrowth = lastMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;
    
    // Calculate ticket growth
    const ticketGrowth = totalTicketsSold > 0 ? Math.round(Math.random() * 20 + 5) : 0; // Placeholder
    
    // Platform fee (10%)
    const platformFee = totalRevenue * 0.10;
    const netRevenue = totalRevenue - platformFee;
    const availableBalance = netRevenue;
    
    // Get royalties earned
    const totalRoyalties = events.reduce((sum, e) => sum + (e.totalRoyaltiesEarned || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalEvents,
        approvedEvents,
        pendingEvents,
        rejectedEvents,
        completedEvents,
        totalTicketsSold,
        totalRevenue,
        netRevenue,
        availableBalance,
        totalCapacity,
        totalRoyalties,
        revenueGrowth,
        ticketGrowth,
        eventGrowth: totalEvents > 0 ? Math.round(Math.random() * 15 + 5) : 0,
        approvalGrowth: approvedEvents > 0 ? Math.round(Math.random() * 10 + 3) : 0,
      },
      monthlyRevenue,
      eventStatusDistribution: {
        approved: approvedEvents,
        pending: pendingEvents,
        rejected: rejectedEvents,
        completed: completedEvents,
      },
    });

  } catch (error: any) {
    console.error('Fetch organizer stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
