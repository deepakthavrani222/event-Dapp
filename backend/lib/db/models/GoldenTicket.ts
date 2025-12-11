import mongoose, { Schema, Document } from 'mongoose';

export interface IGoldenTicketTemplate extends Document {
  artistId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  priceMultiplier: number; // 2x, 3x, 5x, 10x regular price
  basePrice: number; // Base price in rupees
  finalPrice: number; // Calculated final price
  maxQuantity: number;
  soldQuantity: number;
  royaltyBonus: number; // Additional royalty % (0-10%)
  totalRoyaltyPercentage: number; // Base + bonus
  perks: string[]; // Array of perk IDs
  isLimited: boolean;
  isSoulbound: boolean; // Non-transferable
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
  customMessage?: string;
  nftMetadata?: {
    image: string;
    animationUrl?: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  salesData: {
    totalRevenue: number;
    artistRoyalties: number;
    platformFees: number;
  };
  presaleSettings?: {
    enabled: boolean;
    startDate: Date;
    endDate: Date;
    eligibleHolders: string[]; // Previous NFT holders
    discountPercentage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GoldenTicketTemplateSchema = new Schema<IGoldenTicketTemplate>(
  {
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    priceMultiplier: { type: Number, required: true, min: 2, max: 10 },
    basePrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
    maxQuantity: { type: Number, required: true, min: 1, max: 500 },
    soldQuantity: { type: Number, default: 0 },
    royaltyBonus: { type: Number, default: 0, min: 0, max: 10 },
    totalRoyaltyPercentage: { type: Number, required: true },
    perks: [{ type: String }],
    isLimited: { type: Boolean, default: true },
    isSoulbound: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    backgroundColor: { type: String, default: '#FFD700' },
    textColor: { type: String, default: '#000000' },
    customMessage: { type: String },
    nftMetadata: {
      image: { type: String },
      animationUrl: { type: String },
      attributes: [{
        trait_type: { type: String },
        value: { type: String }
      }]
    },
    salesData: {
      totalRevenue: { type: Number, default: 0 },
      artistRoyalties: { type: Number, default: 0 },
      platformFees: { type: Number, default: 0 }
    },
    presaleSettings: {
      enabled: { type: Boolean, default: false },
      startDate: { type: Date },
      endDate: { type: Date },
      eligibleHolders: [{ type: String }],
      discountPercentage: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
GoldenTicketTemplateSchema.index({ artistId: 1, isActive: 1 });
GoldenTicketTemplateSchema.index({ eventId: 1 });

export interface IGoldenTicketPurchase extends Document {
  templateId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  artistId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  tokenId: string; // NFT token ID
  purchasePrice: number;
  royaltyPaid: number;
  platformFee: number;
  transactionHash?: string;
  nftMetadata: any;
  isRedeemed: boolean;
  redeemedAt?: Date;
  transferHistory: Array<{
    from: string;
    to: string;
    timestamp: Date;
    transactionHash: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const GoldenTicketPurchaseSchema = new Schema<IGoldenTicketPurchase>(
  {
    templateId: { type: Schema.Types.ObjectId, ref: 'GoldenTicketTemplate', required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    tokenId: { type: String, required: true, unique: true },
    purchasePrice: { type: Number, required: true },
    royaltyPaid: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    transactionHash: { type: String },
    nftMetadata: { type: Schema.Types.Mixed },
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date },
    transferHistory: [{
      from: { type: String, required: true },
      to: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      transactionHash: { type: String }
    }]
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
GoldenTicketPurchaseSchema.index({ buyerId: 1 });
GoldenTicketPurchaseSchema.index({ artistId: 1 });
GoldenTicketPurchaseSchema.index({ templateId: 1 });
GoldenTicketPurchaseSchema.index({ tokenId: 1 });

export const GoldenTicketTemplate = mongoose.models.GoldenTicketTemplate || 
  mongoose.model<IGoldenTicketTemplate>('GoldenTicketTemplate', GoldenTicketTemplateSchema);

export const GoldenTicketPurchase = mongoose.models.GoldenTicketPurchase || 
  mongoose.model<IGoldenTicketPurchase>('GoldenTicketPurchase', GoldenTicketPurchaseSchema);