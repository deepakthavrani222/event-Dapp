import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITicketType extends Document {
  eventId: Types.ObjectId;
  name: string;
  tokenId: number;
  price: number;
  totalSupply: number;
  soldCount: number;
  maxPerWallet: number;
  createdAt: Date;
}

const TicketTypeSchema = new Schema<ITicketType>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    tokenId: { type: Number, required: true, unique: true },
    price: { type: Number, required: true },
    totalSupply: { type: Number, required: true },
    soldCount: { type: Number, default: 0 },
    maxPerWallet: { type: Number, default: 4 },
  },
  {
    timestamps: true,
  }
);

export const TicketType =
  mongoose.models.TicketType || mongoose.model<ITicketType>('TicketType', TicketTypeSchema);
