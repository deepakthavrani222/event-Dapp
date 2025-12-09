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
        venue: event.venue,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        organizer: organizer ? {
          name: organizer.name,
          email: organizer.email,
        } : null,
        ticketTypes: ticketTypes.map(tt => ({
          id: tt._id,
          name: tt.name,
          description: tt.description,
          price: tt.price,
          currency: tt.currency,
          totalSupply: tt.totalSupply,
          availableSupply: tt.availableSupply,
          maxPerWallet: tt.maxPerWallet,
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
