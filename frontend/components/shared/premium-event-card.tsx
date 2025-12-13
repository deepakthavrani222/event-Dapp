"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Calendar, MapPin } from "lucide-react"
import Link from "next/link"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface PremiumEventCardProps {
  id: string
  title: string
  image: string
  date: string
  location: string
  price: string
  category: string
  seatsLeft: number
  totalSeats: number
  isHot?: boolean
}

export function PremiumEventCard({
  id,
  title,
  image,
  date,
  location,
  price,
  category,
  seatsLeft,
  totalSeats,
  isHot = false,
}: PremiumEventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])
  const [isHovered, setIsHovered] = useState(false)

  // 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { stiffness: 300, damping: 30 })

  // Calculate seats percentage for color
  const seatsPercentage = (seatsLeft / totalSeats) * 100
  const seatsColor = seatsPercentage > 50 ? "#10b981" : seatsPercentage > 20 ? "#f59e0b" : "#ef4444"

  // GSAP scroll animation
  useEffect(() => {
    if (!cardRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse",
        },
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        ease: "power3.out",
      })
    })

    return () => ctx.revert()
  }, [])

  // Holographic shine on hover
  useEffect(() => {
    if (!isHovered || !shineRef.current) return

    gsap.to(shineRef.current, {
      x: "100%",
      duration: 0.6,
      ease: "power2.inOut",
    })

    return () => {
      if (shineRef.current) {
        gsap.set(shineRef.current, { x: "-100%" })
      }
    }
  }, [isHovered])

  // Generate particles on hover
  useEffect(() => {
    if (!isHovered) {
      setParticles([])
      return
    }

    const interval = setInterval(() => {
      const newParticles = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: 100,
      }))
      setParticles((prev) => [...prev, ...newParticles].slice(-15))
    }, 150)

    return () => clearInterval(interval)
  }, [isHovered])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  return (
    <Link href={`/event/${id}`}>
      <motion.div
        ref={cardRef}
        className="group relative w-full h-[420px] rounded-3xl overflow-hidden cursor-pointer"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02, y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Neon border glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

        {/* Glass card container */}
        <div className="relative h-full rounded-3xl bg-[#161616] backdrop-blur-xl border border-[#333333] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {/* Holographic shine sweep */}
          <div
            ref={shineRef}
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full pointer-events-none"
            style={{ transform: "skewX(-20deg)" }}
          />

          {/* Hero image with gradient overlay */}
          <div className="relative h-[240px] overflow-hidden">
            <img
              src={image || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />

            {/* HOT badge with pulsing animation */}
            {isHot && (
              <motion.div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold flex items-center gap-1.5"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.5 }}
                >
                  🔥
                </motion.span>
                HOT
              </motion.div>
            )}

            {/* Seats left circle */}
            <motion.div
              className="absolute top-4 right-4 w-16 h-16 rounded-full flex flex-col items-center justify-center text-white font-bold backdrop-blur-xl"
              style={{
                background: `conic-gradient(${seatsColor} ${seatsPercentage}%, rgba(255,255,255,0.1) 0%)`,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="absolute inset-[3px] rounded-full bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <span className="text-xs">{seatsLeft}</span>
                <span className="text-[10px] opacity-70">left</span>
              </div>
            </motion.div>

            {/* Category badge */}
            <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
              {category}
            </div>
          </div>

          {/* Content section */}
          <div className="p-5 space-y-3">
            {/* Title */}
            <h3 className="text-xl font-bold text-[#FFFFFF] line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#A78BFA] group-hover:to-[#C084FC] transition-all duration-300">
              {title}
            </h3>

            {/* Info row */}
            <div className="flex items-center gap-4 text-sm text-[#B0B0B0]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{location}</span>
              </div>
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs text-[#B0B0B0] mb-0.5">Starting from</div>
                <div className="text-xl font-bold text-[#A78BFA]">
                  {price}
                </div>
              </div>
            </div>
          </div>

          {/* Glowing gradient button */}
          <div className="absolute bottom-5 left-5 right-5">
            <motion.button
              className="relative w-full py-3.5 rounded-xl font-bold text-white overflow-hidden group/btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated gradient background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500"
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              />

              {/* Shine sweep effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{ transform: "skewX(-20deg)" }}
              />

              <span className="relative flex items-center justify-center gap-2">
                Grab Now
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>
          </div>

          {/* Floating particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full pointer-events-none"
              style={{
                left: `${particle.x}%`,
                bottom: "0%",
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                boxShadow: "0 0 8px #8B5CF6",
              }}
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{
                y: -200,
                opacity: 0,
                scale: 1,
                x: Math.random() * 40 - 20,
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              onAnimationComplete={() => {
                setParticles((prev) => prev.filter((p) => p.id !== particle.id))
              }}
            />
          ))}
        </div>
      </motion.div>
    </Link>
  )
}
