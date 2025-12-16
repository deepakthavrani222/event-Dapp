'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { EnhancedEventCarousel } from '@/components/shared/enhanced-event-carousel';
import { EventFilters, FilterState } from '@/components/home/EventFilters';

import { Button } from '@/components/ui/button';
import { Footer } from '@/components/shared/footer';
import { Ticket } from 'lucide-react';
import type { Event } from '@/lib/types';
import { useTheme } from '@/lib/context/ThemeContext';





export default function BuyerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEvents();
      if (response.success) {
        setEvents(response.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterState>({ date: null, category: null });

  // Get unique categories from events
  const getUniqueCategories = () => {
    const categories = [...new Set(events.map(event => event.category).filter(Boolean))]
    return categories
  }

  const uniqueCategories = getUniqueCategories();

  // Filter events based on active filters
  const getFilteredEvents = () => {
    let filtered = [...events]

    // Date filter
    if (activeFilters.date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const endOfWeek = new Date(today)
      const dayOfWeek = today.getDay()
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
      endOfWeek.setDate(today.getDate() + daysUntilSunday)
      endOfWeek.setHours(23, 59, 59, 999)

      const saturday = new Date(today)
      saturday.setDate(today.getDate() + (6 - dayOfWeek + 7) % 7)
      if (dayOfWeek === 6) saturday.setDate(today.getDate())
      saturday.setHours(0, 0, 0, 0)

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)

        switch (activeFilters.date) {
          case 'today':
            return eventDate.getTime() === today.getTime()
          case 'tomorrow':
            return eventDate.getTime() === tomorrow.getTime()
          case 'weekend':
            return eventDate >= saturday && eventDate <= endOfWeek
          case 'week':
            return eventDate >= today && eventDate <= endOfWeek
          default:
            return true
        }
      })
    }

    // Category filter
    if (activeFilters.category) {
      filtered = filtered.filter(event => 
        event.category?.toLowerCase() === activeFilters.category?.toLowerCase()
      )
    }

    return filtered
  }

  const filteredEvents = getFilteredEvents();

  // Handle filter change
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - District Style */}
      <section className="relative py-16 overflow-hidden min-h-[420px]">
        {/* Background with gradient blur */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&q=80"
            alt="Concert crowd"
            className="w-full h-full object-cover"
          />
          {/* Soft gradient overlay */}
          <div className={`absolute inset-0 ${isDark 
            ? 'bg-gradient-to-r from-black/80 via-black/50 to-transparent' 
            : 'bg-gradient-to-r from-white/95 via-white/80 to-white/40'}`} 
          />
        </div>

        <div className="container relative z-10 px-12 mx-auto max-w-7xl">
          <div className="max-w-2xl py-8">
            {/* Small label */}
            <p className={`text-base font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
              Live Events, Concerts & More
            </p>
            
            {/* Main Title - District Style Bold */}
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', letterSpacing: '-0.02em' }}
            >
              Discover Amazing Events | Your City
            </h1>
            
            {/* Subtitle */}
            <p 
              className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Browse concerts, comedy shows, workshops and more
            </p>
            
            {/* Price hint */}
            <p className={`text-base font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              ₹299 onwards
            </p>
            
            {/* CTA Button - District Style */}
            <Button
              onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#1C1C1C] hover:bg-[#2C2C2C] text-white px-8 py-3 rounded-lg font-medium text-base"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Explore events
            </Button>
          </div>
        </div>
      </section>



      {/* All Events Title - Scrolls away */}
      <div className={`${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
        <div className="container px-6 md:px-12 mx-auto max-w-7xl">
          <h2 className={`text-xl md:text-2xl font-bold pt-6 pb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            All Events
          </h2>
        </div>
      </div>

      {/* Sticky Filter Bar - District Style */}
      <div 
        className={`sticky top-[80px] z-40 pt-3 pb-3 border-b ${
          isDark ? 'bg-[#0A0A0A] border-gray-800' : 'bg-white border-gray-100'
        }`}
        style={{ position: '-webkit-sticky' }}
      >
        <div className="container px-6 md:px-12 mx-auto max-w-7xl">
          <EventFilters 
            onFilterChange={handleFilterChange}
            categories={uniqueCategories}
          />
        </div>
      </div>

      {/* Events Section */}
      <section id="events-section" className="container py-8 px-6 md:px-12 mx-auto max-w-7xl">

        {/* Filtered Events Grid */}
        <div>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className={`w-24 h-24 mx-auto ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-6`}>
                <Ticket className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No events found</h3>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Try adjusting your filters</p>
              <Button 
                onClick={() => setActiveFilters({ date: null, category: null })}
                className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <EnhancedEventCarousel
              title=""
              subtitle=""
              events={filteredEvents}
              variant="default"
            />
          )}
        </div>
      </section>

      {/* Category Sections */}
      <section className="container py-8 px-6 md:px-12 mx-auto max-w-7xl space-y-12">
        {!loading && events.length > 0 && !activeFilters.category && (
          <>
            {/* Comedy Events */}
            <EnhancedEventCarousel
              title="Comedy Events"
              subtitle="Best comedy experiences"
              events={events}
              variant="default"
              categoryFilter="Comedy"
            />
          </>
        )}
      </section>

      <section className="container py-8 px-6 md:px-12 mx-auto max-w-7xl space-y-12">
        {!loading && events.length > 0 && !activeFilters.category && (
          <>
            {/* Other Category Sections */}
            {uniqueCategories
              .filter(category => category.toLowerCase() !== 'comedy')
              .slice(0, 4)
              .map((category) => (
                <EnhancedEventCarousel
                  key={category}
                  title={`${category} Events`}
                  subtitle={`Best ${category.toLowerCase()} experiences`}
                  events={events}
                  variant="default"
                  categoryFilter={category}
                />
              ))}

            {/* Trending Now */}
            {events.length > 8 && (
              <EnhancedEventCarousel
                title="Trending Now"
                subtitle="🔥 Most popular this week"
                events={events.slice(8, 16)}
                variant="trending"
              />
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}