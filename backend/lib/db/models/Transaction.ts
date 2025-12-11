import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  buyerId: Types.ObjectId;
  eventId: Types.ObjectId;
  ticketTypeId: Types.ObjectId;
  quantity: number;
  totalAmount: number;
  currency: string;
  platformFee: number;
  referralCommission: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  paymentMethod: string;
  txHash?: string;
  referralId?: Types.ObjectId;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketTypeId: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    platformFee: { type: Number, default: 0 },
    referralCommission: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    paymentMethod: { type: String, required: true },
    txHash: { type: String },
    referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
  },
  {
    timestamps: true,
  }
);

export const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
