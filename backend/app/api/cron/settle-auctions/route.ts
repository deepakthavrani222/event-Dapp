import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Auction, Bid, Ticket, User, Transaction } from '@/lib/db/models';
import { settleAuctionOnChain } from '@/lib/blockchain/auction';
import { transferTicket } from '@/lib/blockchain/ticket-nft';
import { 
  notifyAuctionWon, 
  notifyAuctionSold, 
  notifyAuctionEnded 
} from '@/lib/services/notification';

/**
 * POST /api/cron/settle-auctions
 * Settle all ended auctions (called by cron job or manually)
 * 
 * Can be triggered by:
 * - Vercel Cron
 * - External cron service
 * - Manual admin trigger
 */
export async function POST(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const now = new Date();
    
    // Find all ended but unsettled auctions
    const endedAuctions = await Auction.find({
      status: 'active',
      endTime: { $lte: now },
    }).populate('ticketId').populate('eventId');

    const results = {
      processed: 0,
      settled: 0,
      noBids: 0,
      reserveNotMet: 0,
      errors: [] as string[],
    };

    for (const auction of endedAuctions) {
      try {
        results.processed++;

        const ticket = await Ticket.findById(auction.ticketId);
        const reserveMet = !auction.reservePriceEth || auction.currentBidEth >= auction.reservePriceEth;
        const hasWinner = auction.currentBidderId && auction.currentBidEth > 0;

        if (hasWinner && reserveMet) {
          // Winner exists and reserve met - complete the sale
          const winner = await User.findById(auction.currentBidderId);
          const seller = await User.findById(auction.sellerId);

          // Calculate fee distribution
          const totalAmount = auction.currentBidEth;
          const platformFee = totalAmount * (auction.platformFeePercent / 10000);
          const organizerRoyalty = totalAmount * (auction.organizerRoyaltyPercent / 10000);
          const artistRoyalty = totalAmount * (auction.artistRoyaltyPercent / 10000);
          const sellerProceeds = totalAmount - platformFee - organizerRoyalty - artistRoyalty;

          // Update auction status
          auction.status = 'settled';
          auction.winnerId = auction.currentBidderId;
          auction.finalPriceEth = auction.currentBidEth;
          auction.settledAt = now;
          await auction.save();

          // Update winning bid status
          await Bid.updateOne(
            { auctionId: auction._id, bidderId: auction.currentBidderId, status: 'active' },
            { status: 'won' }
          );

          // Transfer ticket ownership
          if (ticket) {
            ticket.buyerId = auction.currentBidderId;
            ticket.ownerAddress = winner?.walletAddress;
            ticket.status = 'ACTIVE';
            await ticket.save();

            // On-chain transfer
            try {
              if (seller?.walletAddress && winner?.walletAddress) {
                await transferTicket(
                  seller.walletAddress,
                  winner.walletAddress,
                  ticket.tokenId,
                  1
                );
              }
            } catch (chainError) {
              console.error('On-chain transfer failed:', chainError);
            }
          }

          // Create transaction record
          await Transaction.create({
            buyerId: auction.currentBidderId,
            eventId: auction.eventId,
            ticketTypeId: auction.ticketTypeId,
            quantity: 1,
            totalAmount: totalAmount,
            currency: 'ETH',
            platformFee,
            referralCommission: 0,
            status: 'COMPLETED',
            paymentMethod: 'ETH_AUCTION',
          });

          // Settle on-chain if exists
          if (auction.onChainAuctionId) {
            try {
              await settleAuctionOnChain(auction.onChainAuctionId);
            } catch (chainError) {
              console.error('On-chain settle failed:', chainError);
            }
          }

          // Send notifications
          const eventTitle = (auction.eventId as any)?.title || 'Event';
          
          notifyAuctionWon(
            auction.currentBidderId.toString(),
            auction._id.toString(),
            auction.currentBidEth,
            eventTitle
          ).catch(console.error);

          notifyAuctionSold(
            auction.sellerId.toString(),
            auction._id.toString(),
            auction.currentBidEth,
            sellerProceeds,
            eventTitle
          ).catch(console.error);

          results.settled++;

        } else {
          // No winner or reserve not met
          const newStatus = !hasWinner ? 'no_bids' : 'reserve_not_met';
          
          auction.status = newStatus;
          auction.settledAt = now;
          await auction.save();

          // Return ticket to seller
          if (ticket) {
            ticket.status = 'ACTIVE';
            await ticket.save();
          }

          // Refund any bids (mark as refunded)
          if (auction.currentBidderId) {
            await Bid.updateMany(
              { auctionId: auction._id },
              { status: 'refunded', refundedAt: now }
            );
          }

          // Notify seller
          const eventTitle = (auction.eventId as any)?.title || 'Event';
          notifyAuctionEnded(
            auction.sellerId.toString(),
            auction._id.toString(),
            eventTitle,
            false
          ).catch(console.error);

          if (newStatus === 'no_bids') {
            results.noBids++;
          } else {
            results.reserveNotMet++;
          }
        }

      } catch (auctionError: any) {
        console.error(`Error settling auction ${auction._id}:`, auctionError);
        results.errors.push(`${auction._id}: ${auctionError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} auctions`,
      results,
    });

  } catch (error: any) {
    console.error('Settle auctions cron error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to settle auctions' },
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request);
}
