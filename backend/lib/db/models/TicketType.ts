import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITicketType extends Document {
  eventId: Types.ObjectId;
  name: string;
  description?: string;
  tokenId: string;
  price: number;
  totalSupply: number;
  availableSupply: number;
  soldCount: number;
  maxPerWallet: number;
  isActive: boolean;
  
  // Early bird pricing
  pricingType: 'fixed' | 'dynamic';
  earlyBirdPrice?: number;
  earlyBirdEndDate?: Date;
  
  // Golden Ticket Features
  isGoldenTicket: boolean;
  goldenTicketPerks: string[];
  artistRoyaltyPercentage?: number; // Override default royalty for this ticket type
  exclusiveContent?: {
    meetGreetAccess: boolean;
    backstageAccess: boolean;
    exclusiveMessages: boolean;
    limitedMerchandise: boolean;
    prioritySupport: boolean;
  };
  
  createdAt: Date;
}

const TicketTypeSchema = new Schema<ITicketType>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    tokenId: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    totalSupply: { type: Number, required: true },
    availableSupply: { type: Number, required: true },
    soldCount: { type: Number, default: 0 },
    maxPerWallet: { type: Number, default: 4 },
    isActive: { type: Boolean, default: true },
    
    // Early bird pricing
    pricingType: { type: String, enum: ['fixed', 'dynamic'], default: 'fixed' },
    earlyBirdPrice: { type: Number },
    earlyBirdEndDate: { type: Date },
    
    // Golden Ticket Features
    isGoldenTicket: { type: Boolean, default: false },
    goldenTicketPerks: [String],
    artistRoyaltyPercentage: Number,
    exclusiveContent: {
      meetGreetAccess: { type: Boolean, default: false },
      backstageAccess: { type: Boolean, default: false },
      exclusiveMessages: { type: Boolean, default: false },
      limitedMerchandise: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

export const TicketType =
  mongoose.models.TicketType || mongoose.model<ITicketType>('TicketType', TicketTypeSchema);
