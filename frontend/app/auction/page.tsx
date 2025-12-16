'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gavel, 
  Clock, 
  TrendingUp,
  Flame,
  AlertCircle,
  Zap,
  Users,
  ArrowRight,
  Timer,
  Shield,
  Star,
  Sparkles
} from 'lucide-react';
import { AuctionCard } from '@/components/auction/AuctionCard';
import { apiClient } from '@/lib/api/client';
import { PublicHeader } from '@/components/shared/public-header';
import { Footer } from '@/components/shared/footer';
import { useTheme } from '@/lib/context/ThemeContext';
import { useRole } from '@/hooks/use-role';

// Stats will be calculated from real auction data

// Features for info section
const auctionFeatures = [
  {
    icon: Shield,
    title: 'Secure Bidding',
    description: 'All bids are secured on blockchain with smart contract escrow',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Timer,
    title: 'Anti-Sniping',
    description: 'Last-minute bids extend auction by 10 minutes for fair play',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Zap,
    title: 'Instant Settlement',
    description: 'Winners receive NFT tickets immediately after auction ends',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Fair Access',
    description: 'Max 4 bids per wallet prevents scalping and hoarding',
    color: 'from-cyan-500 to-blue-500',
  },
];

export default function AuctionsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isGuest } = useRole();
  const router = useRouter();

  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Redirect guest users to login
  useEffect(() => {
    if (isGuest) {
      router.push('/login?redirect=/auction');
    }
  }, [isGuest, router]);

  useEffect(() => {
    if (!isGuest) {
      fetchAuctions();
    }
  }, [activeTab, isGuest]);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAuctions({ status: activeTab });

      if (data.success) {
        setAuctions(data.auctions);
      } else {
        setError(data.error || 'Failed to load auctions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions;

  // Sort auctions
  const endingSoonAuctions = filteredAuctions
    .filter(a => a.timeRemainingMs > 0 && a.timeRemainingMs < 60 * 60 * 1000)
    .sort((a, b) => a.timeRemainingMs - b.timeRemainingMs);

  const hotAuctions = filteredAuctions
    .filter(a => a.totalBids >= 5 || a.uniqueBidders >= 3)
    .sort((a, b) => b.totalBids - a.totalBids);

  // Show loading while checking auth or redirecting
  if (isGuest) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0A0A0A]' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-purple-500' : 'border-orange-500'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-gray-50'}`}>
      {/* Header */}
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs with Animation */}
          <motion.div 
            className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/30 to-amber-500/20 rounded-full blur-[120px]"
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/20 to-pink-500/15 rounded-full blur-[100px]"
            animate={{ 
              x: [0, -40, 0],
              y: [0, -20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-r from-cyan-500/15 to-blue-500/10 rounded-full blur-[80px]"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-400/60 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Animated Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.line
              x1="0" y1="50%" x2="100%" y2="50%"
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${
                isDark 
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30' 
                  : 'bg-orange-100 border-orange-300'
              }`}
            >
              <Sparkles className={`h-4 w-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Live NFT Ticket Auctions</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-4xl md:text-6xl font-black mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Bid on{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  Exclusive Tickets
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Secure your spot at sold-out events. Bid with ETH, win NFT tickets, 
              and enjoy anti-sniping protection for fair auctions.
            </motion.p>

            {/* Real Stats from auctions data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <Gavel className="h-6 w-6 text-orange-400 mb-2 mx-auto" />
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {auctions.length}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Active Auctions</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <TrendingUp className="h-6 w-6 text-green-400 mb-2 mx-auto" />
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {auctions.reduce((sum, a) => sum + (a.totalBids || 0), 0)}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Total Bids</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <Users className="h-6 w-6 text-purple-400 mb-2 mx-auto" />
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {auctions.reduce((sum, a) => sum + (a.uniqueBidders || 0), 0)}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Total Bidders</p>
              </div>
              <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <Clock className="h-6 w-6 text-cyan-400 mb-2 mx-auto" />
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {endingSoonAuctions.length}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Ending Soon</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={`py-12 ${isDark ? 'bg-[#0A0A0A]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">

          {/* Ending Soon Section */}
          {endingSoonAuctions.length > 0 && activeTab === 'active' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <Clock className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Ending Soon
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Don't miss your chance!
                    </p>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse ml-2">
                    {endingSoonAuctions.length} Live
                  </Badge>
                </div>
                <Button variant="ghost" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endingSoonAuctions.slice(0, 3).map((auction, index) => (
                  <motion.div
                    key={auction._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AuctionCard auction={auction} highlight="ending" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Hot Auctions Section */}
          {hotAuctions.length > 0 && activeTab === 'active' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Hot Auctions
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Most competitive bids
                    </p>
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 ml-2">
                    🔥 Trending
                  </Badge>
                </div>
                <Button variant="ghost" className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotAuctions.slice(0, 3).map((auction, index) => (
                  <motion.div
                    key={auction._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AuctionCard auction={auction} highlight="hot" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Auctions Tabs */}
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className={`${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100'} p-1 rounded-xl`}>
                  <TabsTrigger 
                    value="active" 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === 'active' 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg' 
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Active Auctions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ended" 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === 'ended' 
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg' 
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Ended
                  </TabsTrigger>
                </TabsList>

                <div className={`hidden md:flex items-center gap-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  <span>Showing {filteredAuctions.length} auctions</span>
                </div>
              </div>

              <TabsContent value="active" className="mt-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                      <Gavel className="h-6 w-6 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading auctions...</p>
                  </div>
                ) : error ? (
                  <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <CardContent className="py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                      </div>
                      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Oops! Something went wrong
                      </h3>
                      <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
                      <Button 
                        onClick={fetchAuctions} 
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : filteredAuctions.length === 0 ? (
                  <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <CardContent className="py-16 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4">
                        <Gavel className="h-10 w-10 text-orange-400" />
                      </div>
                      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        No Active Auctions
                      </h3>
                      <p className={`mb-6 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        There are no live auctions right now. Check back soon or list your own ticket for auction!
                      </p>
                      <Link href="/my-tickets">
                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
                          <Gavel className="h-4 w-4 mr-2" />
                          Auction Your Ticket
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAuctions.map((auction, index) => (
                      <motion.div
                        key={auction._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <AuctionCard auction={auction} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ended" className="mt-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-gray-500/20 border-t-gray-500 animate-spin" />
                      <Clock className="h-6 w-6 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading ended auctions...</p>
                  </div>
                ) : filteredAuctions.length === 0 ? (
                  <Card className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <CardContent className="py-16 text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        No Ended Auctions
                      </h3>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Completed auctions will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAuctions.map((auction, index) => (
                      <motion.div
                        key={auction._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <AuctionCard auction={auction} showBidButton={false} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 ${isDark ? 'bg-[#0D0D0D]' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${
                isDark 
                  ? 'bg-purple-500/20 border-purple-500/30' 
                  : 'bg-purple-100 border-purple-300'
              }`}
            >
              <Star className={`h-4 w-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Why Auction with Us</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Fair, Secure & Transparent
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Our blockchain-powered auction system ensures every bid is fair and every winner gets their ticket instantly.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {auctionFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-gray-50 border-gray-200 hover:border-gray-300'} transition-all duration-300 hover:-translate-y-1`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 px-6 md:px-12 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`relative overflow-hidden rounded-3xl ${
            isDark 
              ? 'bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-orange-500/30' 
              : 'bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700'
          }`}
        >
          {isDark && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
            </>
          )}
          
          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left flex-1">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Ready to Start Bidding?
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-xl">
                Connect your wallet and join thousands of fans bidding on exclusive event tickets.
              </p>
              <div className="flex flex-wrap gap-4 md:gap-6 mt-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Secure bidding
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Anti-sniping protection
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Instant NFT transfer
                </div>
              </div>
            </div>
            <Link href="/my-tickets">
              <Button
                size="lg"
                className={`text-base md:text-lg h-16 px-10 rounded-full font-bold shadow-2xl whitespace-nowrap ${
                  isDark 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 border-0 text-white' 
                    : 'bg-[#E23744] hover:bg-[#c92f3a] border-0 text-white'
                }`}
              >
                <Gavel className="mr-2 h-5 w-5" />
                Auction Your Ticket
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
