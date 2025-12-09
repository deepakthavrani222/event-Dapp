import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITicket extends Document {
  eventId: Types.ObjectId;
  ticketTypeId: Types.ObjectId;
  buyerId: Types.ObjectId;
  ownerAddress?: string;
  tokenId: string;
  price: number;
  currency: string;
  status: 'ACTIVE' | 'USED' | 'LISTED' | 'TRANSFERRED';
  purchaseDate: Date;
  usedAt?: Date;
  checkedInBy?: Types.ObjectId;
  txHash?: string;
  createdAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownerAddress: { type: String },
    tokenId: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['ACTIVE', 'USED', 'LISTED', 'TRANSFERRED'],
      default: 'ACTIVE',
    },
    purchaseDate: { type: Date, required: true },
    usedAt: { type: Date },
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
    txHash: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);
