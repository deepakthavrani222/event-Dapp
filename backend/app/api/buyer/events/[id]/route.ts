import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Event, TicketType, User } from '@/lib/db/models';

/**
 * GET /api/buyer/events/[id]
 * Get single event details with ticket types
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const event = await Event.findById(params.id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Get organizer details
    const organizer = await User.findById(event.organizerId);

    // Get ticket types
    const ticketTypes = await TicketType.find({
      eventId: event._id,
      isActive: true,
    }).sort({ price: 1 });

    return NextResponse.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        date: event.date ? event.date.toISOString() : null,
        time: event.time || '00:00',
        startDate: event.date ? event.date.toISOString() : null, // For compatibility
        endDate: event.date ? event.date.toISOString() : null, // Using same date for end
        venue: {
          name: event.venue,
          city: event.city,
          state: event.city,
          address: event.location || event.venue,
        },
        city: event.city,
        location: event.location || event.venue,
        image: event.image || '/placeholder.svg',
        status: event.status,
        organizer: organizer ? {
          name: organizer.name,
          email: organizer.email,
        } : null,
        ticketTypes: ticketTypes.map(tt => ({
          id: tt._id,
          name: tt.name,
          description: tt.description || `${tt.name} ticket for ${event.title}`,
          price: tt.price,
          currency: tt.currency,
          totalSupply: tt.totalSupply,
          availableSupply: tt.availableSupply,
          maxPerWallet: tt.maxPerWallet || 10, // Default max per wallet
          tokenId: tt.tokenId,
          saleStartDate: tt.saleStartDate,
          saleEndDate: tt.saleEndDate,
        })),
      },
    });

  } catch (error: any) {
    console.error('Fetch event error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event', details: error.message },
      { status: 500 }
    );
  }
}
