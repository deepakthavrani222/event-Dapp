"use client"

import type { Event } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface EventCardProps {
  event: Event
  index?: number
  variant?: "default" | "large" | "minimal" | "glass"
}

export function EventCard({ event, index = 0, variant = "default" }: EventCardProps) {
  const soldPercentage = (event.soldTickets / event.totalTickets) * 100
  const isAlmostSold = soldPercentage > 80

  if (variant === "large") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="col-span-2 row-span-2"
      >
        <Link href={`/event/${event.id}`}>
          <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 h-full bg-gradient-to-br from-card via-card to-darker-surface">
            <div className="relative aspect-[2/1] overflow-hidden">
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              {event.featured && (
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-primary via-secondary to-primary border-0 text-white px-4 py-1.5 animate-pulse">
                  Featured
                </Badge>
              )}
              {isAlmostSold && (
                <Badge className="absolute top-4 right-4 bg-destructive/90 backdrop-blur-sm border-0 text-white gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Almost Sold
                </Badge>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="space-y-3">
                  <h3 className="font-bold text-3xl line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-lg text-white/90 font-medium">{event.artist}</p>
                  <div className="flex items-center gap-6 text-sm text-white/80">
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
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Starting from</span>
                  <p className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ₹{event.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {event.category}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.soldTickets.toLocaleString()} attending
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  if (variant === "glass") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link href={`/event/${event.id}`}>
          <Card className="group overflow-hidden border border-primary/20 hover:border-primary/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 bg-card/40 backdrop-blur-xl">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 group-hover:blur-sm"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {event.featured && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Featured
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-bold text-lg text-white line-clamp-2 mb-1">{event.title}</h3>
                <p className="text-sm text-white/80">{event.artist}</p>
              </div>
            </div>
            <CardContent className="p-4 space-y-3 bg-gradient-to-b from-card/60 to-card/40 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{event.city}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <div>
                  <p className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ₹{event.price.toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="capitalize border-primary/30 text-primary">
                  {event.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link href={`/event/${event.id}`}>
          <div className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {event.featured && (
              <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm border-0 text-white">
                Featured
              </Badge>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white space-y-3">
              <Badge variant="secondary" className="capitalize mb-2">
                {event.category}
              </Badge>
              <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-white/90">{event.artist}</p>

              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-white/70">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/70">
                    <MapPin className="h-3 w-3" />
                    <span>{event.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60">from</p>
                  <p className="font-bold text-xl">₹{event.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Default variant with improved styling
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/event/${event.id}`}>
        <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 bg-gradient-to-br from-card to-darker-surface/50">
          <div className="relative aspect-[3/2] overflow-hidden">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {event.featured && (
              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-primary to-secondary border-0 text-white">
                Featured
              </Badge>
            )}
            {isAlmostSold && (
              <Badge className="absolute top-3 right-3 bg-destructive border-0 text-white gap-1">
                <TrendingUp className="h-3 w-3" />
                Almost Sold
              </Badge>
            )}
          </div>
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-muted-foreground">{event.artist}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(event.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{event.city}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs text-muted-foreground">From</span>
                <p className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ₹{event.price.toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {event.category}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
