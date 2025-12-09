"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { Verified, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Event } from "@/lib/types"

interface OpenSeaEventCardProps {
  event: Event
}

export function OpenSeaEventCard({ event }: OpenSeaEventCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isSoldOut = event.availableTickets === 0
  const soldPercentage = ((event.totalTickets - event.availableTickets) / event.totalTickets) * 100

  // Calculate price change percentage
  const priceChange = Math.random() > 0.5 ? Math.random() * 10 : -Math.random() * 10

  return (
    <Link href={`/event/${event.id}`}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-xl bg-[#1F1F1F] border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group"
      >
        {/* Compact landscape image section 3:2 ratio */}
        <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-purple-500/10 to-cyan-500/10">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Compact status badge top-left */}
          {event.isLive && (
            <div className="absolute top-2 left-2">
              <div className="px-2.5 py-1 rounded-md bg-green-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                MINTING NOW
              </div>
            </div>
          )}
          {isSoldOut && (
            <div className="absolute top-2 left-2">
              <div className="px-2.5 py-1 rounded-md bg-gray-600 text-white text-[10px] font-bold">SOLD OUT</div>
            </div>
          )}

          {/* Trending indicator top-right */}
          {event.trending && (
            <div className="absolute top-2 right-2">
              <div className="p-1.5 rounded-md bg-purple-500 shadow-lg">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            </div>
          )}

          {/* Bottom overlay with title and verification */}
          <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white text-sm leading-tight line-clamp-1 flex-1">{event.title}</h3>
              <Verified className="w-4 h-4 text-cyan-400 shrink-0" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Minimal info section */}
        <div className="p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">Floor price</p>
              <p className="text-sm font-bold text-white">₹{event.price.toLocaleString("en-IN")}</p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-semibold ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Subtle hover glow effect */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 pointer-events-none"
          />
        )}
      </motion.div>
    </Link>
  )
}
