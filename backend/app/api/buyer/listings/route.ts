import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Listing, Event, TicketType, User } from '@/lib/db/models';

/**
 * GET /api/buyer/listings
 * Browse resale listings (public)
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const query: any = { status: 'ACTIVE' };
    
    if (eventId) {
      query.eventId = eventId;
    }

    const listings = await Listing.find(query)
      .sort({ listedAt: -1 })
      .limit(50);

    // Get event and ticket type details
    const listingsWithDetails = await Promise.all(
      listings.map(async (listing) => {
        const event = await Event.findById(listing.eventId);
        const ticketType = await TicketType.findById(listing.ticketTypeId);
        const seller = await User.findById(listing.sellerId);

        return {
          id: listing._id,
          price: listing.price,
          currency: listing.currency,
          status: listing.status,
          listedAt: listing.listedAt,
          event: event ? {
            id: event._id,
            title: event.title,
            venue: event.venue,
            startDate: event.startDate,
          } : null,
          ticketType: ticketType ? {
            name: ticketType.name,
            originalPrice: ticketType.price,
          } : null,
          seller: seller ? {
            name: seller.name,
          } : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      listings: listingsWithDetails,
      count: listingsWithDetails.length,
    });

  } catch (error: any) {
    console.error('Fetch listings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error.message },
      { status: 500 }
    );
  }
}
