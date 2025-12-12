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

type SearchCategory = 'all' | 'events' | 'artists'

interface Artist {
  id: string
  name: string
  image?: string
  genre?: string
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all')
  const [events, setEvents] = useState<Event[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
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
      
      // Extract unique artists from events
      const uniqueArtists = new Map<string, Artist>()
      response.events?.forEach((event: Event) => {
        if (event.artistName) {
          uniqueArtists.set(event.artistName, {
            id: event.artistId || event.artistName,
            name: event.artistName,
            image: event.artistImage,
            genre: event.category
          })
        }
      })
      setArtists(Array.from(uniqueArtists.values()))
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }


  // Filter results based on search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get results based on active category
  const getResults = () => {
    if (activeCategory === 'events') return { events: filteredEvents, artists: [] }
    if (activeCategory === 'artists') return { events: [], artists: filteredArtists }
    return { events: filteredEvents, artists: filteredArtists }
  }

  const results = getResults()

  // Get trending items (first 6 events)
  const trendingEvents = events.slice(0, 6)
  const trendingArtists = artists.slice(0, 4)

  const categories: { key: SearchCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'events', label: 'Events' },
    { key: 'artists', label: 'Artists' },
  ]

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
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
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

                {/* Category Tabs */}
                <div className="flex gap-2 mt-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeCategory === cat.key
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
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
                    {results.events.length === 0 && results.artists.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No results found for "{searchQuery}"
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {/* Events Results */}
                        {results.events.slice(0, 6).map((event) => (
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
                              <p className="text-xs text-gray-500">Event</p>
                            </div>
                          </Link>
                        ))}

                        {/* Artists Results */}
                        {results.artists.slice(0, 4).map((artist) => (
                          <Link
                            key={artist.id}
                            href={`/artists`}
                            onClick={onClose}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                              {artist.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                                {artist.name}
                              </p>
                              <p className="text-xs text-gray-500">Artist</p>
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
                      <h3 className="font-semibold text-gray-900">Trending</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Trending Events */}
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
                            <p className="text-xs text-gray-500">Event</p>
                          </div>
                        </Link>
                      ))}

                      {/* Trending Artists */}
                      {trendingArtists.map((artist) => (
                        <Link
                          key={artist.id}
                          href={`/artists`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                            {artist.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                              {artist.name}
                            </p>
                            <p className="text-xs text-gray-500">Artist</p>
                          </div>
                        </Link>
                      ))}
                    </div>
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
