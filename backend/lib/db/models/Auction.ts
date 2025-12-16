import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuction extends Document {
  ticketId: Types.ObjectId;
  sellerId: Types.ObjectId;
  eventId: Types.ObjectId;
  ticketTypeId: Types.ObjectId;
  
  // Auction settings
  startingBidEth: number;
  reservePriceEth?: number; // Hidden minimum
  bidIncrementEth: number;
  currentBidEth: number;
  currentBidderId?: Types.ObjectId;
  
  // Timing
  startTime: Date;
  endTime: Date;
  originalEndTime: Date; // Track extensions
  
  // Price controls
  originalPriceEth: number;
  maxPriceCapPercent: number; // e.g., 150 = 150% of original
  
  // Royalties (basis points)
  platformFeePercent: number;
  organizerRoyaltyPercent: number;
  artistRoyaltyPercent: number;
  
  // Wallets for distribution
  organizerWallet?: string;
  artistWallet?: string;
  
  // Blockchain
  onChainAuctionId?: number;
  txHash?: string;
  
  // Status
  status: 'pending' | 'active' | 'ended' | 'settled' | 'cancelled' | 'no_bids' | 'reserve_not_met';
  winnerId?: Types.ObjectId;
  finalPriceEth?: number;
  settledAt?: Date;
  
  // Referral
  referralCode?: string;
  promoterId?: Types.ObjectId;
  
  // Stats
  totalBids: number;
  uniqueBidders: number;
  views: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const AuctionSchema = new Schema<IAuction>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, unique: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true },
    
    startingBidEth: { type: Number, required: true },
    reservePriceEth: { type: Number },
    bidIncrementEth: { type: Number, required: true, default: 0.001 },
    currentBidEth: { type: Number, default: 0 },
    currentBidderId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    originalEndTime: { type: Date, required: true },
    
    originalPriceEth: { type: Number, required: true },
    maxPriceCapPercent: { type: Number, default: 150 },
    
    platformFeePercent: { type: Number, default: 750 }, // 7.5%
    organizerRoyaltyPercent: { type: Number, default: 500 }, // 5%
    artistRoyaltyPercent: { type: Number, default: 1000 }, // 10%
    
    organizerWallet: { type: String },
    artistWallet: { type: String },
    
    onChainAuctionId: { type: Number },
    txHash: { type: String },
    
    status: {
      type: String,
      enum: ['pending', 'active', 'ended', 'settled', 'cancelled', 'no_bids', 'reserve_not_met'],
      default: 'pending',
    },
    winnerId: { type: Schema.Types.ObjectId, ref: 'User' },
    finalPriceEth: { type: Number },
    settledAt: { type: Date },
    
    referralCode: { type: String },
    promoterId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    totalBids: { type: Number, default: 0 },
    uniqueBidders: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AuctionSchema.index({ status: 1, endTime: 1 });
AuctionSchema.index({ eventId: 1, status: 1 });
AuctionSchema.index({ sellerId: 1 });
AuctionSchema.index({ currentBidderId: 1 });

export const Auction = mongoose.models.Auction || mongoose.model<IAuction>('Auction', AuctionSchema);
