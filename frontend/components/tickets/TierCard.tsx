"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Check, Clock, Users, Zap, Award, Crown, Star } from "lucide-react"
import { TicketTier, getTierConfig, calculateDiscount, type EnhancedTicketType } from "@/lib/types/enhanced-tiers"

interface TierCardProps {
  ticketType: EnhancedTicketType
  quantity: number
  onQuantityChange: (quantity: number) => void
  maxQuantity?: number
}

export function TierCard({ ticketType, quantity, onQuantityChange, maxQuantity = 10 }: TierCardProps) {
  const tierConfig = getTierConfig(ticketType.tier)
  const soldPercentage = ((ticketType.totalSupply - ticketType.availableSupply) / ticketType.totalSupply) * 100
  const isAvailable = ticketType.availableSupply > 0
  const discount = ticketType.originalPrice ? calculateDiscount(ticketType.originalPrice, ticketType.price) : 0

  const getTierIcon = () => {
    switch (ticketType.tier) {
      case TicketTier.PLATINUM: return <Crown className="h-5 w-5" />
      case TicketTier.VIP: return <Award className="h-5 w-5" />
      case TicketTier.PREMIUM: return <Star className="h-5 w-5" />
      case TicketTier.EARLY_BIRD: return <Zap className="h-5 w-5" />
      default: return <Users className="h-5 w-5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={`overflow-hidden border backdrop-blur-sm bg-gradient-to-r ${tierConfig.color} hover:shadow-xl transition-all duration-300`}>
        {/* Tier Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge className={`${tierConfig.color.replace('from-', 'bg-').replace('/30', '/80').split(' ')[0]} text-white border-0 font-bold`}>
            {tierConfig.icon} {ticketType.tier}
          </Badge>
        </div>

        {/* Hot/Limited Badge */}
        {(soldPercentage > 80 || ticketType.isLimitedTime) && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-red-500/90 text-white border-0 animate-pulse">
              🔥 {soldPercentage > 80 ? 'Almost Sold Out' : 'Limited Time'}
            </Badge>
          </div>
        )}

        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              {getTierIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{ticketType.name}</h3>
              <p className="text-sm text-gray-300">{ticketType.description}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              {discount > 0 && (
                <span className="text-lg text-gray-400 line-through">
                  ₹{ticketType.originalPrice?.toLocaleString()}
                </span>
              )}
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                ₹{ticketType.price.toLocaleString()}
              </span>
              {discount > 0 && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  {discount}% OFF
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">per ticket</p>
          </div>

          {/* Availability */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 flex items-center gap-1">
                <Users className="h-4 w-4" />
                {ticketType.availableSupply} available
              </span>
              <span className="text-gray-400">
                of {ticketType.totalSupply} total
              </span>
            </div>
            
            <Progress 
              value={soldPercentage} 
              className="h-2 bg-white/10"
            />
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>Sold: {soldPercentage.toFixed(0)}%</span>
              <span>Max {ticketType.maxPerWallet} per person</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              What's Included
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {tierConfig.benefits.slice(0, 3).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>{benefit}</span>
                </div>
              ))}
              {tierConfig.benefits.length > 3 && (
                <div className="text-xs text-gray-400 mt-1">
                  +{tierConfig.benefits.length - 3} more benefits
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Quantity Selector */}
          {isAvailable ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Quantity</span>
                {quantity > 0 && (
                  <span className="text-lg font-bold text-primary">
                    ₹{(quantity * ticketType.price).toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                  disabled={quantity === 0}
                  className="h-10 w-10 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  -
                </Button>
                
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-white">{quantity}</span>
                  <p className="text-xs text-gray-400">tickets</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onQuantityChange(Math.min(ticketType.availableSupply, ticketType.maxPerWallet, quantity + 1))}
                  disabled={quantity >= Math.min(ticketType.availableSupply, ticketType.maxPerWallet)}
                  className="h-10 w-10 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  +
                </Button>
              </div>

              {/* Sale Period */}
              {ticketType.saleEndDate && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>Sale ends {new Date(ticketType.saleEndDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ) : (
            <Button disabled className="w-full h-12 rounded-xl bg-gray-600 text-gray-400">
              Sold Out
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}