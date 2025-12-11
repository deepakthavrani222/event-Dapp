"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Users, 
  Heart, 
  Share2, 
  MessageCircle, 
  Crown, 
  Sparkles, 
  Music, 
  Instagram, 
  Youtube, 
  Globe, 
  Play, 
  ExternalLink,
  Ticket,
  Star,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Image from 'next/image';

interface ArtistProfile {
  id: string;
  artistName: string;
  realName: string;
  bio: string;
  genre: string[];
  socialLinks: any;
  verificationStatus: string;
  verifiedAt: string;
  totalEvents: number;
  totalTicketsSold: number;
  fanCount: number;
  averageRating: number;
  profileImage?: string;
  coverImage?: string;
  goldenTicketPerks: string[];
}

interface Event {
  id: string;
  title: string;
  venue: string;
  city: string;
  startDate: string;
  ticketsSold: number;
  totalCapacity: number;
  status: 'upcoming' | 'past';
  image?: string;
  ticketTypes: any[];
}

export default function ArtistPublicProfile() {
  const params = useParams();
  const artistSlug = params.slug as string;
  
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    fetchArtistProfile();
    fetchArtistEvents();
    checkFollowStatus();
  }, [artistSlug]);

  const checkFollowStatus = async () => {
    try {
      const response = await apiClient.checkArtistFollowStatus(artistSlug);
      if (response.success) {
        setFollowing(response.following);
      }
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const fetchArtistProfile = async () => {
    try {
      const response = await apiClient.getArtistProfile(artistSlug);
      
      if (response.success && response.artist) {
        setArtist({
          id: response.artist.id,
          artistName: response.artist.artistName,
          realName: response.artist.realName,
          bio: response.artist.bio || 'No bio available',
          genre: response.artist.genre || [],
          socialLinks: response.artist.socialLinks || {},
          verificationStatus: response.artist.verificationStatus,
          verifiedAt: response.artist.verifiedAt,
          totalEvents: response.artist.totalEvents || 0,
          totalTicketsSold: response.artist.totalTicketsSold || 0,
          fanCount: response.artist.fanCount || 0,
          averageRating: response.artist.averageRating || 0,
          profileImage: response.artist.profileImage,
          coverImage: response.artist.coverImage,
          goldenTicketPerks: response.artist.goldenTicketPerks || ['Meet & Greet', 'Backstage Pass', 'Signed Merchandise']
        });
        
        // Set events from API response
        if (response.events) {
          const allEvents = [
            ...response.events.upcoming.map(e => ({ ...e, status: 'upcoming' as const })),
            ...response.events.past.map(e => ({ ...e, status: 'past' as const }))
          ];
          setEvents(allEvents);
        }
      } else {
        // Fallback to mock data for demo purposes
        const mockArtist: ArtistProfile = {
          id: '1',
          artistName: 'Badshah',
          realName: 'Aditya Prateek Singh Sisodia',
          bio: 'Indian rapper, singer, songwriter and music producer. Known for Hindi, Haryanvi and Punjabi songs.',
          genre: ['Hip Hop', 'Punjabi', 'Bollywood'],
          socialLinks: {
            instagram: 'https://instagram.com/badboyshah',
            youtube: 'https://youtube.com/c/badshah',
            spotify: 'https://open.spotify.com/artist/4YRxDV8wJFPHPTeXepOstw'
          },
          verificationStatus: 'verified',
          verifiedAt: '2024-01-10T12:00:00Z',
          totalEvents: 25,
          totalTicketsSold: 125000,
          fanCount: 2500,
          averageRating: 4.8,
          profileImage: '/artist-badshah.jpg',
          coverImage: '/artist-badshah-cover.jpg',
          goldenTicketPerks: ['Meet & Greet', 'Backstage Pass', 'Signed Merchandise']
        };
        
        setArtist(mockArtist);
      }
    } catch (error) {
      console.error('Failed to fetch artist profile:', error);
      // Show mock data on error for demo
      const mockArtist: ArtistProfile = {
        id: '1',
        artistName: 'Badshah',
        realName: 'Aditya Prateek Singh Sisodia',
        bio: 'Indian rapper, singer, songwriter and music producer. Known for Hindi, Haryanvi and Punjabi songs.',
        genre: ['Hip Hop', 'Punjabi', 'Bollywood'],
        socialLinks: {
          instagram: 'https://instagram.com/badboyshah',
          youtube: 'https://youtube.com/c/badshah',
          spotify: 'https://open.spotify.com/artist/4YRxDV8wJFPHPTeXepOstw'
        },
        verificationStatus: 'verified',
        verifiedAt: '2024-01-10T12:00:00Z',
        totalEvents: 25,
        totalTicketsSold: 125000,
        fanCount: 2500,
        averageRating: 4.8,
        profileImage: '/artist-badshah.jpg',
        coverImage: '/artist-badshah-cover.jpg',
        goldenTicketPerks: ['Meet & Greet', 'Backstage Pass', 'Signed Merchandise']
      };
      
      setArtist(mockArtist);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtistEvents = async () => {
    try {
      // Mock events data
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Badshah Live in Mumbai',
          venue: 'NSCI Dome',
          city: 'Mumbai',
          startDate: '2024-02-15T20:00:00Z',
          ticketsSold: 8500,
          totalCapacity: 10000,
          status: 'upcoming',
          image: '/event-badshah-mumbai.jpg',
          ticketTypes: [
            { name: 'General', price: 2500, available: 500 },
            { name: 'VIP', price: 5000, available: 100 },
            { name: 'Golden Pass', price: 15000, available: 25 }
          ]
        },
        {
          id: '2',
          title: 'Badshah Live in Delhi',
          venue: 'Jawaharlal Nehru Stadium',
          city: 'Delhi',
          startDate: '2024-03-10T19:30:00Z',
          ticketsSold: 12000,
          totalCapacity: 15000,
          status: 'upcoming',
          image: '/event-badshah-delhi.jpg',
          ticketTypes: [
            { name: 'General', price: 3000, available: 1000 },
            { name: 'VIP', price: 6000, available: 200 },
            { name: 'Golden Pass', price: 18000, available: 50 }
          ]
        },
        {
          id: '3',
          title: 'Badshah Live in Bangalore',
          venue: 'Palace Grounds',
          city: 'Bangalore',
          startDate: '2023-12-20T20:00:00Z',
          ticketsSold: 15000,
          totalCapacity: 15000,
          status: 'past',
          image: '/event-badshah-bangalore.jpg',
          ticketTypes: []
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch artist events:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const action = following ? 'unfollow' : 'follow';
      const response = await apiClient.followArtist(artistSlug, action);
      
      if (response.success) {
        setFollowing(response.following);
        
        // Update artist fan count in UI
        if (artist) {
          setArtist(prev => prev ? {
            ...prev,
            fanCount: prev.fanCount + (response.following ? 1 : -1)
          } : null);
        }
      }
    } catch (error) {
      console.error('Failed to update follow status:', error);
      alert('Failed to update follow status. Please try again.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${artist?.artistName} - Verified Artist`,
        text: `Check out ${artist?.artistName}'s profile and upcoming shows!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'past');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="animate-pulse">
          <div className="h-80 bg-white/10"></div>
          <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="h-8 bg-white/10 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Artist Not Found</h1>
          <p className="text-gray-400">The artist profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Banner */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: artist.coverImage 
              ? `url(${artist.coverImage})` 
              : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Artist Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <div className="flex items-end gap-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 bg-gradient-to-r from-purple-500 to-cyan-500">
                  {artist.profileImage ? (
                    <Image
                      src={artist.profileImage}
                      alt={artist.artistName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="h-8 w-8 md:h-12 md:w-12 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Verified Badge */}
                <div className="absolute -bottom-2 -right-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Artist Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-5xl font-bold text-white">{artist.artistName}</h1>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Artist
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-white/80 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{artist.fanCount.toLocaleString()} fans</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ticket className="h-4 w-4" />
                    <span>{artist.totalTicketsSold.toLocaleString()} tickets sold</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{artist.averageRating} rating</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {artist.genre.map((g) => (
                    <Badge key={g} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="hidden md:flex flex-col gap-3">
                <Button
                  onClick={handleFollow}
                  className={`${following 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'gradient-purple-cyan hover:opacity-90 border-0'
                  } text-white font-semibold px-6`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${following ? 'fill-current' : ''}`} />
                  {following ? 'Following' : 'Follow'}
                </Button>
                
                <Button
                  onClick={() => setShowMessageModal(true)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-6"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Get Updates
                </Button>
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-6"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="md:hidden container mx-auto px-4 py-4">
        <div className="flex gap-3">
          <Button
            onClick={handleFollow}
            className={`flex-1 ${following 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'gradient-purple-cyan hover:opacity-90 border-0'
            } text-white font-semibold`}
          >
            <Heart className={`h-4 w-4 mr-2 ${following ? 'fill-current' : ''}`} />
            {following ? 'Following' : 'Follow'}
          </Button>
          
          <Button
            onClick={() => setShowMessageModal(true)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/20">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-white/20">
              Upcoming Shows
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-white/20">
              Past Shows
            </TabsTrigger>
            <TabsTrigger value="golden" className="data-[state=active]:bg-white/20">
              Golden Drops
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-white/20">
              About
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Shows */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Upcoming Shows</h2>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                {upcomingEvents.length} shows scheduled
              </Badge>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} artist={artist} />
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/20 bg-white/5">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Shows</h3>
                  <p className="text-gray-400">New shows will be announced soon. Follow to get notified!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Past Shows */}
          <TabsContent value="past" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Past Shows</h2>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Collectible Memories
              </Badge>
            </div>

            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <PastEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/20 bg-white/5">
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Past Shows</h3>
                  <p className="text-gray-400">Past performances will appear here as collectible memories</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Golden Drops */}
          <TabsContent value="golden" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="h-6 w-6 text-yellow-400" />
                Exclusive Golden Drops
              </h2>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                Limited NFTs
              </Badge>
            </div>

            <GoldenDropsSection artist={artist} />
          </TabsContent>

          {/* About */}
          <TabsContent value="about" className="space-y-6">
            <AboutSection artist={artist} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <MessageModal 
          artist={artist} 
          onClose={() => setShowMessageModal(false)} 
        />
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event, artist }: { event: Event; artist: ArtistProfile }) {
  const eventDate = new Date(event.startDate);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-white/20 bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: event.image 
              ? `url(${event.image})` 
              : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {isToday && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-500/90 text-white border-0 animate-pulse">
              TODAY
            </Badge>
          </div>
        )}
        
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-black/60 text-white border-0">
            {event.ticketsSold.toLocaleString()} / {event.totalCapacity.toLocaleString()} sold
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-white text-lg mb-2">{event.title}</h3>
          <div className="space-y-1 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{eventDate.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{eventDate.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}, {event.city}</span>
            </div>
          </div>
        </div>

        {/* Ticket Types */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Available Tickets:</p>
          <div className="space-y-1">
            {event.ticketTypes.map((ticket, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-300">{ticket.name}</span>
                <span className="text-white font-semibold">₹{ticket.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold">
          <Ticket className="h-4 w-4 mr-2" />
          Book Tickets
        </Button>
      </CardContent>
    </motion.div>
  );
}

// Past Event Card Component  
function PastEventCard({ event }: { event: Event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-white/20 bg-white/5 rounded-xl overflow-hidden"
    >
      <div className="relative h-32 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center opacity-60"
          style={{ 
            backgroundImage: event.image 
              ? `url(${event.image})` 
              : 'linear-gradient(135deg, #6b7280 0%, #374151 100%)'
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-gray-500/60 text-white border-0 text-xs">
            SOLD OUT
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h4 className="font-semibold text-white text-sm mb-1">{event.title}</h4>
        <p className="text-xs text-gray-400 mb-2">
          {new Date(event.startDate).toLocaleDateString()} • {event.venue}
        </p>
        <p className="text-xs text-gray-300">
          {event.ticketsSold.toLocaleString()} fans attended
        </p>
      </CardContent>
    </motion.div>
  );
}

// Golden Drops Section
function GoldenDropsSection({ artist }: { artist: ArtistProfile }) {
  const mockGoldenDrops = [
    {
      id: '1',
      name: 'Badshah VIP Experience',
      description: 'Ultimate fan experience with meet & greet, backstage access, and signed merchandise',
      price: 25000,
      available: 10,
      total: 50,
      perks: artist.goldenTicketPerks,
      image: '/golden-ticket-badshah.jpg'
    }
  ];

  return (
    <div className="space-y-6">
      {mockGoldenDrops.map((drop) => (
        <Card key={drop.id} className="glass-card border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Crown className="h-12 w-12 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{drop.name}</h3>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    Limited Edition
                  </Badge>
                </div>
                
                <p className="text-gray-300 mb-4">{drop.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {drop.perks.map((perk) => (
                    <Badge key={perk} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                      {perk}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">₹{drop.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">{drop.available} of {drop.total} available</p>
                  </div>
                  
                  <Button className="gradient-yellow-orange hover:opacity-90 border-0 text-black font-bold">
                    <Crown className="h-4 w-4 mr-2" />
                    Get Golden Pass
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// About Section
function AboutSection({ artist }: { artist: ArtistProfile }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Bio */}
      <Card className="glass-card border-white/20 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">About {artist.artistName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 leading-relaxed">{artist.bio}</p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {artist.genre.map((g) => (
                <Badge key={g} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links & Stats */}
      <div className="space-y-6">
        {/* Social Links */}
        <Card className="glass-card border-white/20 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Connect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(artist.socialLinks).map(([platform, url]) => (
              <Button
                key={platform}
                variant="outline"
                className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                onClick={() => window.open(url as string, '_blank')}
              >
                {platform === 'instagram' && <Instagram className="h-4 w-4 mr-3" />}
                {platform === 'youtube' && <Youtube className="h-4 w-4 mr-3" />}
                {platform === 'spotify' && <Music className="h-4 w-4 mr-3" />}
                {platform === 'website' && <Globe className="h-4 w-4 mr-3" />}
                <span className="capitalize">{platform}</span>
                <ExternalLink className="h-3 w-3 ml-auto" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="glass-card border-white/20 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Artist Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{artist.totalEvents}</p>
                <p className="text-sm text-gray-400">Total Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{artist.fanCount.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Fans</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{artist.totalTicketsSold.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Tickets Sold</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{artist.averageRating}</p>
                <p className="text-sm text-gray-400">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Message Modal Component
function MessageModal({ artist, onClose }: { artist: ArtistProfile; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    if (email) {
      try {
        const response = await apiClient.subscribeToArtist(artist.artistName.toLowerCase().replace(/\s+/g, '-'), email);
        
        if (response.success) {
          setSubscribed(true);
        } else {
          alert(response.error || 'Failed to subscribe');
        }
      } catch (error) {
        console.error('Failed to subscribe:', error);
        alert('Failed to subscribe. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl max-w-md w-full p-6"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white">Get Updates from {artist.artistName}</h3>
          <p className="text-gray-400">
            Be the first to know about new shows, exclusive content, and special announcements.
          </p>

          {!subscribed ? (
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubscribe}
                  disabled={!email}
                  className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <p className="text-green-400 font-semibold">Successfully subscribed!</p>
              <p className="text-gray-400 text-sm">
                You'll receive updates directly from {artist.artistName}.
              </p>
              <Button
                onClick={onClose}
                className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}