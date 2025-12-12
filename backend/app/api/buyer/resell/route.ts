import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Ticket, Listing, TicketType } from '@/lib/db/models';

/**
 * POST /api/buyer/resell
 * List a ticket for resale
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const body = await request.json();
    const { ticketId, price } = body;

    if (!ticketId || !price || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid ticket ID or price' },
        { status: 400 }
      );
    }

    // Get ticket
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (ticket.buyerId.toString() !== auth.user!.id) {
      return NextResponse.json(
        { success: false, error: 'You do not own this ticket' },
        { status: 403 }
      );
    }

    // Check if ticket is active
    if (ticket.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: `Ticket is not available for resale (status: ${ticket.status})` },
        { status: 400 }
      );
    }

    // Check if already listed (active)
    const existingActiveListing = await Listing.findOne({
      ticketId: ticket._id,
      status: 'active',
    });

    if (existingActiveListing) {
      return NextResponse.json(
        { success: false, error: 'Ticket is already listed for resale' },
        { status: 400 }
      );
    }

    // Get ticket type for royalty calculation
    const ticketType = await TicketType.findById(ticket.ticketTypeId);

    const mongoose = await import('mongoose');
    
    // Check if there's a cancelled/sold listing for this ticket (reactivate it)
    const existingListing = await Listing.findOne({ ticketId: ticket._id });
    
    let listing;
    if (existingListing) {
      // Reactivate the existing listing with new price
      existingListing.price = price;
      existingListing.status = 'active';
      existingListing.listedAt = new Date();
      existingListing.sellerId = new mongoose.Types.ObjectId(auth.user!.id);
      existingListing.eventId = ticket.eventId;
      existingListing.ticketTypeId = ticket.ticketTypeId;
      await existingListing.save();
      listing = existingListing;
    } else {
      // Create new listing
      listing = await Listing.create({
        ticketId: ticket._id,
        sellerId: new mongoose.Types.ObjectId(auth.user!.id),
        eventId: ticket.eventId,
        ticketTypeId: ticket.ticketTypeId,
        price,
        currency: ticket.currency || 'INR',
        status: 'active',
        listedAt: new Date(),
      });
    }

    // Update ticket status
    ticket.status = 'LISTED';
    await ticket.save();

    return NextResponse.json({
      success: true,
      message: 'Ticket listed for resale',
      listing: {
        id: listing._id,
        price,
        currency: listing.currency,
        status: listing.status,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('List ticket error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to list ticket', 
        details: error.stack 
      },
      { status: 500 }
    );
  }
}
