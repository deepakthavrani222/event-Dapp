import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Listing, Ticket } from '@/lib/db/models';
import mongoose from 'mongoose';

/**
 * POST /api/buyer/listings/[id]/cancel
 * Cancel a resale listing
 */
export async function POST(
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
    
    console.log('Cancel listing request for ID:', id);
    console.log('User ID:', auth.user!.id);

    const listing = await Listing.findById(id);
    console.log('Found listing:', listing);

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    const sellerObjectId = new mongoose.Types.ObjectId(auth.user!.id);
    console.log('Seller ObjectId:', sellerObjectId.toString());
    console.log('Listing sellerId:', listing.sellerId?.toString());
    
    if (!listing.sellerId || listing.sellerId.toString() !== sellerObjectId.toString()) {
      return NextResponse.json(
        { success: false, error: 'You do not own this listing' },
        { status: 403 }
      );
    }

    // Check if listing is active
    if (listing.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Listing is not active' },
        { status: 400 }
      );
    }

    // Update listing status
    listing.status = 'cancelled';
    await listing.save();

    // Update ticket status back to ACTIVE
    await Ticket.findByIdAndUpdate(listing.ticketId, { status: 'ACTIVE' });

    return NextResponse.json({
      success: true,
      message: 'Listing cancelled successfully',
    });

  } catch (error: any) {
    console.error('Cancel listing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel listing' },
      { status: 500 }
    );
  }
}
