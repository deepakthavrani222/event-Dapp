"use client"
import { MapPin } from "lucide-react"
import Link from "next/link"
import type { Event } from "@/lib/types"

interface OpenSeaEventCardProps {
  event: Event
  compact?: boolean
}

export function OpenSeaEventCard({ event, compact = false }: OpenSeaEventCardProps) {
  const isSoldOut = event.availableTickets === 0

  // Get varied default image based on event title
  const getDefaultImage = () => {
    const allImages = [
      '/concert-stage-purple-lights.jpg',
      '/comedy-show-stage-spotlight.jpg',
      '/cricket-stadium-floodlights.jpg',
      '/theater-stage-dramatic-lighting.jpg',
      '/music-festival-crowd-stage.jpg',
      '/tech-conference-stage-futuristic.jpg',
      '/edm-festival-beach-sunset.jpg',
      '/amusement-park-colorful.jpg',
      '/indie-music-festival-outdoor.jpg',
      '/coldplay-concert-colorful-lights.jpg',
      '/sufi-concert-intimate-venue.jpg'
    ]
    
    // Use event title hash to get consistent but varied images
    const hash = event.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return allImages[hash % allImages.length]
  }

  // Check if image is valid (not blob URL, not placeholder, and exists)
  const isValidImage = () => {
    if (!event.image) return false
    if (event.image === '/placeholder.svg') return false
    if (event.image.startsWith('blob:')) return false
    if (event.image.includes('cloudinary.com')) return true
    if (event.image.includes('unsplash.com')) return true
    if (event.image.startsWith('https://') || event.image.startsWith('http://')) return true
    if (event.image.startsWith('/') && !event.image.includes('placeholder')) return true
    return false
  }

  const imageUrl = isValidImage() ? event.image : getDefaultImage()

  // Format date and time
  const formatDateTime = () => {
    const date = new Date(event.date)
    const day = date.toLocaleDateString('en-IN', { weekday: 'short' })
    const dayNum = date.getDate()
    const month = date.toLocaleDateString('en-IN', { month: 'short' })
    const time = event.time || date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${day}, ${dayNum} ${month}, ${time}`
  }

  return (
    <Link href={`/event/${event.id}`}>
      <div
        className={`relative rounded-xl bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden ${compact ? 'w-56' : 'w-72'} hover:-translate-y-1`}
      >
        {/* Image section - clean without overlay text */}
        <div className={`relative bg-gray-100 ${compact ? 'aspect-[4/5]' : 'aspect-[4/5]'}`}>
          <img
            src={imageUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/concert-stage-purple-lights.jpg';
            }}
          />

          {/* Status badge top-left */}
          {event.isLive && (
            <div className="absolute top-3 left-3">
              <div className={`rounded bg-green-500 text-white font-semibold flex items-center gap-1.5 shadow ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>
          )}
          {isSoldOut && (
            <div className="absolute top-3 left-3">
              <div className={`rounded bg-gray-700 text-white font-semibold ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>SOLD OUT</div>
            </div>
          )}
        </div>

        {/* Content section - white/light background */}
        <div className={`bg-white ${compact ? 'p-3 space-y-1.5' : 'p-4 space-y-2'}`}>
          {/* Date and Time - colored text */}
          <p className={`font-medium text-red-500 ${compact ? 'text-xs' : 'text-sm'}`}>
            {formatDateTime()}
          </p>

          {/* Event Title - dark and bold */}
          <h3 className={`font-bold text-gray-900 leading-tight line-clamp-2 ${compact ? 'text-sm min-h-[2rem]' : 'text-base min-h-[2.5rem]'}`}>
            {event.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin className={`flex-shrink-0 ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
            <p className={`line-clamp-1 ${compact ? 'text-xs' : 'text-sm'}`}>
              {typeof event.venue === 'object' && event.venue?.name 
                ? `${event.venue.name}${event.venue.city ? `, ${event.venue.city}` : ''}`
                : typeof event.venue === 'string' 
                  ? event.venue 
                  : event.city || 'Venue TBA'}
            </p>
          </div>

          {/* Price - only show for non-compact cards */}
          {!compact && (
            <p className="text-sm text-gray-600 pt-1">
              ₹{event.price.toLocaleString("en-IN")} onwards
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
