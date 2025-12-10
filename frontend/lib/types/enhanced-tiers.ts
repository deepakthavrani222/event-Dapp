// Enhanced Tiering System Types

export enum TicketTier {
  PLATINUM = 'PLATINUM',
  VIP = 'VIP', 
  PREMIUM = 'PREMIUM',
  EARLY_BIRD = 'EARLY_BIRD',
  GENERAL = 'GENERAL',
  STUDENT = 'STUDENT',
  GROUP = 'GROUP'
}

export interface TierBenefits {
  tier: TicketTier
  benefits: string[]
  color: string
  icon: string
  priority: number
}

export interface EnhancedTicketType {
  id: string
  name: string
  tier: TicketTier
  price: number
  originalPrice?: number // For discounted tiers
  currency: string
  availableSupply: number
  totalSupply: number
  maxPerWallet: number
  benefits: string[]
  description: string
  saleStartDate?: Date
  saleEndDate?: Date
  isLimitedTime?: boolean
  tokenId?: number
}

// Predefined tier configurations
export const TIER_CONFIGS: Record<TicketTier, TierBenefits> = {
  [TicketTier.PLATINUM]: {
    tier: TicketTier.PLATINUM,
    benefits: [
      'Front row seating',
      'Meet & greet with artist',
      'Exclusive merchandise',
      'VIP lounge access',
      'Premium parking',
      'Complimentary drinks'
    ],
    color: 'from-purple-500/30 to-pink-500/30 border-purple-500/50',
    icon: '👑',
    priority: 1
  },
  [TicketTier.VIP]: {
    tier: TicketTier.VIP,
    benefits: [
      'Priority seating',
      'VIP entrance',
      'Exclusive merchandise',
      'Premium parking',
      'Fast track entry'
    ],
    color: 'from-yellow-500/30 to-orange-500/30 border-yellow-500/50',
    icon: '⭐',
    priority: 2
  },
  [TicketTier.PREMIUM]: {
    tier: TicketTier.PREMIUM,
    benefits: [
      'Reserved seating',
      'Priority entry',
      'Complimentary program',
      'Dedicated entrance'
    ],
    color: 'from-blue-500/30 to-cyan-500/30 border-blue-500/50',
    icon: '💎',
    priority: 3
  },
  [TicketTier.EARLY_BIRD]: {
    tier: TicketTier.EARLY_BIRD,
    benefits: [
      'Discounted price',
      'Guaranteed entry',
      'Early access',
      'Special pricing'
    ],
    color: 'from-green-500/30 to-emerald-500/30 border-green-500/50',
    icon: '🐦',
    priority: 4
  },
  [TicketTier.GENERAL]: {
    tier: TicketTier.GENERAL,
    benefits: [
      'Standard entry',
      'General seating',
      'Event access'
    ],
    color: 'from-gray-500/30 to-slate-500/30 border-gray-500/50',
    icon: '🎫',
    priority: 5
  },
  [TicketTier.STUDENT]: {
    tier: TicketTier.STUDENT,
    benefits: [
      'Student discount',
      'ID verification required',
      'Standard entry'
    ],
    color: 'from-indigo-500/30 to-purple-500/30 border-indigo-500/50',
    icon: '🎓',
    priority: 6
  },
  [TicketTier.GROUP]: {
    tier: TicketTier.GROUP,
    benefits: [
      'Group discount (5+ tickets)',
      'Bulk pricing',
      'Group seating'
    ],
    color: 'from-teal-500/30 to-cyan-500/30 border-teal-500/50',
    icon: '👥',
    priority: 7
  }
}

// Utility functions
export const getTierConfig = (tier: TicketTier): TierBenefits => {
  return TIER_CONFIGS[tier]
}

export const sortTicketsByTier = (tickets: EnhancedTicketType[]): EnhancedTicketType[] => {
  return tickets.sort((a, b) => {
    const aTier = getTierConfig(a.tier)
    const bTier = getTierConfig(b.tier)
    return aTier.priority - bTier.priority
  })
}

export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}