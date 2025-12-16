import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBid extends Document {
  auctionId: Types.ObjectId;
  bidderId: Types.ObjectId;
  bidderWallet: string;
  
  amountEth: number;
  
  // Status
  status: 'active' | 'outbid' | 'won' | 'refunded' | 'cancelled';
  
  // Blockchain
  txHash?: string;
  refundTxHash?: string;
  
  // Timing
  placedAt: Date;
  refundedAt?: Date;
  
  // Anti-sniping
  causedExtension: boolean;
  newEndTime?: Date;
  
  createdAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
    bidderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bidderWallet: { type: String, required: true },
    
    amountEth: { type: Number, required: true },
    
    status: {
      type: String,
      enum: ['active', 'outbid', 'won', 'refunded', 'cancelled'],
      default: 'active',
    },
    
    txHash: { type: String },
    refundTxHash: { type: String },
    
    placedAt: { type: Date, default: Date.now },
    refundedAt: { type: Date },
    
    causedExtension: { type: Boolean, default: false },
    newEndTime: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
BidSchema.index({ auctionId: 1, placedAt: -1 });
BidSchema.index({ bidderId: 1, status: 1 });
BidSchema.index({ auctionId: 1, bidderId: 1 });

export const Bid = mongoose.models.Bid || mongoose.model<IBid>('Bid', BidSchema);
