"use client"

import type { Event } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, TrendingUp, Users, Sparkles, Star, Flame } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface EventCardProps {
  event: Event
  index?: number
  variant?: "hero" | "spotlight" | "glass" | "compact" | "wide" | "stats"
}

export function EventCardV2({ event, index = 0, variant = "compact" }: EventCardProps) {
  const soldPercentage = (event.soldTickets / event.totalTickets) * 100
  const isAlmostSold = soldPercentage > 80
  const isTrending = soldPercentage > 60

  // Hero variant - Large immersive card with bold typography
  if (variant === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative group"
      >
        <Link href={`/event/${event.id}`}>
          <div className="relative h-[600px] rounded-3xl overflow-hidden border border-primary/20">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            {event.featured && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-2xl"
              >
                <Sparkles className="h-4 w-4" />
                FEATURED
              </motion.div>
            )}

            <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 space-y-6">
              <div className="space-y-4">
                <Badge className="bg-white/20 backdrop-blur-md border-0 text-white px-4 py-1.5 text-sm">
                  {event.category.toUpperCase()}
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                  {event.title}
                </h1>
                <p className="text-2xl md:text-3xl text-white/90 font-semibold">{event.artist}</p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-white/80 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="font-medium">
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-6 w-6" />
                  <span className="font-medium">{event.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span className="font-medium">{event.soldTickets.toLocaleString()} going</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/20">
                <div>
                  <p className="text-white/60 text-sm mb-1">Starting from</p>
                  <p className="text-5xl font-black text-white">₹{event.price.toLocaleString()}</p>
                </div>
                {isAlmostSold && (
                  <Badge className="bg-red-500 text-white border-0 px-4 py-2 text-base gap-2">
                    <Flame className="h-5 w-5" />
                    SELLING FAST
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Spotlight variant - Lido-inspired glass card with 3D depth
  if (variant === "spotlight") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group"
      >
        <Link href={`/event/${event.id}`}>
          <div className="relative h-[500px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative h-full p-8 flex flex-col justify-between">
              <div>
                {event.featured && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/80 to-secondary/80 backdrop-blur-sm text-white text-xs font-bold mb-6">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    TOP PICK
                  </div>
                )}

                <div className="space-y-3">
                  <Badge variant="outline" className="border-white/30 text-white backdrop-blur-sm">
                    {event.category.toUpperCase()}
                  </Badge>
                  <h3 className="text-4xl font-black text-white leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text transition-all duration-300">
                    {event.title}
                  </h3>
                  <p className="text-xl text-white/80 font-medium">{event.artist}</p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs mb-1">FROM</p>
                    <p className="text-3xl font-black text-white">₹{event.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60 text-xs">
                      <MapPin className="h-4 w-4" />
                      <span>{event.city}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{event.soldTickets.toLocaleString()} attending</span>
                  </div>
                  {isTrending && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 border-0 text-white text-xs gap-1">
                      <TrendingUp className="h-3 w-3" />
                      TRENDING
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </div>
        </Link>
      </motion.div>
    )
  }

  // Glass variant - Ultra-modern glassmorphism inspired by Blur.io
  if (variant === "glass") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link href={`/event/${event.id}`}>
          <Card className="group overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {event.featured && (
                <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Star className="h-5 w-5 text-white fill-current" />
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-bold text-lg text-white line-clamp-2 mb-1">{event.title}</h3>
                <p className="text-sm text-white/70">{event.artist}</p>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{event.city}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <p className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    ₹{event.price.toLocaleString()}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize bg-white/10 border-0 backdrop-blur-sm">
                  {event.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // Stats variant - Blur.io inspired with data density
  if (variant === "stats") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link href={`/event/${event.id}`}>
          <Card className="group border-border/50 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="flex items-stretch">
              <div className="relative w-32 flex-shrink-0">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card" />
              </div>

              <CardContent className="flex-1 p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{event.artist}</p>
                    </div>
                    {isTrending && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs shrink-0">
                        +{Math.floor(soldPercentage)}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Price</p>
                    <p className="text-sm font-bold text-primary">₹{(event.price / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Sold</p>
                    <p className="text-sm font-bold">{soldPercentage.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">City</p>
                    <p className="text-sm font-bold line-clamp-1">{event.city}</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // Wide variant - Full-width showcase
  if (variant === "wide") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <Link href={`/event/${event.id}`}>
          <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 bg-gradient-to-r from-card to-darker-surface/50">
            <div className="flex flex-col md:flex-row items-stretch">
              <div className="relative md:w-80 aspect-[16/9] md:aspect-auto flex-shrink-0 overflow-hidden">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card md:to-card/90" />
                {event.featured && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary to-secondary border-0 text-white">
                    Featured
                  </Badge>
                )}
              </div>

              <CardContent className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="capitalize">
                        {event.category}
                      </Badge>
                      {isTrending && (
                        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">{event.artist}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-IN", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.soldTickets.toLocaleString()} attending</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/50">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      ₹{event.price.toLocaleString()}
                    </p>
                  </div>
                  {isAlmostSold && (
                    <Badge className="bg-red-500 text-white border-0 px-4 py-2 gap-2">
                      <Flame className="h-4 w-4" />
                      Almost Sold Out
                    </Badge>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // Compact variant - Default efficient card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/event/${event.id}`}>
        <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 bg-card">
          <div className="relative aspect-[3/2] overflow-hidden">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {event.featured && (
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Star className="h-4 w-4 text-white fill-current" />
              </div>
            )}
            {isAlmostSold && (
              <Badge className="absolute top-3 left-3 bg-red-500 border-0 text-white text-xs gap-1">
                <Flame className="h-3 w-3" />
                Hot
              </Badge>
            )}
          </div>
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{event.artist}</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{event.city}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ₹{event.price.toLocaleString()}
              </p>
              <Badge variant="secondary" className="capitalize text-xs">
                {event.category}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
