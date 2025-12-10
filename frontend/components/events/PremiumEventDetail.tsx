"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, User, Ticket, ArrowLeft, Share2, Heart, Clock, Users, Star, Plus, Minus, ShoppingCart, TrendingUp, Award, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { EnhancedPurchaseDialog } from "@/components/events/EnhancedPurchaseDialog"
import { GuestBuyingFlow } from "@/components/buyer/GuestBuyingFlow"
import { useAuth } from "@/lib/context/AuthContext"

interface PremiumEventDetailProps {
  event: any
  onBack: () => void
}

interface TicketSelection {
  ticketTypeId: string
  quantity: number
  price: number
  name: string
}

export function PremiumEventDetail({ event, onBack }: PremiumEventDetailProps) {
  const { isAuthenticated } = useAuth()
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showGuestFlow, setShowGuestFlow] = useState(false)

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'Date TBD'
      return format(date, 'PPPP')
    } catch {
      return 'Date TBD'
    }
  }

  const formatTime = (startDateStr: string, endDateStr?: string) => {
    try {
      const startDate = new Date(startDateStr)
      if (isNaN(startDate.getTime())) return 'Time TBD'
      
      const startTime = format(startDate, 'p')
      if (!endDateStr) return startTime
      
      const endDate = new Date(endDateStr)
      const endTime = isNaN(endDate.getTime()) ? startTime : format(endDate, 'p')
      return `${startTime} - ${endTime}`
    } catch {
      return 'Time TBD'
    }
  }

  const updateTicketQuantity = (ticketTypeId: string, quantity: number, ticketType: any) => {
    setTicketSelections(prev => {
      const existing = prev.find(t => t.ticketTypeId === ticketTypeId)
      if (quantity === 0) {
        return prev.filter(t => t.ticketTypeId !== ticketTypeId)
      }
      
      if (existing) {
        return prev.map(t => 
          t.ticketTypeId === ticketTypeId 
            ? { ...t, quantity }
            : t
        )
      } else {
        return [...prev, {
          ticketTypeId,
          quantity,
          price: ticketType.price,
          name: ticketType.name
        }]
      }
    })
  }

  const getTicketQuantity = (ticketTypeId: string) => {
    return ticketSelections.find(t => t.ticketTypeId === ticketTypeId)?.quantity || 0
  }

  const getTotalAmount = () => {
    return ticketSelections.reduce((total, selection) => 
      total + (selection.quantity * selection.price), 0
    )
  }

  const getTotalTickets = () => {
    return ticketSelections.reduce((total, selection) => total + selection.quantity, 0)
  }

  const getTicketTypeIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('vip') || lowerName.includes('premium')) return <Award className="h-4 w-4" />
    if (lowerName.includes('early') || lowerName.includes('bird')) return <Zap className="h-4 w-4" />
    if (lowerName.includes('general') || lowerName.includes('standard')) return <Ticket className="h-4 w-4" />
    return <Ticket className="h-4 w-4" />
  }

  const getTicketTypeColor = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('vip') || lowerName.includes('premium')) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
    if (lowerName.includes('early') || lowerName.includes('bird')) return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
    if (lowerName.includes('general') || lowerName.includes('standard')) return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
    return 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-between py-8">
          {/* Top Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="glass-card border-white/20 text-white hover:bg-white/10 gap-2 rounded-full bg-black/20 backdrop-blur-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className="glass-card border-white/20 text-white hover:bg-white/10 rounded-full bg-black/20 backdrop-blur-md"
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="glass-card border-white/20 text-white hover:bg-white/10 rounded-full bg-black/20 backdrop-blur-md"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Event Info */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm px-4 py-2 text-sm font-semibold">
                {event.category}
              </Badge>

              <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                {event.title}
              </h1>

              {event.artist && (
                <p className="text-2xl text-gray-300 font-medium">
                  by {event.artist}
                </p>
              )}
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
              <div className="glass-card border-white/20 backdrop-blur-md bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-3 text-white">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-300">Date</p>
                    <p className="font-semibold">{formatDate(event.startDate || event.date)}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card border-white/20 backdrop-blur-md bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-3 text-white">
                  <Clock className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm text-gray-300">Time</p>
                    <p className="font-semibold">{formatTime(event.startDate || event.date, event.endDate)}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card border-white/20 backdrop-blur-md bg-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-3 text-white">
                  <MapPin className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-300">Venue</p>
                    <p className="font-semibold line-clamp-1">
                      {typeof event.venue === 'object' ? event.venue.name : event.venue}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-bold text-white">About This Event</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {event.description || "Experience an unforgettable event that will leave you with memories to last a lifetime."}
              </p>
            </motion.div>

            {/* Event Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="glass-card border-border/50 backdrop-blur-sm bg-card/40 p-6 rounded-xl space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Venue Details
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p className="font-semibold">
                    {typeof event.venue === 'object' ? event.venue.name : event.venue}
                  </p>
                  {typeof event.venue === 'object' && event.venue.address && (
                    <p className="text-sm">{event.venue.address}</p>
                  )}
                  <p className="text-sm">
                    {typeof event.venue === 'object' 
                      ? `${event.venue.city}, ${event.venue.state}`
                      : `${event.city || ''}`
                    }
                  </p>
                </div>
              </div>

              {event.organizer && (
                <div className="glass-card border-border/50 backdrop-blur-sm bg-card/40 p-6 rounded-xl space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-secondary" />
                    Organizer
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p className="font-semibold">{event.organizer.name}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span>Verified Organizer</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Event Gallery Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card border-border/50 backdrop-blur-sm bg-card/40 p-6 rounded-xl"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Event Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                    <span className="text-gray-400">Photo {i}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Ticket Selection */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="glass-card border-border/50 backdrop-blur-sm bg-card/40 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Ticket className="h-6 w-6 text-primary" />
                  Select Tickets
                </h2>
                {getTotalTickets() > 0 && (
                  <Button
                    onClick={() => setShowCart(!showCart)}
                    className="glass-card border-primary/30 text-primary hover:bg-primary/10 gap-2 rounded-full bg-primary/5 backdrop-blur-md"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {getTotalTickets()}
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                {event.ticketTypes && event.ticketTypes.length > 0 ? event.ticketTypes.map((ticketType: any, index: number) => {
                  const quantity = getTicketQuantity(ticketType.id)
                  const isAvailable = ticketType.availableSupply > 0
                  const soldPercentage = ((ticketType.totalSupply - ticketType.availableSupply) / ticketType.totalSupply) * 100
                  
                  return (
                    <motion.div
                      key={ticketType.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`glass-card border backdrop-blur-sm bg-gradient-to-r ${getTicketTypeColor(ticketType.name)} p-5 rounded-xl hover:scale-[1.02] transition-all duration-300`}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                              {getTicketTypeIcon(ticketType.name)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                {ticketType.name}
                                {soldPercentage > 80 && (
                                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Hot
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-gray-300">{ticketType.description || "Standard event access"}</p>
                            </div>
                          </div>
                          <Badge variant={isAvailable ? 'default' : 'secondary'} className="shrink-0">
                            {isAvailable ? 'Available' : 'Sold Out'}
                          </Badge>
                        </div>

                        {/* Price and Availability */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                              ₹{ticketType.price.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-400 ml-2">per ticket</span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-gray-300">
                              <Users className="h-4 w-4" />
                              <span>{ticketType.availableSupply} left</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              of {ticketType.totalSupply} total
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Sold: {soldPercentage.toFixed(0)}%</span>
                            <span>Max {Math.min(ticketType.maxPerWallet || 6, 6)} per person (Anti-scalping)</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                              style={{ width: `${soldPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        {isAvailable ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTicketQuantity(ticketType.id, Math.max(0, quantity - 1), ticketType)}
                                disabled={quantity === 0}
                                className="h-10 w-10 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max={Math.min(ticketType.availableSupply, Math.min(ticketType.maxPerWallet || 6, 6))}
                                  value={quantity}
                                  onChange={(e) => {
                                    const newQuantity = Math.max(0, Math.min(parseInt(e.target.value) || 0, Math.min(ticketType.maxPerWallet || 6, 6)))
                                    updateTicketQuantity(ticketType.id, newQuantity, ticketType)
                                  }}
                                  className="w-16 text-center bg-white/10 border-white/20 text-white"
                                />
                                <span className="text-sm text-gray-400">tickets</span>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTicketQuantity(ticketType.id, Math.min(ticketType.availableSupply, Math.min(ticketType.maxPerWallet || 6, 6), quantity + 1), ticketType)}
                                disabled={quantity >= Math.min(ticketType.availableSupply, Math.min(ticketType.maxPerWallet || 6, 6))}
                                className="h-10 w-10 rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {quantity > 0 && (
                              <div className="text-right">
                                <p className="text-lg font-bold text-white">
                                  ₹{(quantity * ticketType.price).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">subtotal</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button disabled className="w-full h-12 rounded-xl bg-gray-600 text-gray-400">
                            Sold Out
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )
                }) : (
                  <div className="text-center py-12 text-gray-400">
                    <Ticket className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No tickets available</h3>
                    <p>Tickets for this event haven't been released yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shopping Cart Summary */}
            {getTotalTickets() > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card border-primary/30 backdrop-blur-sm bg-primary/5 p-6 rounded-xl"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Your Selection
                </h3>
                
                <div className="space-y-3 mb-4">
                  {ticketSelections.map((selection) => (
                    <div key={selection.ticketTypeId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">
                        {selection.quantity}x {selection.name}
                      </span>
                      <span className="text-white font-semibold">
                        ₹{(selection.quantity * selection.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4 bg-white/10" />

                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ₹{getTotalAmount().toLocaleString()}
                  </span>
                </div>

                <Button
                  onClick={() => {
                    if (isAuthenticated) {
                      setSelectedTicketType({ 
                        selections: ticketSelections, 
                        total: getTotalAmount(),
                        totalTickets: getTotalTickets()
                      })
                    } else {
                      setShowGuestFlow(true)
                    }
                  }}
                  className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-14 rounded-xl text-lg"
                >
                  {isAuthenticated 
                    ? `Purchase ${getTotalTickets()} Ticket${getTotalTickets() > 1 ? 's' : ''}`
                    : `Buy ${getTotalTickets()} Ticket${getTotalTickets() > 1 ? 's' : ''}`
                  }
                  <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                </Button>
              </motion.div>
            )}

            {/* Event Stats */}
            <div className="glass-card border-border/50 backdrop-blur-sm bg-card/40 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">Event Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {event.ticketTypes?.reduce((acc: number, tt: any) => acc + (tt.totalSupply - tt.availableSupply), 0) || 0}
                  </p>
                  <p className="text-sm text-gray-400">Tickets Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-secondary">
                    {event.ticketTypes?.reduce((acc: number, tt: any) => acc + tt.availableSupply, 0) || 0}
                  </p>
                  <p className="text-sm text-gray-400">Available</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Purchase Dialog */}
      {selectedTicketType && (
        <EnhancedPurchaseDialog
          selections={selectedTicketType}
          eventTitle={event.title}
          onClose={() => setSelectedTicketType(null)}
          onSuccess={() => {
            setSelectedTicketType(null)
            setTicketSelections([])
          }}
        />
      )}

      {/* Guest Buying Flow */}
      {showGuestFlow && (
        <GuestBuyingFlow
          event={event}
          ticketSelections={ticketSelections}
          totalAmount={getTotalAmount()}
          onClose={() => setShowGuestFlow(false)}
          onSuccess={() => {
            setShowGuestFlow(false)
            setTicketSelections([])
          }}
        />
      )}
    </div>
  )
}