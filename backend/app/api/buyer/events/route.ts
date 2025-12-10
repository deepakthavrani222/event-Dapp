import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Event, TicketType } from '@/lib/db/models';

/**
 * GET /api/buyer/events
 * Browse all published events (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    // Build query - Only show approved events
    const query: any = {
      status: 'approved',
      date: { $gte: new Date() }, // Only future events
    };

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (city) {
      query.city = city;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .limit(50);

    // Get ticket types for each event
    const eventsWithTickets = await Promise.all(
      events.map(async (event) => {
        const ticketTypes = await TicketType.find({
          eventId: event._id,
          isActive: true,
        });

        // Calculate min price
        const minPrice = ticketTypes.length > 0
          ? Math.min(...ticketTypes.map(tt => tt.price))
          : 0;

        // Calculate total available tickets
        const totalAvailable = ticketTypes.reduce(
          (sum, tt) => sum + tt.availableSupply,
          0
        );

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          category: event.category,
          date: event.date ? event.date.toISOString() : null,
          time: event.time || '00:00',
          startDate: event.date ? event.date.toISOString() : null, // For EventCard compatibility
          venue: {
            name: event.venue,
            city: event.city,
            state: event.city, // Using city as state for now
          },
          city: event.city,
          location: event.location || event.venue,
          image: event.image || '/placeholder.svg',
          status: event.status,
          minPrice,
          price: minPrice, // For OpenSeaEventCard compatibility
          totalAvailable,
          availableTickets: totalAvailable, // For OpenSeaEventCard compatibility
          totalTickets: ticketTypes.reduce((sum, tt) => sum + tt.totalSupply, 0),
          isLive: false, // Default values for OpenSeaEventCard
          trending: Math.random() > 0.7, // Random trending status for demo
          ticketTypes: ticketTypes.map(tt => ({
            id: tt._id,
            name: tt.name,
            price: tt.price,
            currency: tt.currency,
            availableSupply: tt.availableSupply,
            totalSupply: tt.totalSupply,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      events: eventsWithTickets,
      count: eventsWithTickets.length,
    });

  } catch (error: any) {
    console.error('Fetch events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    );
  }
}
