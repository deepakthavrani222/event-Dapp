import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Artist } from '@/lib/db/models/Artist';
import { User } from '@/lib/db/models/User';
import { Transaction } from '@/lib/db/models/Transaction';
import { GoldenTicketPurchase } from '@/lib/db/models/GoldenTicket';
import { Event } from '@/lib/db/models/Event';
import { verifyToken } from '@/lib/auth/jwt';

// GET - Get artist's audience analytics and segmentation data
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

    // Get artist profile
    const artist = await Artist.findOne({ userId: decoded.userId });
    if (!artist) {
      return NextResponse.json({ 
        success: false, 
        error: 'Artist profile not found' 
      }, { status: 404 });
    }

    // Get all events by this artist
    const events = await Event.find({ 
      organizerId: decoded.userId,
      status: { $in: ['approved', 'live', 'completed'] }
    }).select('_id title city startDate');

    // Get regular ticket holders
    const regularTickets = await Transaction.find({
      'eventDetails.organizerId': decoded.userId,
      status: 'completed'
    }).populate('buyerId', 'name email');

    // Get golden ticket holders
    const goldenTickets = await GoldenTicketPurchase.find({
      artistId: artist._id
    }).populate('buyerId', 'name email');

    // Aggregate audience data
    const audienceStats = {
      totalFans: regularTickets.length + goldenTickets.length,
      regularTicketHolders: regularTickets.length,
      goldenTicketHolders: goldenTickets.length,
      
      // City breakdown
      citiesBreakdown: await getCitiesBreakdown(decoded.userId),
      
      // Event breakdown
      eventsBreakdown: await getEventsBreakdown(events),
      
      // Ticket type breakdown
      ticketTypesBreakdown: await getTicketTypesBreakdown(decoded.userId),
      
      // Recent activity
      recentFans: await getRecentFans(decoded.userId, artist._id),
      
      // Engagement metrics
      engagementMetrics: {
        averageTicketsPerFan: await getAverageTicketsPerFan(decoded.userId, artist._id),
        repeatCustomers: await getRepeatCustomers(decoded.userId),
        goldenTicketConversionRate: goldenTickets.length / Math.max(regularTickets.length, 1) * 100
      }
    };

    // Segmentation options
    const segmentationOptions = {
      cities: audienceStats.citiesBreakdown.map(city => ({
        value: city.city,
        label: city.city,
        count: city.count
      })),
      events: events.map(event => ({
        value: event._id.toString(),
        label: event.title,
        count: audienceStats.eventsBreakdown.find(e => e.eventId === event._id.toString())?.count || 0
      })),
      ticketTypes: audienceStats.ticketTypesBreakdown.map(type => ({
        value: type.type,
        label: type.type,
        count: type.count
      }))
    };

    return NextResponse.json({
      success: true,
      audienceStats,
      segmentationOptions,
      events: events.map(event => ({
        id: event._id,
        title: event.title,
        city: event.city,
        date: event.startDate
      }))
    });

  } catch (error) {
    console.error('Get artist audience error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch audience data' 
    }, { status: 500 });
  }
}

// Helper functions for audience analytics
async function getCitiesBreakdown(organizerId: string) {
  try {
    const cities = await Transaction.aggregate([
      {
        $match: {
          'eventDetails.organizerId': organizerId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$eventDetails.city',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          city: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return cities;
  } catch (error) {
    console.error('Error getting cities breakdown:', error);
    return [];
  }
}

async function getEventsBreakdown(events: any[]) {
  try {
    const eventIds = events.map(e => e._id.toString());
    
    const breakdown = await Transaction.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$eventId',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          eventId: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return breakdown;
  } catch (error) {
    console.error('Error getting events breakdown:', error);
    return [];
  }
}

async function getTicketTypesBreakdown(organizerId: string) {
  try {
    const types = await Transaction.aggregate([
      {
        $match: {
          'eventDetails.organizerId': organizerId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$ticketDetails.type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    return types;
  } catch (error) {
    console.error('Error getting ticket types breakdown:', error);
    return [];
  }
}

async function getRecentFans(organizerId: string, artistId: string) {
  try {
    // Get recent regular ticket purchases
    const recentRegular = await Transaction.find({
      'eventDetails.organizerId': organizerId,
      status: 'completed'
    })
    .populate('buyerId', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recent golden ticket purchases
    const recentGolden = await GoldenTicketPurchase.find({
      artistId: artistId
    })
    .populate('buyerId', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

    // Combine and sort by date
    const allRecent = [
      ...recentRegular.map(t => ({
        name: t.buyerId?.name || 'Anonymous',
        email: t.buyerId?.email || '',
        type: 'regular',
        date: t.createdAt,
        amount: t.totalAmount
      })),
      ...recentGolden.map(t => ({
        name: t.buyerId?.name || 'Anonymous',
        email: t.buyerId?.email || '',
        type: 'golden',
        date: t.createdAt,
        amount: t.purchasePrice
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return allRecent;
  } catch (error) {
    console.error('Error getting recent fans:', error);
    return [];
  }
}

async function getAverageTicketsPerFan(organizerId: string, artistId: string) {
  try {
    const regularCount = await Transaction.countDocuments({
      'eventDetails.organizerId': organizerId,
      status: 'completed'
    });

    const goldenCount = await GoldenTicketPurchase.countDocuments({
      artistId: artistId
    });

    const uniqueFans = await Transaction.distinct('buyerId', {
      'eventDetails.organizerId': organizerId,
      status: 'completed'
    });

    const uniqueGoldenFans = await GoldenTicketPurchase.distinct('buyerId', {
      artistId: artistId
    });

    const totalUniqueFans = new Set([...uniqueFans, ...uniqueGoldenFans]).size;
    const totalTickets = regularCount + goldenCount;

    return totalUniqueFans > 0 ? (totalTickets / totalUniqueFans).toFixed(1) : 0;
  } catch (error) {
    console.error('Error calculating average tickets per fan:', error);
    return 0;
  }
}

async function getRepeatCustomers(organizerId: string) {
  try {
    const fanTicketCounts = await Transaction.aggregate([
      {
        $match: {
          'eventDetails.organizerId': organizerId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$buyerId',
          ticketCount: { $sum: 1 }
        }
      },
      {
        $match: {
          ticketCount: { $gt: 1 }
        }
      },
      {
        $count: 'repeatCustomers'
      }
    ]);

    return fanTicketCounts[0]?.repeatCustomers || 0;
  } catch (error) {
    console.error('Error getting repeat customers:', error);
    return 0;
  }
}