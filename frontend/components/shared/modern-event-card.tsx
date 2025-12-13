"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"

interface ModernEventCardProps {
  id: string
  title: string
  image: string
  venue: string
  date: string
  price: string
  badge?: string
}

export function ModernEventCard({ id, title, image, venue, date, price, badge }: ModernEventCardProps) {
  return (
    <Link href={`/event/${id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        className="group rounded-2xl overflow-hidden bg-[#161616] border border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
          {badge && (
            <div className="absolute top-4 right-4 bg-[#A78BFA] text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
              {badge}
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <h3 className="font-bold text-lg text-[#FFFFFF] line-clamp-2 group-hover:text-[#A78BFA] transition-colors">
            {title}
          </h3>
          <div className="space-y-2 text-sm text-[#B0B0B0]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-[#333333]">
            <span className="text-lg font-bold text-[#FFFFFF]">{price}</span>
            <span className="text-sm text-[#A78BFA] font-medium">onwards</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
