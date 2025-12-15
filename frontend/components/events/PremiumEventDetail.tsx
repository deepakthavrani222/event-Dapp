"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Ticket, Clock, Users, Plus, Minus, ShoppingCart, ChevronDown, ChevronUp, Globe, Navigation, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { EnhancedPurchaseDialog } from "@/components/events/EnhancedPurchaseDialog"

// District-Style Booking Flow Component
function DistrictBookingFlow({ 
  event, 
  isDark, 
  ticketSelections, 
  updateTicketQuantity, 
  getTicketQuantity, 
  getTotalAmount, 
  getTotalTickets,
  onClose 
}: {
  event: any
  isDark: boolean
  ticketSelections: TicketSelection[]
  updateTicketQuantity: (id: string, qty: number, type: any) => void
  getTicketQuantity: (id: string) => number
  getTotalAmount: () => number
  getTotalTickets: () => number
  onClose: () => void
}) {
  const [step, setStep] = useState<'select' | 'review' | 'payment'>('select')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes

  // Countdown timer
  useState(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)
    return () => clearInterval(timer)
  })

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const bookingFee = Math.round(getTotalAmount() * 0.0825) // ~8.25% booking fee
  const grandTotal = getTotalAmount() + bookingFee

  // Step 3: MetaMask Payment
  if (step === 'payment') {
    return (
      <EnhancedPurchaseDialog
        selections={{
          selections: ticketSelections,
          total: getTotalAmount(),
          totalTickets: getTotalTickets(),
          eventId: event._id || event.id
        }}
        eventTitle={event.title}
        onClose={onClose}
        onSuccess={() => onClose()}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {/* Header */}
      <div className="bg-[#1C1C1C] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center gap-2 text-white hover:text-gray-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h1 className="font-bold text-lg">{event.title}</h1>
            <p className="text-sm text-gray-400">
              {event.startDate ? format(new Date(event.startDate), 'EEE, dd MMM') : ''} • {typeof event.venue === 'object' ? event.venue?.city : event.city || ''}
            </p>
          </div>
          <div className="w-10" />
        </div>

      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 'select' && (
          <>
            {/* Choose Tickets Header */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-wide">CHOOSE TICKETS</h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Ticket Types */}
            <div className="space-y-4">
              {event.ticketTypes && event.ticketTypes.length > 0 ? (
                event.ticketTypes.map((ticketType: any) => {
                  const quantity = getTicketQuantity(ticketType._id || ticketType.id)
                  const isAvailable = ticketType.availableSupply > 0
                  
                  return (
                    <div 
                      key={ticketType._id || ticketType.id}
                      className="border border-gray-200 rounded-lg p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{ticketType.name}</h3>
                          <p className="text-xl font-bold text-gray-900 mb-2">₹{ticketType.price.toLocaleString()}</p>
                          <ul className="text-sm text-gray-500 space-y-1">
                            <li>• {ticketType.description || 'Standard event access'}</li>
                            {ticketType.availableSupply && <li>• {ticketType.availableSupply} tickets remaining</li>}
                          </ul>
                        </div>
                        
                        {isAvailable ? (
                          <div className="flex items-center bg-[#1C1C1C] rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateTicketQuantity(ticketType._id || ticketType.id, Math.max(0, quantity - 1), ticketType)}
                              className="px-3 py-2 text-white hover:bg-gray-700 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 text-white font-medium min-w-[40px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateTicketQuantity(ticketType._id || ticketType.id, Math.min(10, quantity + 1), ticketType)}
                              className="px-3 py-2 text-white hover:bg-gray-700 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-red-500 font-medium">Sold Out</span>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No tickets available for this event
                </div>
              )}
            </div>
          </>
        )}

        {step === 'review' && (
          <>
            {/* Review Header */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">Review your booking</h2>

            {/* Selected Tickets */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  {ticketSelections.map((selection) => (
                    <div key={selection.ticketTypeId} className="mt-1">
                      <p className="text-gray-600">{selection.name}</p>
                      <p className="text-sm text-gray-500">{selection.quantity} ticket{selection.quantity > 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
                <p className="font-bold text-gray-900">₹{getTotalAmount().toLocaleString()}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4 tracking-wide">PAYMENT DETAILS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Amount</span>
                  <span className="text-gray-900">₹{getTotalAmount().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Fee</span>
                  <div className="text-right">
                    <span className="text-gray-900">₹{bookingFee.toLocaleString()}</span>
                    <p className="text-xs text-gray-400">Includes taxes</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Grand Total</span>
                  <span className="font-bold text-gray-900 text-xl">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar */}
      {getTotalTickets() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{step === 'review' ? grandTotal.toLocaleString() : getTotalAmount().toLocaleString()}</p>
              <p className="text-sm text-gray-500">{getTotalTickets()} ticket{getTotalTickets() > 1 ? 's' : ''}</p>
            </div>
            {step === 'select' ? (
              <Button
                onClick={() => setStep('review')}
                className="bg-[#1C1C1C] hover:bg-[#2C2C2C] text-white px-8 py-3 rounded-lg font-semibold"
              >
                VIEW CART
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                  className="border-gray-300 text-gray-700 px-6 py-3"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('payment')}
                  className="bg-[#1C1C1C] hover:bg-[#2C2C2C] text-white px-8 py-3 rounded-lg font-semibold"
                >
                  CONTINUE
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
import { useTheme } from "next-themes"
import { Footer } from "@/components/shared/footer"
import { PublicHeader } from "@/components/shared/public-header"

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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([])
  const [showAboutMore, setShowAboutMore] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'Date TBD'
      return format(date, 'EEE, dd MMM, h:mm a')
    } catch {
      return 'Date TBD'
    }
  }

  const formatDateRange = (startDateStr: string, endDateStr?: string) => {
    try {
      const startDate = new Date(startDateStr)
      if (isNaN(startDate.getTime())) return 'Date TBD'
      
      const startFormatted = format(startDate, 'EEE, dd MMM, h:mm a')
      if (!endDateStr) return startFormatted
      
      const endDate = new Date(endDateStr)
      if (isNaN(endDate.getTime())) return startFormatted
      
      const endFormatted = format(endDate, 'EEE, dd MMM, h:mm a')
      return `${startFormatted} – ${endFormatted}`
    } catch {
      return 'Date TBD'
    }
  }

  const getEventDuration = () => {
    if (!event.startDate || !event.endDate) return null
    try {
      const start = new Date(event.startDate)
      const end = new Date(event.endDate)
      const diffMs = end.getTime() - start.getTime()
      const diffHours = Math.round(diffMs / (1000 * 60 * 60))
      if (diffHours < 1) return '< 1 Hour'
      if (diffHours === 1) return '1 Hour'
      return `${diffHours} Hours`
    } catch {
      return null
    }
  }

  const updateTicketQuantity = (ticketTypeId: string, quantity: number, ticketType: any) => {
    setTicketSelections(prev => {
      if (quantity === 0) {
        return prev.filter(t => t.ticketTypeId !== ticketTypeId)
      }
      const existing = prev.find(t => t.ticketTypeId === ticketTypeId)
      if (existing) {
        return prev.map(t => t.ticketTypeId === ticketTypeId ? { ...t, quantity } : t)
      }
      return [...prev, { ticketTypeId, quantity, price: ticketType.price, name: ticketType.name }]
    })
  }

  const getTicketQuantity = (ticketTypeId: string) => {
    return ticketSelections.find(t => t.ticketTypeId === ticketTypeId)?.quantity || 0
  }

  const getTotalAmount = () => {
    return ticketSelections.reduce((total, s) => total + (s.quantity * s.price), 0)
  }

  const getTotalTickets = () => {
    return ticketSelections.reduce((total, s) => total + s.quantity, 0)
  }

  const getLowestPrice = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return event.price || 0
    return Math.min(...event.ticketTypes.map((t: any) => t.price))
  }

  const getImageUrl = () => {
    if (!event.image) return '/concert-stage-purple-lights.jpg'
    if (event.image === '/placeholder.svg') return '/concert-stage-purple-lights.jpg'
    if (event.image.startsWith('blob:')) return '/concert-stage-purple-lights.jpg'
    return event.image
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      <PublicHeader />
      
      <div className="pt-20">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          {/* Top Section - Image + Info Card */}
          <div className="grid lg:grid-cols-5 gap-8 mb-12">
            {/* Event Image - Left Side */}
            <div className="lg:col-span-3 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
                <img
                  src={getImageUrl()}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/concert-stage-purple-lights.jpg'
                  }}
                />
              </div>
            </div>

            {/* Event Info Card - Right Side */}
            <div className="lg:col-span-2">
              <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}>
                {/* Event Title */}
                <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                  {event.title}
                </h1>

                {/* Category */}
                <div className="flex items-center gap-2 mb-4">
                  <Ticket className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {event.category || 'Music, Entertainment'}
                  </span>
                </div>

                {/* Date & Time */}
                <div className="flex items-start gap-2 mb-4">
                  <Calendar className={`h-4 w-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatDateRange(event.startDate, event.endDate)}
                  </span>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-2 mb-6">
                  <MapPin className={`h-4 w-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {typeof event.venue === 'object' ? event.venue?.name : event.venue}
                    {event.city ? `, ${event.city}` : (typeof event.venue === 'object' && event.venue?.city ? `, ${event.venue.city}` : '')}
                  </span>
                </div>

                {/* Price & Book Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`} style={{ fontFamily: 'Inter, sans-serif' }}>Starts from</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                      ₹{getLowestPrice().toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPurchaseDialog(true)}
                    className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-6 py-3 rounded-lg font-semibold"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    BOOK TICKETS
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* About the Event */}
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
              About the Event
            </h2>
            <div className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
              <p className={showAboutMore ? '' : 'line-clamp-4'}>
                {event.description || 'No description available for this event.'}
              </p>
              {event.description && event.description.length > 200 && (
                <button
                  onClick={() => setShowAboutMore(!showAboutMore)}
                  className={`mt-2 font-medium flex items-center gap-1 ${isDark ? 'text-purple-400' : 'text-gray-900'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {showAboutMore ? 'Show less' : 'Show more'}
                  {showAboutMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Event Guide */}
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
              Event Guide
            </h2>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Globe className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Language</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>English</p>
                </div>
              </div>
              
              {getEventDuration() && (
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Clock className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Duration</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{getEventDuration()}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Users className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Age Requirement</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>18 yrs & above</p>
                </div>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="mb-8">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
              Venue
            </h2>
            <div className={`rounded-xl p-4 ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                    {typeof event.venue === 'object' ? event.venue?.name : event.venue || 'Venue TBD'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {typeof event.venue === 'object' 
                      ? `${event.venue?.address || ''}, ${event.venue?.city || ''}, ${event.venue?.state || ''}`.replace(/^, |, $/g, '')
                      : event.address || `${event.venue}, ${event.city || ''}`
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  className={`flex items-center gap-2 ${isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-gray-900 hover:bg-gray-50'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  onClick={() => {
                    const venueName = typeof event.venue === 'object' ? event.venue?.name : event.venue
                    const venueCity = typeof event.venue === 'object' ? event.venue?.city : event.city
                    const query = encodeURIComponent(`${venueName} ${venueCity || ''}`)
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
                  }}
                >
                  <Navigation className="h-4 w-4" />
                  GET DIRECTIONS
                </Button>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mb-8">
            <div 
              className={`rounded-xl border ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
            >
              <button
                onClick={() => setShowTerms(!showTerms)}
                className={`w-full p-4 flex items-center justify-between ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                <span className="font-semibold">Terms & Conditions</span>
                {showTerms ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              
              {showTerms && (
                <div className={`px-4 pb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Please carry a valid ID proof along with you.</li>
                    <li>No refunds on purchased ticket are possible, even in case of any rescheduling.</li>
                    <li>Security procedures, including frisking remain the right of the management.</li>
                    <li>No dangerous or potentially hazardous objects including but not limited to weapons, knives, guns, fireworks, helmets, laser devices, bottles, musical instruments will be allowed in the venue.</li>
                    <li>The sponsors/performers/organizers are not responsible for any injury or damage occurring due to the event.</li>
                    <li>People in an inebriated state may not be allowed entry.</li>
                    <li>Organizers hold the right to deny late entry to the event.</li>
                    <li>Venue rules apply.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* District-Style Booking Flow */}
      {showPurchaseDialog && (
        <DistrictBookingFlow
          event={event}
          isDark={isDark}
          ticketSelections={ticketSelections}
          updateTicketQuantity={updateTicketQuantity}
          getTicketQuantity={getTicketQuantity}
          getTotalAmount={getTotalAmount}
          getTotalTickets={getTotalTickets}
          onClose={() => setShowPurchaseDialog(false)}
        />
      )}
    </div>
  )
}
