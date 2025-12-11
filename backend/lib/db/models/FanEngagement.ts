import { Schema, model, models, Document } from 'mongoose';

export interface IFanEngagement extends Document {
  userId: string; // Fan's user ID
  artistId: string;
  
  // Engagement Metrics
  totalTicketsPurchased: number;
  totalAmountSpent: number;
  eventsAttended: string[]; // Event IDs
  goldenTicketsPurchased: number;
  
  // Interaction History
  messagesReceived: number;
  messagesRead: number;
  linksClicked: number;
  
  // Fan Status
  fanSince: Date;
  lastInteraction: Date;
  fanTier: 'casual' | 'regular' | 'superfan' | 'vip';
  
  // Preferences
  notificationPreferences: {
    newEvents: boolean;
    exclusiveContent: boolean;
    meetGreets: boolean;
    behindScenes: boolean;
  };
  
  // Analytics
  averageTicketPrice: number;
  favoriteVenues: string[];
  preferredEventTypes: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

const FanEngagementSchema = new Schema<IFanEngagement>({
  userId: { type: String, required: true },
  artistId: { type: String, required: true },
  
  totalTicketsPurchased: { type: Number, default: 0 },
  totalAmountSpent: { type: Number, default: 0 },
  eventsAttended: [String],
  goldenTicketsPurchased: { type: Number, default: 0 },
  
  messagesReceived: { type: Number, default: 0 },
  messagesRead: { type: Number, default: 0 },
  linksClicked: { type: Number, default: 0 },
  
  fanSince: { type: Date, default: Date.now },
  lastInteraction: { type: Date, default: Date.now },
  fanTier: { 
    type: String, 
    enum: ['casual', 'regular', 'superfan', 'vip'],
    default: 'casual'
  },
  
  notificationPreferences: {
    newEvents: { type: Boolean, default: true },
    exclusiveContent: { type: Boolean, default: true },
    meetGreets: { type: Boolean, default: true },
    behindScenes: { type: Boolean, default: true },
  },
  
  averageTicketPrice: { type: Number, default: 0 },
  favoriteVenues: [String],
  preferredEventTypes: [String],
}, {
  timestamps: true,
});

// Compound index for efficient queries
FanEngagementSchema.index({ userId: 1, artistId: 1 }, { unique: true });
FanEngagementSchema.index({ artistId: 1, fanTier: 1 });
FanEngagementSchema.index({ artistId: 1, totalAmountSpent: -1 });

export const FanEngagement = models.FanEngagement || model<IFanEngagement>('FanEngagement', FanEngagementSchema);