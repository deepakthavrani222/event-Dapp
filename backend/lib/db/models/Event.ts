import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoyaltySettings {
  enableResale: boolean;
  royaltyPercentage: number; // 2-10%
  maxResalePrice: number; // 100-200% of face value
  soulbound?: boolean; // Non-resellable tickets
}

export interface IPromotionSettings {
  tags: string[];
  enableReferrals: boolean;
  referralCommission: number; // 1-15%
  websiteUrl?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  date: Date;
  time: string;
  timezone?: string;
  venue: string;
  city: string;
  location: string;
  image: string;
  imagePublicId?: string; // Cloudinary public ID for image management
  organizerId: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejectionReason?: string;
  // Web3 Royalty Settings
  royaltySettings: IRoyaltySettings;
  // Promotion Settings
  promotionSettings?: IPromotionSettings;
  // Venue fee (if registered venue)
  venueFee?: number;
  // Smart Contract Address (when deployed)
  contractAddress?: string;
  // Analytics
  totalRevenue: number;
  totalRoyaltiesEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoyaltySettingsSchema = new Schema<IRoyaltySettings>(
  {
    enableResale: { type: Boolean, default: true },
    royaltyPercentage: { type: Number, default: 5, min: 2, max: 10 },
    maxResalePrice: { type: Number, default: 120, min: 100, max: 200 },
    soulbound: { type: Boolean, default: false },
  },
  { _id: false }
);

const PromotionSettingsSchema = new Schema<IPromotionSettings>(
  {
    tags: [{ type: String }],
    enableReferrals: { type: Boolean, default: false },
    referralCommission: { type: Number, default: 5, min: 1, max: 15 },
    websiteUrl: { type: String },
    socialLinks: {
      instagram: { type: String },
      twitter: { type: String },
      facebook: { type: String },
    },
  },
  { _id: false }
);

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    timezone: { type: String, default: 'Asia/Kolkata' },
    venue: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    imagePublicId: { type: String },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    // Web3 Royalty Settings
    royaltySettings: {
      type: RoyaltySettingsSchema,
      default: () => ({ enableResale: true, royaltyPercentage: 5, maxResalePrice: 120, soulbound: false }),
    },
    // Promotion Settings
    promotionSettings: {
      type: PromotionSettingsSchema,
      default: () => ({ tags: [], enableReferrals: false, referralCommission: 5 }),
    },
    // Venue fee
    venueFee: { type: Number, default: 0 },
    // Sales control
    salesPaused: { type: Boolean, default: false },
    // Smart Contract Address
    contractAddress: { type: String },
    // Analytics
    totalRevenue: { type: Number, default: 0 },
    totalRoyaltiesEarned: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
