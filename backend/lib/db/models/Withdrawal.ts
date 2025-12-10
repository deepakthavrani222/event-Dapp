import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: Types.ObjectId;
  amount: number;
  method: 'CRYPTO' | 'BANK' | 'UPI';
  destination: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 50 },
    method: { 
      type: String, 
      enum: ['CRYPTO', 'BANK', 'UPI'], 
      required: true 
    },
    destination: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    transactionHash: { type: String },
    failureReason: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Withdrawal = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
