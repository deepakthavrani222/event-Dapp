'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { OpenSeaEventCard } from '@/components/shared/opensea-event-card';
import { CategoryCard } from '@/components/shared/category-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/shared/footer';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  ChevronRight,
  Ticket,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Event } from '@/lib/types';

const categories = [
  { title: "Music", icon: "🎸", href: "/buyer?category=music" },
  { title: "Nightlife", icon: "🪩", href: "/buyer?category=nightlife" },
  { title: "Comedy", icon: "🎤", href: "/buyer?category=comedy" },
  { title: "Sports", icon: "🏟️", href: "/buyer?category=sports" },
  { title: "Performances", icon: "🎭", href: "/buyer?category=theater" },
  { title: "Food & Drinks", icon: "🍷", href: "/buyer?category=food" },
  { title: "Fests & Fairs", icon: "🎪", href: "/buyer?category=festival" },
  { title: "Social Mixers", icon: "🥂", href: "/buyer?category=social" },
];

const cities = ["All Cities", "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Goa"];

const dateFilters = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "This Weekend" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" }
];

export default function BuyerDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.artist && event.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCity = selectedCity === "All Cities" || event.city === selectedCity;
    const matchesCategory = selectedCategory === "all" || event.category?.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCity && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section for Buyer */}
      <section className="relative py-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-background to-cyan-500/5" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="container relative z-10 px-6">
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

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card border-border/50 backdrop-blur-sm bg-card/40 p-6 rounded-2xl max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events, artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-12"
                />
              </div>

              {/* City Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 text-white rounded-lg h-12 appearance-none"
                >
                  {cities.map((city) => (
                    <option key={city} value={city} className="bg-gray-800 text-white">{city}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 text-white rounded-lg h-12 appearance-none"
                >
                  <option value="all" className="bg-gray-800 text-white">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.title} value={category.title.toLowerCase()} className="bg-gray-800 text-white">
                      {category.icon} {category.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 text-white rounded-lg h-12 appearance-none"
                >
                  {dateFilters.map((filter) => (
                    <option key={filter.value} value={filter.value} className="bg-gray-800 text-white">
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>{filteredEvents.length} events found</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("All Cities");
                  setSelectedCategory("all");
                  setSelectedDate("all");
                }}
                className="text-gray-400 hover:text-white"
              >
                Clear all filters
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Browse Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CategoryCard {...category} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="container py-8 px-6 space-y-12">
        {/* Featured Events */}
        {!loading && filteredEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Star className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Featured Events</h2>
                  <p className="text-sm text-gray-400">Hand-picked experiences for you</p>
                </div>
              </div>
              <Button variant="link" className="text-cyan-400 hover:text-cyan-300 gap-2">
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredEvents.slice(0, 4).map((event) => (
                <OpenSeaEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Trending Events */}
        {!loading && filteredEvents.length > 4 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                  <p className="text-sm text-gray-400">Most popular this week</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredEvents.slice(4, 8).map((event) => (
                <OpenSeaEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">All Events</h2>
                <p className="text-sm text-gray-400">Browse all available events</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Ticket className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No events found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("All Cities");
                  setSelectedCategory("all");
                  setSelectedDate("all");
                }}
                className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredEvents.map((event) => (
                <OpenSeaEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container py-12 px-6">
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