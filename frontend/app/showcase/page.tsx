"use client"

import { PremiumEventCard } from "@/components/shared/premium-event-card"
import { motion } from "framer-motion"

const showcaseEvents = [
  {
    id: "showcase-1",
    title: "Diljit Dosanjh Live in Mumbai",
    image: "/concert-stage-purple-lights.jpg",
    date: "Feb 15, 2025",
    location: "DY Patil Stadium",
    price: "₹1,999 onwards",
    category: "MUSIC",
    seatsLeft: 150,
    totalSeats: 15000,
    isHot: true,
  },
  {
    id: "showcase-2",
    title: "Sunburn Festival Goa",
    image: "/edm-festival-beach-sunset.jpg",
    date: "Dec 28, 2025",
    location: "Vagator Beach",
    price: "₹3,499 onwards",
    category: "FESTIVAL",
    seatsLeft: 5000,
    totalSeats: 20000,
    isHot: false,
  },
  {
    id: "showcase-3",
    title: "IPL 2025: MI vs CSK",
    image: "/cricket-stadium-floodlights.jpg",
    date: "Apr 20, 2025",
    location: "Wankhede Stadium",
    price: "₹1,499 onwards",
    category: "SPORTS",
    seatsLeft: 450,
    totalSeats: 32000,
    isHot: true,
  },
]

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] py-20">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-black text-white leading-none">
            Premium Event <span className="text-gradient-neon">Cards</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The most beautiful, addictive event cards with 3D tilt, GSAP scroll animations, floating particles, and
            holographic shine effects.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {showcaseEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
            >
              <PremiumEventCard {...event} />
            </motion.div>
          ))}
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            {[
              "3D mouse-tracking tilt effect with Framer Motion",
              "GSAP scroll-triggered entrance animations",
              "Holographic shine sweep on hover",
              "Floating AI particles with physics",
              "Neon border glow with blur shadows",
              "Pulsing HOT badge animation",
              "Live seats-left circle with color coding",
              "Gradient price with gold shine",
              "Full-width glowing CTA button",
              "Glassmorphism with backdrop blur",
              "60fps performance optimized",
              "Mobile-responsive with haptic feel",
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + idx * 0.05 }}
                className="flex items-center gap-3 glass-card p-4 rounded-xl border border-white/10"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
