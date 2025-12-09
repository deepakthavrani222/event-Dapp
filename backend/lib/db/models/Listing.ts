import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IListing extends Document {
  ticketId: Types.ObjectId;
  price: number;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: Date;
  soldAt?: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, unique: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'sold', 'cancelled'],
      default: 'active',
    },
    soldAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Listing = mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);
