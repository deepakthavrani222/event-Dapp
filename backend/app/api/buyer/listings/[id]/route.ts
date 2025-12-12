import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Listing, Event, TicketType } from '@/lib/db/models';
import mongoose from 'mongoose';

/**
 * GET /api/buyer/listings/[id]
 * Get a specific listing details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    const event = await Event.findById(listing.eventId);
    const ticketType = await TicketType.findById(listing.ticketTypeId);

    return NextResponse.json({
      success: true,
      listing: {
        id: listing._id.toString(),
        ticketId: listing.ticketId.toString(),
        price: listing.price,
        originalPrice: ticketType?.price || 0,
        currency: listing.currency,
        status: listing.status,
        listedAt: listing.listedAt,
        views: listing.views || 0,
        event: event ? {
          id: event._id.toString(),
          title: event.title,
          image: event.image,
          venue: event.venue,
          city: event.city,
          date: event.date,
        } : null,
        ticketType: ticketType ? {
          name: ticketType.name,
          price: ticketType.price,
        } : null,
      },
    });

  } catch (error: any) {
    console.error('Get listing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get listing' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/buyer/listings/[id]
 * Update listing price
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { price } = body;

    if (!price || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid price' },
        { status: 400 }
      );
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const sellerObjectId = new mongoose.Types.ObjectId(auth.user!.id);
    if (!listing.sellerId || listing.sellerId.toString() !== sellerObjectId.toString()) {
      return NextResponse.json(
        { success: false, error: 'You do not own this listing' },
        { status: 403 }
      );
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Cannot update inactive listing' },
        { status: 400 }
      );
    }

    // Update price
    listing.price = price;
    await listing.save();

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully',
      listing: {
        id: listing._id.toString(),
        price: listing.price,
      },
    });

  } catch (error: any) {
    console.error('Update listing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update listing' },
      { status: 500 }
    );
  }
}
