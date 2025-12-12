import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IListing extends Document {
  ticketId: Types.ObjectId;
  sellerId: Types.ObjectId;
  eventId: Types.ObjectId;
  ticketTypeId: Types.ObjectId;
  price: number;
  currency: string;
  status: 'active' | 'sold' | 'cancelled';
  listedAt: Date;
  soldAt?: Date;
  views?: number;
  createdAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, unique: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['active', 'sold', 'cancelled'],
      default: 'active',
    },
    listedAt: { type: Date, default: Date.now },
    soldAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Listing = mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);
