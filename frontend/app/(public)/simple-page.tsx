"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import Link from "next/link"

interface SimpleEvent {
  id: string
  title: string
  city: string
  date: string
  price?: number
  image?: string
  category: string
}

export default function SimpleHomePage() {
  const [events, setEvents] = useState<SimpleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await apiClient.getEvents()
        setEvents(response.events || [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
        // Mock data fallback
        setEvents([
          {
            id: "1",
            title: "Diljit Dosanjh Live in Mumbai",
            city: "Mumbai",
            date: "2025-02-15",
            price: 2500,
            category: "Music"
          },
          {
            id: "2", 
            title: "IPL 2025: MI vs CSK",
            city: "Mumbai",
            date: "2025-04-20",
            price: 1500,
            category: "Sports"
          },
          {
            id: "3",
            title: "Sunburn Festival Goa",
            city: "Goa", 
            date: "2025-12-28",
            price: 3000,
            category: "Festival"
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl font-black mb-6">
            Experience <span className="text-purple-400">Live Events</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Secure, transparent ticketing powered by Web3 blockchain. 
            No scalpers, no hidden fees, just authentic experiences.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto mb-12">
            <input
              type="text"
              placeholder="Search events or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-16">
            <div>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-sm text-gray-400">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">1000+</p>
              <p className="text-sm text-gray-400">Events Hosted</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-sm text-gray-400">Secure Tickets</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white">
              Featured Events
            </h2>
            <p className="text-gray-400">{filteredEvents.length} events found</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No events found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link key={event.id} href={`/event/${event.id}`}>
                  <div className="bg-gray-800 rounded-xl overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{event.category}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <span>📍 {event.city}</span>
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      {event.price && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Starting from</span>
                          <span className="text-2xl font-bold text-purple-400">
                            ₹{event.price.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Explore Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Music", icon: "🎸", color: "from-purple-500 to-pink-500" },
              { name: "Sports", icon: "🏟️", color: "from-blue-500 to-cyan-500" },
              { name: "Comedy", icon: "🎤", color: "from-yellow-500 to-orange-500" },
              { name: "Festival", icon: "🎪", color: "from-green-500 to-teal-500" },
            ].map((category) => (
              <div
                key={category.name}
                className={`bg-gradient-to-br ${category.color} p-6 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform`}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="text-white font-bold">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}