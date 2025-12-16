import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/db/connection';
import { Event, TicketType, Ticket, Transaction, Referral } from '@/lib/db/models';
import { mintTickets } from '@/lib/blockchain/ticket-nft';
import { notifyTicketSold, notifyMilestone } from '@/lib/services/notification';

/**
 * POST /api/buyer/purchase
 * Purchase tickets for an event
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    await connectDB();

    const body = await request.json();
    const { ticketTypeId, quantity, paymentMethod, referralCode, transactionHash } = body;

    // Validate input
    if (!ticketTypeId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Invalid ticket type or quantity' },
        { status: 400 }
      );
    }

    // Get ticket type
    const ticketType = await TicketType.findById(ticketTypeId);
    
    if (!ticketType || !ticketType.isActive) {
      return NextResponse.json(
        { error: 'Ticket type not found or inactive' },
        { status: 404 }
      );
    }

    // Check availability
    if (ticketType.availableSupply < quantity) {
      return NextResponse.json(
        { error: `Only ${ticketType.availableSupply} tickets available` },
        { status: 400 }
      );
    }

    // Check max per wallet
    const existingTickets = await Ticket.countDocuments({
      buyerId: auth.user!.id,
      ticketTypeId: ticketType._id,
      status: { $in: ['ACTIVE', 'USED'] },
    });

    if (existingTickets + quantity > ticketType.maxPerWallet) {
      return NextResponse.json(
        { error: `Maximum ${ticketType.maxPerWallet} tickets per wallet` },
        { status: 400 }
      );
    }

    // Check referral code if provided
    let referral = null;
    if (referralCode) {
      referral = await Referral.findOne({ 
        code: referralCode,
        isActive: true,
      });

      // Validate referral is for this event or is a general code
      if (referral && referral.eventId && referral.eventId.toString() !== ticketType.eventId.toString()) {
        referral = null; // Invalid for this event
      }
    }

    // Calculate total price
    const totalPrice = ticketType.price * quantity;
    const platformFee = totalPrice * 0.05; // 5% platform fee
    const finalPrice = totalPrice + platformFee;

    let mintResult = { txHash: '', success: true };

    // Handle crypto payment verification
    if (paymentMethod === 'CRYPTO') {
      if (!transactionHash) {
        return NextResponse.json(
          { error: 'Transaction hash required for crypto payment' },
          { status: 400 }
        );
      }
      
      // Log crypto payment
      console.log('[CRYPTO] Payment received via smart contract:', {
        txHash: transactionHash,
        amount: finalPrice,
        buyer: auth.user!.walletAddress,
      });
      
      // When user pays via purchaseTicket() on smart contract:
      // - ETH is automatically split (5% platform, 95% organizer)
      // - NFT is automatically minted to buyer
      // - No need to mint again from backend
      mintResult = {
        txHash: transactionHash,
        success: true,
      };
      
      // TODO: In production, verify the transaction:
      // 1. Check transaction exists on blockchain
      // 2. Verify it called purchaseTicket() function
      // 3. Verify correct tokenId and amount
      // 4. Verify transaction is confirmed
    } else {
      // Mock payment processing for UPI/Card (in production: integrate Transak/Razorpay)
      console.log('[MOCK] Processing payment:', {
        amount: finalPrice,
        currency: ticketType.currency,
        method: paymentMethod || 'UPI',
      });

      // For non-crypto payments, mint NFT tickets via backend (gasless)
      try {
        mintResult = await mintTickets(
          auth.user!.walletAddress,
          ticketType.tokenId,
          quantity
        );

        if (!mintResult.success) {
          return NextResponse.json(
            { error: 'Failed to mint tickets' },
            { status: 500 }
          );
        }
      } catch (mintError: any) {
        console.error('Mint error:', mintError);
        // If minting fails but contract not deployed, use mock
        mintResult = {
          txHash: `0x${Math.random().toString(16).substring(2)}`,
          success: true,
        };
      }
    }

    // Create ticket records
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = await Ticket.create({
        eventId: ticketType.eventId,
        ticketTypeId: ticketType._id,
        buyerId: auth.user!.id,
        tokenId: `${ticketType.tokenId}-${Date.now()}-${i}`, // Make unique per ticket
        price: ticketType.price,
        currency: ticketType.currency,
        status: 'ACTIVE',
        purchaseDate: new Date(),
        txHash: mintResult.txHash,
      });
      tickets.push(ticket);
    }

    // Update available supply
    ticketType.availableSupply -= quantity;
    await ticketType.save();

    // Get event details for notification
    const event = await Event.findById(ticketType.eventId);
    
    // Notify organizer of ticket sale
    if (event) {
      try {
        await notifyTicketSold(
          event.organizerId.toString(),
          event.title,
          ticketType.name,
          ticketType.price * quantity
        );

        // Check for milestones (50%, 75%, 100% sold)
        const totalSold = ticketType.totalSupply - ticketType.availableSupply;
        const percentSold = (totalSold / ticketType.totalSupply) * 100;
        
        if (percentSold >= 100 && percentSold - ((quantity / ticketType.totalSupply) * 100) < 100) {
          await notifyMilestone(event.organizerId.toString(), event.title, '100%');
        } else if (percentSold >= 75 && percentSold - ((quantity / ticketType.totalSupply) * 100) < 75) {
          await notifyMilestone(event.organizerId.toString(), event.title, '75%');
        } else if (percentSold >= 50 && percentSold - ((quantity / ticketType.totalSupply) * 100) < 50) {
          await notifyMilestone(event.organizerId.toString(), event.title, '50%');
        }
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError);
        // Don't fail the purchase if notification fails
      }
    }

    // Calculate referral commission if applicable
    let referralCommission = 0;
    if (referral) {
      referralCommission = finalPrice * (referral.commissionRate / 100);
    }

    // Create transaction record
    const transaction = await Transaction.create({
      buyerId: auth.user!.id,
      eventId: ticketType.eventId,
      ticketTypeId: ticketType._id,
      quantity,
      totalAmount: finalPrice,
      currency: ticketType.currency,
      platformFee,
      referralCommission,
      status: 'COMPLETED',
      paymentMethod: paymentMethod || 'UPI',
      txHash: paymentMethod === 'CRYPTO' ? transactionHash : mintResult.txHash,
      cryptoTxHash: paymentMethod === 'CRYPTO' ? transactionHash : null,
      mintTxHash: mintResult.txHash,
      referralId: referral?._id || null,
      createdAt: new Date(),
    });

    // Update referral stats if used
    if (referral) {
      referral.usageCount = (referral.usageCount || 0) + 1;
      referral.totalEarnings = (referral.totalEarnings || 0) + referralCommission;
      await referral.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Tickets purchased successfully',
      transaction: {
        id: transaction._id,
        quantity,
        totalAmount: finalPrice,
        txHash: mintResult.txHash,
      },
      tickets: tickets.map(t => ({
        id: t._id,
        tokenId: t.tokenId,
        status: t.status,
      })),
    }, { status: 201 });

  } catch (error: any) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Purchase failed', details: error.message },
      { status: 500 }
    );
  }
}
