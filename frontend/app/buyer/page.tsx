'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { EnhancedEventCarousel } from '@/components/shared/enhanced-event-carousel';
import { IntegratedArtistHub } from '@/components/shared/integrated-artist-hub';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/shared/footer';
import { 
  ChevronRight,
  Ticket,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Event } from '@/lib/types';





export default function BuyerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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
      {/* Hero Section for Buyer */}
      <section className="relative py-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-background to-cyan-500/5" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="container relative z-10 px-12 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 mb-8"
          >
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              <Ticket className="h-4 w-4 mr-2" />
              Your Personal Event Hub
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Discover <span className="text-gradient-neon">Amazing Events</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Browse, buy, and manage your tickets. All in one place.
            </p>
          </motion.div>


        </div>
      </section>



      {/* Events Grid */}
      <section className="container py-8 px-12 mx-auto max-w-7xl space-y-12">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Ticket className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
            <p className="text-gray-400 mb-6">Try refreshing the page</p>
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

      {/* Quick Stats */}
      <section className="container py-12 px-12 mx-auto max-w-7xl">
        <div className="glass-card border-white/20 bg-white/5 backdrop-blur-sm rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-sm text-gray-400">Happy Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">1000+</p>
              <p className="text-sm text-gray-400">Events Hosted</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-sm text-gray-400">Secure Tickets</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-sm text-gray-400">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}