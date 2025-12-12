import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Listing, Event, TicketType } from '@/lib/db/models';
import mongoose from 'mongoose';

/**
 * GET /api/buyer/my-listings
 * Get user's own resale listings
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    // Convert user ID string to ObjectId for proper matching
    const sellerObjectId = new mongoose.Types.ObjectId(auth.user!.id);

    const listings = await Listing.find({
      sellerId: sellerObjectId,
      status: 'active', // Only show active listings
    }).sort({ listedAt: -1 });

    // Get event and ticket type details
    const listingsWithDetails = await Promise.all(
      listings.map(async (listing) => {
        const event = await Event.findById(listing.eventId);
        const ticketType = await TicketType.findById(listing.ticketTypeId);

        return {
          id: listing._id.toString(),
          ticketId: listing.ticketId.toString(),
          price: listing.price,
          originalPrice: ticketType?.price || 0,
          currency: listing.currency,
          status: listing.status,
          listedAt: listing.listedAt,
          views: listing.views || 0,
          event: event ? {
            id: event._id,
            title: event.title,
            image: event.image,
            venue: event.venue,
            city: event.city,
            startDate: event.date,
          } : null,
          ticketType: ticketType ? {
            name: ticketType.name,
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
    console.error('Fetch my listings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings', details: error.message },
      { status: 500 }
    );
  }
}
