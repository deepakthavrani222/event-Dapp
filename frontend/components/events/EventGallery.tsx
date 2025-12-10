"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  title?: string
  description?: string
}

interface EventGalleryProps {
  media: MediaItem[]
  eventTitle: string
}

export function EventGallery({ media, eventTitle }: EventGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all')

  const filteredMedia = media.filter(item => 
    filter === 'all' || item.type === filter
  )

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < filteredMedia.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No media available</h3>
        <p>Photos and videos will be added soon.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Event Gallery</h3>
          <p className="text-gray-400">Photos and videos from {eventTitle}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-full"
          >
            All ({media.length})
          </Button>
          <Button
            variant={filter === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('image')}
            className="rounded-full"
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Photos ({media.filter(m => m.type === 'image').length})
          </Button>
          <Button
            variant={filter === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('video')}
            className="rounded-full"
          >
            <Video className="h-4 w-4 mr-1" />
            Videos ({media.filter(m => m.type === 'video').length})
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(index)}
          >
            <img
              src={item.thumbnail || item.url}
              alt={item.title || `${eventTitle} media ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              {item.type === 'video' ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Play className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
              )}
            </div>

            {/* Type badge */}
            <Badge 
              className={`absolute top-2 right-2 ${
                item.type === 'video' 
                  ? 'bg-red-500/80 text-white' 
                  : 'bg-blue-500/80 text-white'
              } border-0`}
            >
              {item.type === 'video' ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
            </Badge>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
            >
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Navigation buttons */}
              {selectedIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}

              {selectedIndex < filteredMedia.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 rounded-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}

              {/* Media content */}
              <div className="w-full h-full flex items-center justify-center">
                {filteredMedia[selectedIndex]?.type === 'video' ? (
                  <video
                    src={filteredMedia[selectedIndex].url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-lg"
                  />
                ) : (
                  <img
                    src={filteredMedia[selectedIndex]?.url}
                    alt={filteredMedia[selectedIndex]?.title || `${eventTitle} media`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                )}
              </div>

              {/* Media info */}
              {filteredMedia[selectedIndex]?.title && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="text-white font-semibold">
                    {filteredMedia[selectedIndex].title}
                  </h4>
                  {filteredMedia[selectedIndex].description && (
                    <p className="text-gray-300 text-sm mt-1">
                      {filteredMedia[selectedIndex].description}
                    </p>
                  )}
                </div>
              )}

              {/* Counter */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                {selectedIndex + 1} / {filteredMedia.length}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Mock data for demonstration
export const mockEventMedia: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: '/placeholder.svg',
    title: 'Main Stage Setup',
    description: 'The spectacular main stage with LED screens and lighting'
  },
  {
    id: '2',
    type: 'video',
    url: '/placeholder-video.mp4',
    thumbnail: '/placeholder.svg',
    title: 'Artist Performance Highlights',
    description: 'Best moments from last year\'s performance'
  },
  {
    id: '3',
    type: 'image',
    url: '/placeholder.svg',
    title: 'Crowd Energy',
    description: 'Thousands of fans enjoying the music'
  },
  {
    id: '4',
    type: 'image',
    url: '/placeholder.svg',
    title: 'VIP Experience',
    description: 'Exclusive VIP lounge and dining area'
  },
  {
    id: '5',
    type: 'video',
    url: '/placeholder-video.mp4',
    thumbnail: '/placeholder.svg',
    title: 'Behind the Scenes',
    description: 'Exclusive backstage footage'
  },
  {
    id: '6',
    type: 'image',
    url: '/placeholder.svg',
    title: 'Venue Overview',
    description: 'Aerial view of the entire venue'
  }
]