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
        whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
        className="group rounded-3xl overflow-hidden bg-white shadow-sm"
      >
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {badge && (
            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
              {badge}
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {title}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-lg font-bold text-gray-900">{price}</span>
            <span className="text-sm text-purple-600 font-medium">onwards</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
