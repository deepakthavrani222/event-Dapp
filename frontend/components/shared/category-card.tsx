"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface CategoryCardProps {
  title: string
  icon: string
  href: string
}

export function CategoryCard({ title, icon, href }: CategoryCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -4 }}
        className="relative rounded-3xl overflow-hidden p-6 min-w-[140px] h-[160px] flex flex-col items-center justify-between"
        style={{
          background: "linear-gradient(135deg, #FFF8DC 0%, #FFEAA7 100%)",
        }}
      >
        <div className="text-6xl mb-2">{icon}</div>
        <h3 className="text-sm font-bold text-amber-900 text-center uppercase tracking-wide">{title}</h3>
      </motion.div>
    </Link>
  )
}
