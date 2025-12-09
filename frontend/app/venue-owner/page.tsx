"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building, Calendar, DollarSign, TrendingUp, MapPin, Users, Plus } from "lucide-react"
import { motion } from "framer-motion"

export default function VenueOwnerPage() {
  const venues = [
    {
      id: 1,
      name: "DY Patil Stadium",
      location: "Navi Mumbai",
      capacity: 55000,
      bookings: 24,
      revenue: 2450000,
      image: "/cricket-stadium-floodlights.jpg",
    },
    {
      id: 2,
      name: "NSCI Dome",
      location: "Worli, Mumbai",
      capacity: 8000,
      bookings: 18,
      revenue: 1250000,
      image: "/concert-stage-purple-lights.jpg",
    },
  ]

  const stats = [
    {
      label: "Total Venues",
      value: venues.length,
      change: "+1",
      icon: Building,
      color: "text-primary",
    },
    {
      label: "Active Bookings",
      value: venues.reduce((sum, v) => sum + v.bookings, 0),
      change: "+8",
      icon: Calendar,
      color: "text-secondary",
    },
    {
      label: "Total Revenue",
      value: `₹${(venues.reduce((sum, v) => sum + v.revenue, 0) / 100000).toFixed(1)}L`,
      change: "+15.3%",
      icon: DollarSign,
      color: "text-neon-pink",
    },
    {
      label: "Avg Occupancy",
      value: "87%",
      change: "+5.2%",
      icon: TrendingUp,
      color: "text-neon-teal",
    },
  ]

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-2"
          >
            Venue Management
          </motion.h1>
          <p className="text-muted-foreground">Manage your venues and track bookings</p>
        </div>
        <Button className="gap-2 bg-gradient-purple-teal hover:opacity-90 border-0">
          <Plus className="h-4 w-4" />
          Add Venue
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <Card className="bg-card/50 border-border/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 bg-primary/10 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-green-500">{stat.change}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Venues Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {venues.map((venue, idx) => (
          <motion.div
            key={venue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card className="bg-card/50 border-border/50 backdrop-blur overflow-hidden">
              <div className="relative h-48">
                <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">{venue.name}</h3>
                  <p className="text-sm text-white/80 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {venue.location}
                  </p>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Capacity</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {venue.capacity.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bookings</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {venue.bookings}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                    <p className="font-semibold flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />₹{(venue.revenue / 100000).toFixed(1)}L
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-purple-teal hover:opacity-90 border-0">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <Card className="bg-card/50 border-border/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { event: "Diljit Dosanjh Live", venue: "DY Patil Stadium", date: "Feb 15, 2025", status: "confirmed" },
              { event: "IPL 2025: MI vs CSK", venue: "DY Patil Stadium", date: "Apr 20, 2025", status: "confirmed" },
              { event: "Zakir Khan Comedy", venue: "NSCI Dome", date: "Mar 10, 2025", status: "pending" },
            ].map((booking, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
              >
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-1">{booking.event}</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.venue} • {booking.date}
                  </p>
                </div>
                <Badge
                  className={
                    booking.status === "confirmed"
                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                  }
                >
                  {booking.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
