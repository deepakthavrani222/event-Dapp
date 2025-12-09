import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole, unauthorizedResponse, forbiddenResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, TicketType, Royalty } from '@/lib/db/models';
import { generateTokenId } from '@/lib/utils/token-id';

/**
 * POST /api/organizer/events
 * Create a new event with ticket types
 * Only ORGANIZER and ADMIN roles can access
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      title,
      description,
      category,
      venue,
      startDate,
      endDate,
      ticketTypes,
      royaltySplit,
    } = body;

    // Validate required fields
    if (!title || !venue || !startDate || !ticketTypes || ticketTypes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: title, venue, startDate, ticketTypes' },
        { status: 400 }
      );
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      category: category || 'OTHER',
      organizerId: auth.user!.id,
      venue: {
        name: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        country: venue.country || 'India',
        capacity: venue.capacity,
      },
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      status: 'pending',
      createdAt: new Date(),
    });

    // Create ticket types with unique token IDs
    const createdTicketTypes = [];
    for (const ticketType of ticketTypes) {
      const tokenId = generateTokenId();
      
      const createdTicketType = await TicketType.create({
        eventId: event._id,
        name: ticketType.name,
        description: ticketType.description,
        price: ticketType.price,
        currency: ticketType.currency || 'INR',
        totalSupply: ticketType.totalSupply,
        availableSupply: ticketType.totalSupply,
        tokenId,
        maxPerWallet: ticketType.maxPerWallet || 10,
        saleStartDate: ticketType.saleStartDate ? new Date(ticketType.saleStartDate) : new Date(),
        saleEndDate: ticketType.saleEndDate ? new Date(ticketType.saleEndDate) : new Date(startDate),
        isActive: true,
      });

      createdTicketTypes.push(createdTicketType);
    }

    // Create royalty configuration
    const defaultRoyalty = {
      organizer: royaltySplit?.organizer || 70,
      artist: royaltySplit?.artist || 15,
      venue: royaltySplit?.venue || 10,
      platform: royaltySplit?.platform || 5,
    };

    await Royalty.create({
      eventId: event._id,
      organizerId: auth.user!.id,
      artistId: royaltySplit?.artistId,
      venueOwnerId: royaltySplit?.venueOwnerId,
      organizerPercentage: defaultRoyalty.organizer,
      artistPercentage: defaultRoyalty.artist,
      venuePercentage: defaultRoyalty.venue,
      platformPercentage: defaultRoyalty.platform,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        venue: event.venue,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
      },
      ticketTypes: createdTicketTypes.map(tt => ({
        id: tt._id,
        name: tt.name,
        price: tt.price,
        currency: tt.currency,
        totalSupply: tt.totalSupply,
        tokenId: tt.tokenId,
        maxPerWallet: tt.maxPerWallet,
      })),
      royaltySplit: defaultRoyalty,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/organizer/events
 * Get all events created by the organizer
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

    const events = await Event.find({ organizerId: auth.user!.id })
      .sort({ createdAt: -1 });

    const eventsWithTickets = await Promise.all(
      events.map(async (event) => {
        const ticketTypes = await TicketType.find({ eventId: event._id });
        return {
          id: event._id,
          title: event.title,
          description: event.description,
          category: event.category,
          venue: event.venue,
          startDate: event.startDate,
          endDate: event.endDate,
          status: event.status,
          ticketTypes: ticketTypes.map(tt => ({
            id: tt._id,
            name: tt.name,
            price: tt.price,
            totalSupply: tt.totalSupply,
            availableSupply: tt.availableSupply,
            tokenId: tt.tokenId,
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
