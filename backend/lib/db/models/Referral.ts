import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReferral extends Document {
  promoterId: Types.ObjectId;
  code: string;
  eventId?: Types.ObjectId;
  commissionPct: number;
  totalEarnings: number;
  clickCount: number;
  conversionCount: number;
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    promoterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true, unique: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    commissionPct: { type: Number, default: 5.0 },
    totalEarnings: { type: Number, default: 0.0 },
    clickCount: { type: Number, default: 0 },
    conversionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const Referral = mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
