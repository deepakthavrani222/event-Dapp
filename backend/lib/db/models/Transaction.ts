import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  ticketId?: Types.ObjectId;
  type: 'purchase' | 'resale' | 'refund';
  amount: number;
  txHash?: string;
  referralCode?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
    type: {
      type: String,
      enum: ['purchase', 'resale', 'refund'],
      required: true,
    },
    amount: { type: Number, required: true },
    txHash: { type: String },
    referralCode: { type: String },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
