"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, MapPin, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiClient } from "@/lib/api/client"
import type { Event } from "@/lib/types"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Fetch events on mount
  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getEvents()
      setEvents(response.events || [])
      
      // Extract unique categories from events
      const uniqueCategories = [...new Set(response.events?.map((event: Event) => event.category).filter(Boolean))]
      setCategories(uniqueCategories as string[])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }


  // Filter results based on search query and active filter
  const getFilteredEvents = () => {
    let filtered = events

    // First filter by category if not 'all'
    if (activeFilter !== 'all') {
      filtered = filtered.filter(event => 
        event.category?.toLowerCase() === activeFilter.toLowerCase()
      )
    }

    // Then filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredEvents = getFilteredEvents()

  // Get trending items (first 6 events based on filter)
  const trendingEvents = activeFilter === 'all' 
    ? events.slice(0, 6) 
    : events.filter(e => e.category?.toLowerCase() === activeFilter.toLowerCase()).slice(0, 6)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const getDefaultImage = (title: string) => {
    const images = [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop',
    ]
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return images[hash % images.length]
  }

  // Check if image URL is valid
  const getValidImage = (event: Event) => {
    if (event.image && 
        !event.image.startsWith('blob:') && 
        event.image !== '/placeholder.svg' &&
        (event.image.includes('cloudinary.com') || 
         event.image.includes('unsplash.com') ||
         event.image.startsWith('https://') ||
         event.image.startsWith('http://'))) {
      return event.image
    }
    return getDefaultImage(event.title)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-start justify-center pt-20 z-[101] px-4 pointer-events-none"
          >
            <div className="w-full max-w-2xl pointer-events-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px]">
              {/* Search Input */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for events, artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 h-12 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Tabs */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === 'all'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    All Events
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveFilter(category.toLowerCase())}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeFilter === category.toLowerCase()
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>


              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : searchQuery ? (
                  /* Search Results */
                  <div className="p-4">
                    {filteredEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No results found for "{searchQuery}"
                        {activeFilter !== 'all' && ` in ${activeFilter}`}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {filteredEvents.slice(0, 8).map((event) => (
                          <Link
                            key={event.id}
                            href={`/event/${event.id}`}
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <img
                              src={getValidImage(event)}
                              alt={event.title}
                              className="w-14 h-14 rounded-lg object-cover bg-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = getDefaultImage(event.title)
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-500">{event.category || 'Event'}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Trending Section */
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <h3 className="font-semibold text-gray-900">
                        {activeFilter === 'all' ? 'Trending' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Events`}
                      </h3>
                    </div>

                    {trendingEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No events found in this category
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {trendingEvents.map((event) => (
                          <Link
                            key={event.id}
                            href={`/event/${event.id}`}
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <img
                              src={getValidImage(event)}
                              alt={event.title}
                              className="w-14 h-14 rounded-lg object-cover bg-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = getDefaultImage(event.title)
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-500">{event.category || 'Event'}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  Press <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-700">ESC</kbd> to close
                </p>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
