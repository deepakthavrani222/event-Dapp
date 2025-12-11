import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { FanEngagement } from '@/lib/db/models/FanEngagement';
import { Event } from '@/lib/db/models/Event';
import { Transaction } from '@/lib/db/models/Transaction';
import { verifyAuth } from '@/lib/auth/verify';

// GET - Get artist analytics dashboard
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const artist = await Artist.findOne({ userId: authResult.user.id });
    
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    // Get time range from query params
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '30d'; // 7d, 30d, 90d, 1y
    
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get artist's events
    const events = await Event.find({ 
      organizerId: authResult.user.id,
      createdAt: { $gte: startDate }
    }).select('title startDate ticketsSold revenue status');

    // Get fan engagement data
    const fanEngagements = await FanEngagement.find({ 
      artistId: artist._id.toString(),
      lastInteraction: { $gte: startDate }
    });

    // Get revenue data
    const transactions = await Transaction.find({
      eventId: { $in: events.map(e => e._id) },
      status: 'COMPLETED',
      createdAt: { $gte: startDate }
    });

    // Calculate metrics
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTicketsSold = transactions.length;
    const totalFans = fanEngagements.length;
    
    // Fan tier distribution
    const fanTiers = fanEngagements.reduce((acc, fan) => {
      acc[fan.fanTier] = (acc[fan.fanTier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top events by revenue
    const eventRevenue = events.map(event => {
      const eventTransactions = transactions.filter(t => 
        t.eventId?.toString() === event._id.toString()
      );
      const revenue = eventTransactions.reduce((sum, t) => sum + t.amount, 0);
      const ticketsSold = eventTransactions.length;
      
      return {
        eventId: event._id,
        title: event.title,
        date: event.startDate,
        revenue,
        ticketsSold,
        status: event.status
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Revenue trend (daily for last 30 days)
    const revenueTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayTransactions = transactions.filter(t => 
        t.createdAt >= dayStart && t.createdAt <= dayEnd
      );
      
      const dayRevenue = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const dayTickets = dayTransactions.length;
      
      revenueTrend.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue,
        tickets: dayTickets
      });
    }

    // Top spending fans
    const topFans = fanEngagements
      .sort((a, b) => b.totalAmountSpent - a.totalAmountSpent)
      .slice(0, 10)
      .map(fan => ({
        userId: fan.userId,
        totalSpent: fan.totalAmountSpent,
        ticketsPurchased: fan.totalTicketsPurchased,
        fanTier: fan.fanTier,
        fanSince: fan.fanSince
      }));

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalRevenue,
          totalTicketsSold,
          totalFans,
          averageTicketPrice: totalTicketsSold > 0 ? Math.round(totalRevenue / totalTicketsSold) : 0,
          royaltyPercentage: artist.royaltyPercentage,
          estimatedRoyalties: Math.round(totalRevenue * (artist.royaltyPercentage / 100))
        },
        fanMetrics: {
          totalFans,
          fanTiers,
          newFansThisPeriod: fanEngagements.filter(f => f.fanSince >= startDate).length,
          averageSpendPerFan: totalFans > 0 ? Math.round(totalRevenue / totalFans) : 0
        },
        events: {
          totalEvents: events.length,
          upcomingEvents: events.filter(e => new Date(e.startDate) > now).length,
          topEvents: eventRevenue.slice(0, 5)
        },
        trends: {
          revenueTrend,
          timeRange
        },
        topFans
      }
    });

  } catch (error) {
    console.error('Get artist analytics error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    }, { status: 500 });
  }
}