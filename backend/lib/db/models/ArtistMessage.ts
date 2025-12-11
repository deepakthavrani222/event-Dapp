import mongoose, { Schema, Document } from 'mongoose';

export interface IArtistMessage extends Document {
  artistId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  richContent?: {
    html: string;
    images: string[];
    attachments: Array<{
      type: 'nft' | 'link' | 'file';
      url: string;
      title: string;
      description?: string;
    }>;
  };
  segmentation: {
    type: 'all' | 'event' | 'city' | 'ticket_type' | 'golden_only' | 'custom';
    criteria: any; // Flexible criteria object
    estimatedReach: number;
  };
  deliveryChannels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  analytics: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    nftsClaimed: number;
    bounced: number;
  };
  nftDrop?: {
    enabled: boolean;
    title: string;
    description: string;
    image: string;
    claimLimit: number;
    claimedCount: number;
    expiresAt?: Date;
    metadata: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ArtistMessageSchema = new Schema<IArtistMessage>(
  {
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    richContent: {
      html: { type: String },
      images: [{ type: String }],
      attachments: [{
        type: { type: String, enum: ['nft', 'link', 'file'] },
        url: { type: String },
        title: { type: String },
        description: { type: String }
      }]
    },
    segmentation: {
      type: { 
        type: String, 
        enum: ['all', 'event', 'city', 'ticket_type', 'golden_only', 'custom'],
        required: true 
      },
      criteria: { type: Schema.Types.Mixed },
      estimatedReach: { type: Number, default: 0 }
    },
    deliveryChannels: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    scheduledFor: { type: Date },
    status: { 
      type: String, 
      enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
      default: 'draft'
    },
    analytics: {
      totalSent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      nftsClaimed: { type: Number, default: 0 },
      bounced: { type: Number, default: 0 }
    },
    nftDrop: {
      enabled: { type: Boolean, default: false },
      title: { type: String },
      description: { type: String },
      image: { type: String },
      claimLimit: { type: Number, default: 1000 },
      claimedCount: { type: Number, default: 0 },
      expiresAt: { type: Date },
      metadata: { type: Schema.Types.Mixed }
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ArtistMessageSchema.index({ artistId: 1, status: 1 });
ArtistMessageSchema.index({ eventId: 1 });
ArtistMessageSchema.index({ scheduledFor: 1, status: 1 });

export interface IMessageDelivery extends Document {
  messageId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  recipientEmail: string;
  channel: 'email' | 'push' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  metadata: {
    ticketType?: string;
    eventId?: string;
    city?: string;
    isGoldenTicket?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MessageDeliverySchema = new Schema<IMessageDelivery>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'ArtistMessage', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientEmail: { type: String, required: true },
    channel: { 
      type: String, 
      enum: ['email', 'push', 'in_app'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
      default: 'pending'
    },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    errorMessage: { type: String },
    metadata: {
      ticketType: { type: String },
      eventId: { type: String },
      city: { type: String },
      isGoldenTicket: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
MessageDeliverySchema.index({ messageId: 1, status: 1 });
MessageDeliverySchema.index({ recipientId: 1 });
MessageDeliverySchema.index({ status: 1, sentAt: 1 });

export interface INFTClaim extends Document {
  messageId: mongoose.Types.ObjectId;
  claimerId: mongoose.Types.ObjectId;
  tokenId: string;
  claimedAt: Date;
  transactionHash?: string;
  metadata: any;
}

const NFTClaimSchema = new Schema<INFTClaim>(
  {
    messageId: { type: Schema.Types.ObjectId, ref: 'ArtistMessage', required: true },
    claimerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenId: { type: String, required: true, unique: true },
    claimedAt: { type: Date, default: Date.now },
    transactionHash: { type: String },
    metadata: { type: Schema.Types.Mixed }
  },
  {
    timestamps: true,
  }
);

// Indexes
NFTClaimSchema.index({ messageId: 1 });
NFTClaimSchema.index({ claimerId: 1 });
NFTClaimSchema.index({ tokenId: 1 });

export const ArtistMessage = mongoose.models.ArtistMessage || 
  mongoose.model<IArtistMessage>('ArtistMessage', ArtistMessageSchema);

export const MessageDelivery = mongoose.models.MessageDelivery || 
  mongoose.model<IMessageDelivery>('MessageDelivery', MessageDeliverySchema);

export const NFTClaim = mongoose.models.NFTClaim || 
  mongoose.model<INFTClaim>('NFTClaim', NFTClaimSchema);