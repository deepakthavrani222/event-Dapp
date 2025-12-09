import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  BUYER = 'BUYER',
  ORGANIZER = 'ORGANIZER',
  PROMOTER = 'PROMOTER',
  VENUE_OWNER = 'VENUE_OWNER',
  ARTIST = 'ARTIST',
  RESELLER = 'RESELLER',
  INSPECTOR = 'INSPECTOR',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
}

export interface IUser extends Document {
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BUYER,
      required: true,
    },
    walletAddress: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
