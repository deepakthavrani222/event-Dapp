import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connection';
import { Auction, Bid, Ticket, User, Transaction } from '@/lib/db/models';
import { settleAuctionOnChain } from '@/lib/blockchain/auction';
import { transferTicket } from '@/lib/blockchain/ticket-nft';
import { createNotification } from '@/lib/services/notification';
import mongoose from 'mongoose';

/**
 * POST /api/buyer/auctions/[auctionId]/settle
 * Settle an ended auction (can be called by anyone)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ auctionId: string }> }
) {
  try {
    await connectDB();
    const { auctionId } = await params;

    const auction = await Auction.findById(auctionId)
      .populate('ticketId')
      .populate('eventId');

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Auction not found' },
        { status: 404 }
      );
    }

    // Check auction has ended
    const now = new Date();
    if (now < auction.endTime && auction.status === 'active') {
      return NextResponse.json(
        { success: false, error: 'Auction has not ended yet' },
        { status: 400 }
      );
    }

    // Check not already settled
    if (auction.status === 'settled') {
      return NextResponse.json(
        { success: false, error: 'Auction already settled' },
        { status: 400 }
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const ticket = await Ticket.findById(auction.ticketId);
      
      // Check if reserve was met
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
        await auction.save({ session });

        // Update winning bid status
        await Bid.updateOne(
          { auctionId: auction._id, bidderId: auction.currentBidderId, status: 'active' },
          { status: 'won' },
          { session }
        );

        // Transfer ticket ownership
        if (ticket) {
          ticket.buyerId = auction.currentBidderId;
          ticket.ownerAddress = winner?.walletAddress;
          ticket.status = 'ACTIVE';
          await ticket.save({ session });

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
        await Transaction.create([{
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
        }], { session });

        // Settle on-chain if exists
        if (auction.onChainAuctionId) {
          try {
            await settleAuctionOnChain(auction.onChainAuctionId);
          } catch (chainError) {
            console.error('On-chain settle failed:', chainError);
          }
        }

        await session.commitTransaction();

        // Send notifications
        createNotification({
          userId: auction.currentBidderId.toString(),
          type: 'SYSTEM',
          title: '🎉 You won the auction!',
          message: `Congratulations! You won the ticket auction for ${auction.currentBidEth} ETH`,
          data: { auctionId: auction._id, ticketId: ticket?._id },
        }).catch(console.error);

        createNotification({
          userId: auction.sellerId.toString(),
          type: 'TICKET_SOLD',
          title: '💰 Auction completed!',
          message: `Your ticket sold for ${auction.currentBidEth} ETH. You earned ${sellerProceeds.toFixed(4)} ETH after fees.`,
          data: { auctionId: auction._id, amount: sellerProceeds },
        }).catch(console.error);

        return NextResponse.json({
          success: true,
          message: 'Auction settled successfully',
          result: {
            winner: winner?.name || 'Anonymous',
            finalPrice: auction.currentBidEth,
            distribution: {
              platformFee,
              organizerRoyalty,
              artistRoyalty,
              sellerProceeds,
            },
          },
        });

      } else {
        // No winner or reserve not met
        const newStatus = !hasWinner ? 'no_bids' : 'reserve_not_met';
        
        auction.status = newStatus;
        auction.settledAt = now;
        await auction.save({ session });

        // Return ticket to seller
        if (ticket) {
          ticket.status = 'ACTIVE';
          await ticket.save({ session });
        }

        // Refund any bids (mark as refunded)
        if (auction.currentBidderId) {
          await Bid.updateMany(
            { auctionId: auction._id },
            { status: 'refunded', refundedAt: now },
            { session }
          );

          // Notify bidder of refund
          createNotification({
            userId: auction.currentBidderId.toString(),
            type: 'SYSTEM',
            title: '💸 Auction ended - Bid refunded',
            message: newStatus === 'reserve_not_met' 
              ? 'The reserve price was not met. Your bid has been refunded.'
              : 'The auction ended without a winner. Your bid has been refunded.',
            data: { auctionId: auction._id },
          }).catch(console.error);
        }

        await session.commitTransaction();

        // Notify seller
        createNotification({
          userId: auction.sellerId.toString(),
          type: 'SYSTEM',
          title: '📋 Auction ended',
          message: newStatus === 'no_bids'
            ? 'Your auction ended with no bids. The ticket has been returned to your inventory.'
            : 'Your auction ended but the reserve price was not met. The ticket has been returned.',
          data: { auctionId: auction._id },
        }).catch(console.error);

        return NextResponse.json({
          success: true,
          message: newStatus === 'no_bids' 
            ? 'Auction ended with no bids' 
            : 'Auction ended - reserve not met',
          result: {
            status: newStatus,
            ticketReturned: true,
          },
        });
      }

    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }

  } catch (error: any) {
    console.error('Settle auction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to settle auction' },
      { status: 500 }
    );
  }
}
