import { Schema, model, models, Document } from 'mongoose';

export interface IArtist extends Document {
  userId: string; // Reference to User
  artistName: string;
  realName: string;
  bio: string;
  genre: string[];
  socialLinks: {
    instagram?: string;
    twitter?: string;
    spotify?: string;
    youtube?: string;
    website?: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: {
    idProof?: string; // Cloudinary URL
    artistProof?: string; // Cloudinary URL (press coverage, music platforms, etc.)
    additionalDocs?: string[];
  };
  verificationSubmittedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string; // Admin user ID
  rejectionReason?: string;
  
  // Artist Stats
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  fanCount: number;
  averageRating: number;
  
  // Artist Settings
  royaltyPercentage: number; // 10-25% for verified artists
  canCreateGoldenTickets: boolean;
  messagingEnabled: boolean;
  autoApproveEvents: boolean;
  
  // Golden Ticket Settings
  goldenTicketPerks: string[];
  goldenTicketMultiplier: number; // 2x, 3x, 5x price multiplier
  
  createdAt: Date;
  updatedAt: Date;
}

const ArtistSchema = new Schema<IArtist>({
  userId: { type: String, required: true, unique: true },
  artistName: { type: String, required: true },
  realName: { type: String, required: true },
  bio: { type: String, default: '' },
  genre: [{ type: String }],
  socialLinks: {
    instagram: String,
    twitter: String,
    spotify: String,
    youtube: String,
    website: String,
  },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  verificationDocuments: {
    idProof: String,
    artistProof: String,
    additionalDocs: [String],
  },
  verificationSubmittedAt: Date,
  verifiedAt: Date,
  verifiedBy: String,
  rejectionReason: String,
  
  // Stats
  totalEvents: { type: Number, default: 0 },
  totalTicketsSold: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  fanCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  
  // Settings
  royaltyPercentage: { type: Number, default: 15 }, // Default 15% for verified artists
  canCreateGoldenTickets: { type: Boolean, default: false },
  messagingEnabled: { type: Boolean, default: true },
  autoApproveEvents: { type: Boolean, default: false },
  
  // Golden Tickets
  goldenTicketPerks: [String],
  goldenTicketMultiplier: { type: Number, default: 3 },
}, {
  timestamps: true,
});

// Indexes for performance
ArtistSchema.index({ userId: 1 });
ArtistSchema.index({ verificationStatus: 1 });
ArtistSchema.index({ artistName: 'text' });

export const Artist = models.Artist || model<IArtist>('Artist', ArtistSchema);