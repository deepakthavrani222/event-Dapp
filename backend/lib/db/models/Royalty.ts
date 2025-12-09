import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoyalty extends Document {
  eventId: Types.ObjectId;
  organizerPct: number;
  artistPct: number;
  venuePct: number;
  platformPct: number;
}

const RoyaltySchema = new Schema<IRoyalty>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
    organizerPct: { type: Number, default: 70.0 },
    artistPct: { type: Number, default: 15.0 },
    venuePct: { type: Number, default: 10.0 },
    platformPct: { type: Number, default: 5.0 },
  },
  {
    timestamps: true,
  }
);

export const Royalty = mongoose.models.Royalty || mongoose.model<IRoyalty>('Royalty', RoyaltySchema);
