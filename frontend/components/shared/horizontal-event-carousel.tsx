"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { OpenSeaEventCard } from "@/components/shared/opensea-event-card"
import type { Event } from "@/lib/types"

interface HorizontalEventCarouselProps {
  title: string
  subtitle?: string
  events: Event[]
  showViewAll?: boolean
  onViewAll?: () => void
}

export function HorizontalEventCarousel({ 
  title, 
  subtitle, 
  events, 
  showViewAll = false, 
  onViewAll 
}: HorizontalEventCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8 // Scroll 80% of container width
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const { scrollLeft, scrollWidth, clientWidth } = container
      
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // 10px buffer
    }
  }

  if (!events || events.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black text-white mb-1">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 text-sm">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Horizontal Scrolling Container */}
      <div className="relative">
        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-80" // Fixed width for consistent card size
            >
              <OpenSeaEventCard event={event} />
            </motion.div>
          ))}
        </div>
        
        {/* Left Arrow - Positioned outside cards area */}
        <Button
          variant="outline"
          size="sm"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-12 h-12 p-0 border-white/20 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed bg-black/50 backdrop-blur-sm z-50 shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Right Arrow - Positioned outside cards area */}
        <Button
          variant="outline"
          size="sm"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="absolute -right-16 top-1/2 transform -translate-y-1/2 w-12 h-12 p-0 border-white/20 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed bg-black/50 backdrop-blur-sm z-50 shadow-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        
        {/* Gradient Fade Effects */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </div>
  )
}