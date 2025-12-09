import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Listing, Ticket, Transaction, Royalty } from '@/lib/db/models';
import { transferTicket } from '@/lib/blockchain/ticket-nft';

/**
 * POST /api/buyer/listings/[id]/purchase
 * Purchase a resale ticket
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const listing = await Listing.findById(params.id);

    if (!listing || listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing not found or no longer available' },
        { status: 404 }
      );
    }

    // Can't buy your own listing
    if (listing.sellerId.toString() === auth.user!.id) {
      return NextResponse.json(
        { error: 'Cannot purchase your own listing' },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(listing.ticketId);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Get royalty configuration
    const royalty = await Royalty.findOne({ eventId: listing.eventId });

    // Calculate royalty distribution
    const totalPrice = listing.price;
    const platformFee = totalPrice * 0.05; // 5% platform fee
    
    let royaltyAmount = 0;
    if (royalty) {
      // On resale, distribute royalties
      royaltyAmount = totalPrice * (
        (royalty.organizerPercentage + 
         royalty.artistPercentage + 
         royalty.venuePercentage) / 100
      );
    }

    const sellerAmount = totalPrice - platformFee - royaltyAmount;

    // Mock payment processing
    console.log('[MOCK] Processing resale payment:', {
      total: totalPrice,
      platformFee,
      royaltyAmount,
      sellerAmount,
    });

    // Transfer NFT ownership (gasless)
    const transferResult = await transferTicket(
      ticket.ownerAddress || auth.user!.walletAddress,
      auth.user!.walletAddress,
      ticket.tokenId,
      1
    );

    if (!transferResult.success) {
      return NextResponse.json(
        { error: 'Failed to transfer ticket' },
        { status: 500 }
      );
    }

    // Update ticket ownership
    ticket.buyerId = auth.user!.id;
    ticket.ownerAddress = auth.user!.walletAddress;
    ticket.status = 'ACTIVE';
    await ticket.save();

    // Update listing
    listing.status = 'SOLD';
    listing.soldAt = new Date();
    listing.buyerId = auth.user!.id;
    await listing.save();

    // Create transaction record
    const transaction = await Transaction.create({
      buyerId: auth.user!.id,
      sellerId: listing.sellerId,
      eventId: listing.eventId,
      ticketTypeId: listing.ticketTypeId,
      quantity: 1,
      totalAmount: totalPrice,
      currency: listing.currency,
      platformFee,
      royaltyAmount,
      status: 'COMPLETED',
      paymentMethod: 'UPI',
      txHash: transferResult.txHash,
      isResale: true,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Resale ticket purchased successfully',
      transaction: {
        id: transaction._id,
        totalAmount: totalPrice,
        txHash: transferResult.txHash,
      },
      ticket: {
        id: ticket._id,
        tokenId: ticket.tokenId,
        status: ticket.status,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Purchase resale ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to purchase ticket', details: error.message },
      { status: 500 }
    );
  }
}
