"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface ArtistCardProps {
  name: string
  image: string
  color: string
}

export function ArtistCard({ name, image, color }: ArtistCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center gap-3 min-w-[160px]">
      <div
        className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-white shadow-lg relative"
        style={{ backgroundColor: color }}
      >
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover mix-blend-overlay opacity-90"
        />
      </div>
      <span className="font-semibold text-gray-900">{name}</span>
    </motion.div>
  )
}
