import mongoose, { Schema, Document } from 'mongoose';

export interface IArtistTier extends Document {
  artistId: mongoose.Types.ObjectId;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tierScore: number; // Calculated based on revenue, fans, engagement
  perks: {
    featuredHomepage: boolean;
    priorityApproval: boolean; // <1 hour approval
    collabTools: boolean;
    nftCollectibles: boolean;
    customBadge: boolean;
    exclusiveEvents: boolean;
  };
  metrics: {
    totalRevenue: number;
    fanCount: number;
    eventCount: number;
    averageRating: number;
    engagementScore: number;
  };
  lastCalculatedAt: Date;
  nextReviewAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArtistTierSchema = new Schema<IArtistTier>(
  {
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true, unique: true },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    tierScore: { type: Number, default: 0 },
    perks: {
      featuredHomepage: { type: Boolean, default: false },
      priorityApproval: { type: Boolean, default: false },
      collabTools: { type: Boolean, default: false },
      nftCollectibles: { type: Boolean, default: false },
      customBadge: { type: Boolean, default: false },
      exclusiveEvents: { type: Boolean, default: false }
    },
    metrics: {
      totalRevenue: { type: Number, default: 0 },
      fanCount: { type: Number, default: 0 },
      eventCount: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      engagementScore: { type: Number, default: 0 }
    },
    lastCalculatedAt: { type: Date, default: Date.now },
    nextReviewAt: { type: Date, required: true }
  },
  {
    timestamps: true,
  }
);

ArtistTierSchema.index({ tier: 1, tierScore: -1 });
ArtistTierSchema.index({ artistId: 1 });

export interface ICollaboration extends Document {
  title: string;
  description: string;
  initiatorId: mongoose.Types.ObjectId;
  collaboratorIds: mongoose.Types.ObjectId[];
  eventId?: mongoose.Types.ObjectId;
  status: 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  collabType: 'joint_event' | 'cross_promotion' | 'nft_collection' | 'tour';
  terms: {
    revenueShare: Array<{
      artistId: mongoose.Types.ObjectId;
      percentage: number;
    }>;
    responsibilities: Array<{
      artistId: mongoose.Types.ObjectId;
      tasks: string[];
    }>;
  };
  timeline: {
    proposedAt: Date;
    acceptedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    completedAt?: Date;
  };
  messages: Array<{
    senderId: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CollaborationSchema = new Schema<ICollaboration>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    initiatorId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
    collaboratorIds: [{ type: Schema.Types.ObjectId, ref: 'Artist' }],
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'proposed'
    },
    collabType: {
      type: String,
      enum: ['joint_event', 'cross_promotion', 'nft_collection', 'tour'],
      required: true
    },
    terms: {
      revenueShare: [{
        artistId: { type: Schema.Types.ObjectId, ref: 'Artist' },
        percentage: { type: Number, min: 0, max: 100 }
      }],
      responsibilities: [{
        artistId: { type: Schema.Types.ObjectId, ref: 'Artist' },
        tasks: [{ type: String }]
      }]
    },
    timeline: {
      proposedAt: { type: Date, default: Date.now },
      acceptedAt: { type: Date },
      startDate: { type: Date },
      endDate: { type: Date },
      completedAt: { type: Date }
    },
    messages: [{
      senderId: { type: Schema.Types.ObjectId, ref: 'Artist' },
      message: { type: String },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  {
    timestamps: true,
  }
);

CollaborationSchema.index({ initiatorId: 1, status: 1 });
CollaborationSchema.index({ collaboratorIds: 1, status: 1 });

export interface INFTCollectible extends Document {
  artistId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  collectionName: string;
  description: string;
  totalSupply: number;
  mintedCount: number;
  basePrice: number;
  royaltyPercentage: number; // Continuous royalty on resales
  metadata: {
    image: string;
    animationUrl?: string;
    attributes: Array<{
      trait_type: string;
      value: string;
      rarity?: number;
    }>;
  };
  rarityTiers: Array<{
    tier: string;
    percentage: number;
    multiplier: number;
  }>;
  salesData: {
    totalSales: number;
    totalRoyalties: number;
    averagePrice: number;
    lastSalePrice: number;
  };
  isActive: boolean;
  launchDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NFTCollectibleSchema = new Schema<INFTCollectible>(
  {
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    collectionName: { type: String, required: true },
    description: { type: String, required: true },
    totalSupply: { type: Number, required: true, min: 1, max: 10000 },
    mintedCount: { type: Number, default: 0 },
    basePrice: { type: Number, required: true },
    royaltyPercentage: { type: Number, default: 10, min: 0, max: 25 },
    metadata: {
      image: { type: String, required: true },
      animationUrl: { type: String },
      attributes: [{
        trait_type: { type: String },
        value: { type: String },
        rarity: { type: Number }
      }]
    },
    rarityTiers: [{
      tier: { type: String },
      percentage: { type: Number },
      multiplier: { type: Number }
    }],
    salesData: {
      totalSales: { type: Number, default: 0 },
      totalRoyalties: { type: Number, default: 0 },
      averagePrice: { type: Number, default: 0 },
      lastSalePrice: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    launchDate: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
  }
);

NFTCollectibleSchema.index({ artistId: 1, isActive: 1 });
NFTCollectibleSchema.index({ launchDate: -1 });

export interface IFeaturedRotation extends Document {
  artistId: mongoose.Types.ObjectId;
  position: number; // 1-5 for homepage slots
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FeaturedRotationSchema = new Schema<IFeaturedRotation>(
  {
    artistId: { type: Schema.Types.ObjectId, ref: 'Artist', required: true },
    position: { type: Number, required: true, min: 1, max: 5 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true,
  }
);

FeaturedRotationSchema.index({ isActive: 1, position: 1 });
FeaturedRotationSchema.index({ startDate: 1, endDate: 1 });

export const ArtistTier = mongoose.models.ArtistTier || 
  mongoose.model<IArtistTier>('ArtistTier', ArtistTierSchema);

export const Collaboration = mongoose.models.Collaboration || 
  mongoose.model<ICollaboration>('Collaboration', CollaborationSchema);

export const NFTCollectible = mongoose.models.NFTCollectible || 
  mongoose.model<INFTCollectible>('NFTCollectible', NFTCollectibleSchema);

export const FeaturedRotation = mongoose.models.FeaturedRotation || 
  mongoose.model<IFeaturedRotation>('FeaturedRotation', FeaturedRotationSchema);

// Helper function to calculate artist tier
export async function calculateArtistTier(artistId: string) {
  try {
    // This would integrate with existing models to calculate metrics
    // For now, returning a basic structure
    const tierData = {
      tier: 'gold' as const,
      tierScore: 750,
      perks: {
        featuredHomepage: true,
        priorityApproval: true,
        collabTools: true,
        nftCollectibles: true,
        customBadge: true,
        exclusiveEvents: false
      },
      metrics: {
        totalRevenue: 500000,
        fanCount: 15000,
        eventCount: 25,
        averageRating: 4.8,
        engagementScore: 85
      }
    };

    await ArtistTier.findOneAndUpdate(
      { artistId },
      {
        ...tierData,
        lastCalculatedAt: new Date(),
        nextReviewAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      { upsert: true, new: true }
    );

    return tierData;
  } catch (error) {
    console.error('Failed to calculate artist tier:', error);
    throw error;
  }
}