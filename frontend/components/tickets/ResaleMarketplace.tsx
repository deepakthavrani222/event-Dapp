"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Filter, Search, Heart, Share2, Clock, MapPin, Calendar, Star, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ResaleTicket {
  id: string
  eventTitle: string
  eventDate: string
  venue: string
  city: string
  ticketType: string
  originalPrice: number
  resalePrice: number
  discount: number
  seller: {
    name: string
    rating: number
    verified: boolean
  }
  image: string
  category: string
  timeLeft: string
}

const mockResaleTickets: ResaleTicket[] = [
  {
    id: "1",
    eventTitle: "Sunburn Festival 2024",
    eventDate: "2024-12-25",
    venue: "Vagator Beach",
    city: "Goa",
    ticketType: "VIP Pass",
    originalPrice: 8000,
    resalePrice: 6500,
    discount: 19,
    seller: {
      name: "Rahul K.",
      rating: 4.8,
      verified: true
    },
    image: "/placeholder.svg",
    category: "Music",
    timeLeft: "2 days left"
  },
  {
    id: "2", 
    eventTitle: "Coldplay Live in Mumbai",
    eventDate: "2024-12-30",
    venue: "DY Patil Stadium",
    city: "Mumbai",
    ticketType: "General Admission",
    originalPrice: 5000,
    resalePrice: 7500,
    discount: -50,
    seller: {
      name: "Priya S.",
      rating: 4.9,
      verified: true
    },
    image: "/placeholder.svg",
    category: "Music",
    timeLeft: "5 days left"
  }
]

export function ResaleMarketplace() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("price-low")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [likedTickets, setLikedTickets] = useState<string[]>([])

  const toggleLike = (ticketId: string) => {
    setLikedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }

  const filteredTickets = mockResaleTickets.filter(ticket => 
    ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (categoryFilter === "all" || ticket.category.toLowerCase() === categoryFilter)
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="text-center space-y-4 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white"
          >
            Resale <span className="text-gradient-neon">Marketplace</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Buy and sell verified tickets safely. All transactions are secured by blockchain technology.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 text-white"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 bg-card/50 border-border/50 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="comedy">Comedy</SelectItem>
              <SelectItem value="theater">Theater</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 bg-card/50 border-border/50 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="date">Event Date</SelectItem>
              <SelectItem value="discount">Best Discount</SelectItem>
            </SelectContent>
          </Select>

          <Button className="glass-card border-border/50 text-white hover:bg-white/10 gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">1,247</p>
              <p className="text-sm text-gray-400">Available Tickets</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500/20 to-green-500/10 border-green-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">₹2.1L</p>
              <p className="text-sm text-gray-400">Avg. Savings</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">4.9★</p>
              <p className="text-sm text-gray-400">Seller Rating</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border-cyan-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">99.8%</p>
              <p className="text-sm text-gray-400">Success Rate</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 bg-gradient-to-br from-card to-darker-surface/50">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={ticket.image}
                    alt={ticket.eventTitle}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Discount Badge */}
                  {ticket.discount > 0 && (
                    <Badge className="absolute top-3 left-3 bg-green-500/90 text-white border-0">
                      {ticket.discount}% OFF
                    </Badge>
                  )}
                  
                  {ticket.discount < 0 && (
                    <Badge className="absolute top-3 left-3 bg-red-500/90 text-white border-0 gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}

                  {/* Time Left */}
                  <Badge className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white border-white/20">
                    <Clock className="h-3 w-3 mr-1" />
                    {ticket.timeLeft}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleLike(ticket.id)}
                      className="bg-black/40 backdrop-blur-sm border-white/20 text-white hover:bg-black/60 rounded-full w-10 h-10 p-0"
                    >
                      <Heart className={`h-4 w-4 ${likedTickets.includes(ticket.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-black/40 backdrop-blur-sm border-white/20 text-white hover:bg-black/60 rounded-full w-10 h-10 p-0"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Event Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-bold text-lg line-clamp-1 mb-1">{ticket.eventTitle}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(ticket.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{ticket.city}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Ticket Type */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize">
                      {ticket.ticketType}
                    </Badge>
                    <div className="text-xs text-gray-400">{ticket.venue}</div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {ticket.seller.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{ticket.seller.name}</span>
                        {ticket.seller.verified && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-1.5 py-0.5">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{ticket.seller.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 line-through">₹{ticket.originalPrice.toLocaleString()}</p>
                        <p className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          ₹{ticket.resalePrice.toLocaleString()}
                        </p>
                      </div>
                      {ticket.discount > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-400">
                            Save ₹{(ticket.originalPrice - ticket.resalePrice).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-10 rounded-xl group">
                      Buy Now
                      <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button 
            variant="outline"
            className="glass-card border-border/50 text-white hover:bg-white/10 px-8 py-3 rounded-full bg-transparent"
          >
            Load More Tickets
          </Button>
        </div>
      </div>
    </div>
  )
}