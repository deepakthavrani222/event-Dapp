'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { EnhancedEventCarousel } from '@/components/shared/enhanced-event-carousel';
import { IntegratedArtistHub } from '@/components/shared/integrated-artist-hub';

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

  // Show all events without filtering
  const filteredEvents = events;

  // Get unique categories from events
  const getUniqueCategories = () => {
    const categories = [...new Set(events.map(event => event.category).filter(Boolean))]
    return categories.slice(0, 4) // Limit to 4 categories for buyer page
  }

  const uniqueCategories = getUniqueCategories();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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



      {/* Events Grid */}
      <section id="events-section" className="container py-8 px-12 mx-auto max-w-7xl space-y-12">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className={`w-24 h-24 mx-auto ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-6`}>
              <Ticket className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>No events found</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Try refreshing the page</p>
            <Button 
              onClick={() => window.location.reload()}
              className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
            >
              Refresh Events
            </Button>
          </div>
        ) : (
          <>
            {/* All Events - First */}
            <EnhancedEventCarousel
              title="All Events"
              subtitle="Browse all available events"
              events={filteredEvents}
              variant="default"
            />

            {/* Comedy Events - Second */}
            <EnhancedEventCarousel
              title="Comedy Events"
              subtitle="Best comedy experiences"
              events={filteredEvents}
              variant="default"
              categoryFilter="Comedy"
            />
          </>
        )}
      </section>

      {/* Integrated Artist Hub - Third */}
      <IntegratedArtistHub />

      <section className="container py-8 px-12 mx-auto max-w-7xl space-y-12">
        {!loading && filteredEvents.length > 0 && (
          <>
            {/* Other Category Sections */}
            {uniqueCategories
              .filter(category => category.toLowerCase() !== 'comedy')
              .map((category) => (
                <EnhancedEventCarousel
                  key={category}
                  title={`${category} Events`}
                  subtitle={`Best ${category.toLowerCase()} experiences`}
                  events={filteredEvents}
                  variant="default"
                  categoryFilter={category}
                />
              ))}

            {/* Trending Now */}
            {filteredEvents.length > 8 && (
              <EnhancedEventCarousel
                title="Trending Now"
                subtitle="🔥 Most popular this week"
                events={filteredEvents.slice(8, 16)}
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