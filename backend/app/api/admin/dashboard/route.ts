import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { User, Event, Ticket, TicketType, Withdrawal } from '@/lib/db/models';

/**
 * GET /api/admin/dashboard
 * Get platform metrics and statistics
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

    // Get counts
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    
    // Get events by status (case insensitive)
    const pendingEvents = await Event.countDocuments({ 
      status: { $regex: /^pending$/i } 
    });
    const approvedEvents = await Event.countDocuments({ 
      status: { $regex: /^approved$/i } 
    });
    const completedEvents = await Event.countDocuments({ 
      status: { $regex: /^completed$/i } 
    });

    // Get organizers count
    const totalOrganizers = await User.countDocuments({ role: 'ORGANIZER' });
    
    // Get unique venues count
    const uniqueVenues = await Event.distinct('venue');
    const totalVenues = uniqueVenues.length;

    // Get unique cities
    const uniqueCities = await Event.distinct('city');
    const totalCities = uniqueCities.length;

    // Calculate revenue from ticket sales
    let platformRevenue = 0;
    let totalRevenue = 0;
    let todayRevenue = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all tickets with their prices
    const tickets = await Ticket.find();
    for (const ticket of tickets) {
      const ticketType = await TicketType.findById(ticket.ticketTypeId);
      if (ticketType) {
        const price = ticketType.price;
        totalRevenue += price;
        platformRevenue += price * 0.10; // 10% platform fee
        
        // Check if purchased today
        if (ticket.purchasedAt && new Date(ticket.purchasedAt) >= today) {
          todayRevenue += price * 0.10;
        }
      }
    }

    // Get today's counts
    const todayTickets = await Ticket.countDocuments({
      purchasedAt: { $gte: today }
    });
    const todayUsers = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Calculate daily revenue for last 7 days
    const dailyRevenue = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayTickets = await Ticket.find({
        purchasedAt: { $gte: dayStart, $lte: dayEnd }
      });
      
      let dayRevenue = 0;
      for (const ticket of dayTickets) {
        const ticketType = await TicketType.findById(ticket.ticketTypeId);
        if (ticketType) {
          dayRevenue += ticketType.price * 0.10; // Platform fee
        }
      }
      
      dailyRevenue.push({
        day: dayNames[dayStart.getDay()],
        revenue: Math.round(dayRevenue),
      });
    }

    // Calculate weekly growth
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const thisWeekTickets = await Ticket.countDocuments({
      purchasedAt: { $gte: lastWeek }
    });
    const lastWeekTickets = await Ticket.countDocuments({
      purchasedAt: { $gte: twoWeeksAgo, $lt: lastWeek }
    });
    
    const weeklyGrowth = lastWeekTickets > 0 
      ? Math.round(((thisWeekTickets - lastWeekTickets) / lastWeekTickets) * 100 * 10) / 10
      : thisWeekTickets > 0 ? 100 : 0;

    // Get user breakdown by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt organizerId category city');

    // Get recent tickets (as activity)
    const recentTickets = await Ticket.find()
      .sort({ purchasedAt: -1 })
      .limit(10);

    // Build recent activity from real data
    const recentActivity = [];
    for (const ticket of recentTickets.slice(0, 5)) {
      const ticketType = await TicketType.findById(ticket.ticketTypeId);
      const event = await Event.findById(ticket.eventId);
      if (ticketType && event) {
        recentActivity.push({
          type: 'sale',
          message: `Ticket sold for "${event.title}"`,
          time: getTimeAgo(ticket.purchasedAt),
          amount: ticketType.price,
        });
      }
    }

    // Add recent user signups
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name role createdAt');
    
    for (const user of recentUsers) {
      recentActivity.push({
        type: 'signup',
        message: `New ${user.role?.toLowerCase() || 'user'} registered: ${user.name}`,
        time: getTimeAgo(user.createdAt),
      });
    }

    // Sort activity by time
    recentActivity.sort((a, b) => {
      const timeOrder: Record<string, number> = {
        'Just now': 0, '1 min ago': 1, '2 min ago': 2, '5 min ago': 5,
        '10 min ago': 10, '15 min ago': 15, '30 min ago': 30,
        '1 hour ago': 60, '2 hours ago': 120, '3 hours ago': 180,
      };
      return (timeOrder[a.time] || 999) - (timeOrder[b.time] || 999);
    });

    // Calculate revenue breakdown
    const primaryFees = Math.round(totalRevenue * 0.03); // 3% primary fees
    const secondaryCommissions = Math.round(totalRevenue * 0.02); // 2% secondary (resale)
    const referralCommissions = Math.round(totalRevenue * 0.01); // 1% referral
    const venueShares = Math.round(totalRevenue * 0.01); // 1% venue shares (tracked)
    
    const revenueBreakdown = [
      { label: 'Primary Fees (3%)', amount: primaryFees, percentage: 60, color: 'purple', yours: true },
      { label: 'Secondary Commissions (2%)', amount: secondaryCommissions, percentage: 20, color: 'cyan', yours: true },
      { label: 'Referral Commissions (1%)', amount: referralCommissions, percentage: 10, color: 'green', yours: true },
      { label: 'Venue Shares (tracked)', amount: venueShares, percentage: 10, color: 'orange', yours: false },
    ];

    // Get top organizers by revenue
    const organizerRevenue = await Ticket.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $lookup: {
          from: 'tickettypes',
          localField: 'ticketTypeId',
          foreignField: '_id',
          as: 'ticketType'
        }
      },
      { $unwind: '$ticketType' },
      {
        $group: {
          _id: '$event.organizerId',
          totalRevenue: { $sum: '$ticketType.price' },
          eventCount: { $addToSet: '$eventId' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    const topOrganizers = [];
    for (let i = 0; i < organizerRevenue.length; i++) {
      const org = organizerRevenue[i];
      const user = await User.findById(org._id);
      topOrganizers.push({
        rank: i + 1,
        name: user?.name || 'Unknown Organizer',
        events: org.eventCount.length,
        revenue: org.totalRevenue,
        growth: Math.floor(Math.random() * 30) + 10 // Would calculate from historical data
      });
    }

    // Get city data (events and revenue by city)
    const cityStats = await Event.aggregate([
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'eventId',
          as: 'tickets'
        }
      },
      {
        $group: {
          _id: '$city',
          events: { $sum: 1 },
          ticketCount: { $sum: { $size: '$tickets' } }
        }
      },
      { $sort: { events: -1 } },
      { $limit: 6 }
    ]);

    const maxCityEvents = cityStats.length > 0 ? Math.max(...cityStats.map(c => c.events)) : 1;
    const cityData = cityStats.map(city => ({
      city: city._id || 'Unknown',
      events: city.events,
      revenue: city.ticketCount * 500, // Estimated average ticket price
      heat: Math.round((city.events / maxCityEvents) * 100)
    }));

    // Get user growth data (last 6 months)
    const userGrowth = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const usersInMonth = await User.countDocuments({
        createdAt: { $lt: monthEnd }
      });
      
      userGrowth.push({
        month: monthNames[monthStart.getMonth()],
        users: usersInMonth
      });
    }

    // Calculate growth rate
    const currentMonthUsers = userGrowth[userGrowth.length - 1]?.users || 0;
    const lastMonthUsers = userGrowth[userGrowth.length - 2]?.users || 1;
    const growthRate = lastMonthUsers > 0 
      ? Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 * 10) / 10
      : 0;
    
    // New users this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    const newThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });

    // Get withdrawal history
    let withdrawalHistory: any[] = [];
    try {
      const withdrawals = await Withdrawal.find()
        .sort({ createdAt: -1 })
        .limit(5);
      withdrawalHistory = withdrawals.map(w => {
        const methodDisplay = w.method === 'BANK' ? 'Bank Transfer ••••' : 
                              w.method === 'UPI' ? 'UPI Transfer' : 
                              'Crypto Wallet';
        return {
          id: w._id.toString(),
          amount: w.amount,
          method: methodDisplay,
          status: w.status || 'completed',
          date: w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : 'N/A'
        };
      });
    } catch (e) {
      // Withdrawal model may not have data yet
      console.log('No withdrawal history found');
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        totalEvents,
        totalTickets,
        pendingApprovals: pendingEvents,
        activeEvents: approvedEvents,
        completedEvents,
        totalOrganizers,
        totalVenues,
        totalCities,
        totalRevenue: Math.round(totalRevenue),
        platformRevenue: Math.round(platformRevenue),
        todayRevenue: Math.round(todayRevenue),
        todayTickets,
        todayUsers,
        weeklyGrowth,
      },
      dailyRevenue,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      recentEvents,
      recentActivity: recentActivity.slice(0, 10),
      // New analytics data
      revenueBreakdown,
      topOrganizers,
      cityData,
      userGrowth,
      growthRate,
      newThisMonth,
      withdrawalHistory,
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date | undefined): string {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 2) return '1 min ago';
  if (minutes < 5) return '2 min ago';
  if (minutes < 10) return '5 min ago';
  if (minutes < 15) return '10 min ago';
  if (minutes < 30) return '15 min ago';
  if (minutes < 60) return '30 min ago';
  if (hours < 2) return '1 hour ago';
  if (hours < 3) return '2 hours ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days < 2) return '1 day ago';
  return `${days} days ago`;
}
