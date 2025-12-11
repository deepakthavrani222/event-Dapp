'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, Calendar, Ticket, TrendingUp, DollarSign, Activity,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle,
  Search, Download, RefreshCw, Settings, Shield,
  Wallet, Globe, BarChart3, PieChart, Loader2, Bell,
  AlertTriangle, Eye, ChevronRight, Zap, Crown, Building,
  Sparkles, PartyPopper, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TwoFactorVerifyModal } from '@/components/shared/two-factor-auth';

interface DashboardMetrics {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  platformRevenue: number;
  todayRevenue: number;
  weeklyGrowth: number;
  pendingApprovals: number;
  activeEvents: number;
  totalOrganizers: number;
  totalVenues: number;
}

// Confetti component for celebration
function Confetti() {
  const colors = ['#A855F7', '#06B6D4', '#22C55E', '#F59E0B', '#EC4899'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Welcome Screen Component
function WelcomeScreen({ user, todayRevenue, onContinue }: { user: any; todayRevenue: number; onContinue: () => void }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const isGoodDay = todayRevenue > 100000; // Show confetti if revenue > 1L

  useEffect(() => {
    if (isGoodDay) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    // Auto-continue after 3 seconds
    const timer = setTimeout(onContinue, 3000);
    return () => clearTimeout(timer);
  }, [isGoodDay, onContinue]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-40"
    >
      {showConfetti && <Confetti />}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="inline-block mb-6"
        >
          {isGoodDay ? (
            <PartyPopper className="h-20 w-20 text-yellow-400" />
          ) : (
            <Shield className="h-20 w-20 text-purple-400" />
          )}
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.name || 'Admin'}!
        </h1>
        <p className="text-xl text-gray-400 mb-4">
          {isGoodDay ? "🎉 It's a great day!" : 'Your control center is ready'}
        </p>
        <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl border border-purple-500/30">
          <p className="text-sm text-gray-400">Platform revenue today</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            ₹{todayRevenue.toLocaleString()}
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6"
        >
          <Button onClick={onContinue} className="gradient-purple-cyan border-0">
            <Sparkles className="h-4 w-4 mr-2" /> Enter Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [show2FA, setShow2FA] = useState(false);
  const [verified2FA, setVerified2FA] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'artists' | 'users' | 'revenue' | 'settings'>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Check admin access - redirect if not admin
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin');
      } else if (user?.role !== 'ADMIN') {
        router.push('/');
      } else {
        // Check if 2FA is required (optional - can be enabled)
        const requires2FA = false; // Set to true to enable 2FA check
        if (requires2FA && !verified2FA) {
          setShow2FA(true);
        }
      }
    }
  }, [isAuthenticated, authLoading, user, router, verified2FA]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const metricsRes = await apiClient.request('/api/admin/dashboard');
      if (metricsRes.success) {
        setMetrics(metricsRes.metrics);
      }
      
      const eventsRes = await apiClient.request('/api/admin/events?status=PENDING');
      if (eventsRes.success) {
        setPendingEvents(eventsRes.events || []);
      }

      setRecentActivity([
        { type: 'sale', message: 'New ticket sold for "Tech Conference 2025"', time: '2 min ago', amount: 2500 },
        { type: 'signup', message: 'New organizer registered: EventPro Inc', time: '5 min ago' },
        { type: 'approval', message: 'Event "Music Festival" approved', time: '15 min ago' },
        { type: 'withdrawal', message: 'Withdrawal processed: ₹50,000', time: '1 hour ago', amount: 50000 },
        { type: 'royalty', message: 'Royalty earned from resale', time: '2 hours ago', amount: 150 },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handle2FAVerify = async (code: string): Promise<boolean> => {
    // In production, verify with server
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (code.length === 6) {
      setVerified2FA(true);
      setShow2FA(false);
      return true;
    }
    return false;
  };

  const approveEvent = async (eventId: string) => {
    try {
      const response = await apiClient.request(`/api/admin/events/${eventId}/approve`, { method: 'POST' });
      if (response.success) {
        setPendingEvents(prev => prev.filter(e => e.id !== eventId));
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to approve event:', error);
    }
  };

  const rejectEvent = async (eventId: string, reason: string) => {
    try {
      const response = await apiClient.request(`/api/admin/events/${eventId}/reject`, { 
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      if (response.success) {
        setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      }
    } catch (error) {
      console.error('Failed to reject event:', error);
    }
  };

  // Mock data for demo
  const mockMetrics: DashboardMetrics = metrics || {
    totalUsers: 12458,
    totalEvents: 342,
    totalTickets: 45230,
    platformRevenue: 4523000,
    todayRevenue: 482000, // Good day! Will trigger confetti
    weeklyGrowth: 12.5,
    pendingApprovals: pendingEvents.length || 3,
    activeEvents: 28,
    totalOrganizers: 156,
    totalVenues: 45,
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // 2FA Verification Modal
  if (show2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="w-full max-w-md border-white/20 bg-gray-900/90">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-purple-400" />
            </div>
            <CardTitle className="text-white">Admin Verification</CardTitle>
            <CardDescription>Enter your 2FA code to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <TwoFactorVerifyModal
              isOpen={true}
              onClose={() => router.push('/')}
              onVerify={handle2FAVerify}
              title="Verify Admin Access"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Welcome Screen (shows for 3 seconds on first load)
  if (showWelcome && !loading) {
    return (
      <AnimatePresence>
        <WelcomeScreen
          user={user}
          todayRevenue={mockMetrics.todayRevenue}
          onContinue={() => setShowWelcome(false)}
        />
      </AnimatePresence>
    );
  }

  // Main loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
                <p className="text-gray-400">Welcome back, {user?.name || 'Admin'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="border-white/20">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" className="border-white/20">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button onClick={() => setActiveTab('settings')} className="gradient-purple-cyan border-0">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={DollarSign} label="Platform Revenue" value={`₹${(mockMetrics.platformRevenue / 100000).toFixed(1)}L`} change={mockMetrics.weeklyGrowth} color="green" />
          <StatCard icon={Ticket} label="Tickets Sold" value={mockMetrics.totalTickets.toLocaleString()} change={8.3} color="purple" />
          <StatCard icon={Users} label="Total Users" value={mockMetrics.totalUsers.toLocaleString()} change={5.2} color="blue" />
          <StatCard icon={Calendar} label="Active Events" value={mockMetrics.activeEvents} change={-2.1} color="cyan" />
          <StatCard icon={Clock} label="Pending Approvals" value={mockMetrics.pendingApprovals} alert={mockMetrics.pendingApprovals > 0} color="orange" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'approvals', label: 'Approvals', icon: CheckCircle, badge: mockMetrics.pendingApprovals },
            { id: 'artists', label: 'Artists', icon: Crown, badge: 3 }, // Mock pending artist verifications
            { id: 'users', label: 'Users', icon: Users },
            { id: 'revenue', label: 'Revenue', icon: Wallet },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative ${activeTab === tab.id ? 'gradient-purple-cyan border-0' : 'border-white/20'}`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab metrics={mockMetrics} activity={recentActivity} />}
        {activeTab === 'approvals' && <ApprovalsTab events={pendingEvents} onApprove={approveEvent} onReject={rejectEvent} />}
        {activeTab === 'artists' && <ArtistsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'revenue' && <RevenueTab metrics={mockMetrics} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, change, color, alert }: {
  icon: React.ElementType; label: string; value: string | number; change?: number; color: string; alert?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    cyan: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
    orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
  };
  const iconColors: Record<string, string> = {
    green: 'text-green-400', purple: 'text-purple-400', blue: 'text-blue-400',
    cyan: 'text-cyan-400', orange: 'text-orange-400',
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} border ${alert ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${iconColors[color]}`} />
        {change !== undefined && (
          <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </motion.div>
  );
}

// Overview Tab - Enhanced with Big Metrics, Quick Actions, and Twitter-like Live Feed
function OverviewTab({ metrics, activity }: { metrics: DashboardMetrics; activity: { type: string; message: string; time: string; amount?: number }[] }) {
  const [liveUpdates, setLiveUpdates] = useState(activity);

  // Simulate real-time updates (Twitter-like)
  useEffect(() => {
    const newUpdates = [
      { type: 'sale', message: 'VIP ticket sold for "EDM Night Party"', time: 'Just now', amount: 3500 },
      { type: 'signup', message: 'New buyer joined: Arjun M.', time: '30 sec ago' },
      { type: 'resale', message: 'Ticket resold - You earned ₹175 royalty', time: '1 min ago', amount: 175 },
    ];
    const interval = setInterval(() => {
      const randomUpdate = newUpdates[Math.floor(Math.random() * newUpdates.length)];
      setLiveUpdates(prev => [{ ...randomUpdate, time: 'Just now' }, ...prev.slice(0, 9)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Big Colorful Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 shadow-lg shadow-green-500/25"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <DollarSign className="h-8 w-8 text-white/80 mb-3" />
          <p className="text-4xl font-bold text-white">₹{(metrics.platformRevenue / 100000).toFixed(1)}L</p>
          <p className="text-green-100 mt-1">Total Platform Revenue</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-white/80">
            <ArrowUpRight className="h-4 w-4" />
            <span>+{metrics.weeklyGrowth}% this week</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 shadow-lg shadow-purple-500/25"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Ticket className="h-8 w-8 text-white/80 mb-3" />
          <p className="text-4xl font-bold text-white">{metrics.totalTickets.toLocaleString()}</p>
          <p className="text-purple-100 mt-1">Tickets Sold</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-white/80">
            <ArrowUpRight className="h-4 w-4" />
            <span>+847 today</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 shadow-lg shadow-blue-500/25"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Users className="h-8 w-8 text-white/80 mb-3" />
          <p className="text-4xl font-bold text-white">{metrics.totalUsers.toLocaleString()}</p>
          <p className="text-blue-100 mt-1">Total Users</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-white/80">
            <ArrowUpRight className="h-4 w-4" />
            <span>+124 new today</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-6 shadow-lg shadow-orange-500/25"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <Calendar className="h-8 w-8 text-white/80 mb-3" />
          <p className="text-4xl font-bold text-white">{metrics.activeEvents}</p>
          <p className="text-orange-100 mt-1">Live Events</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-white/80">
            <Clock className="h-4 w-4" />
            <span>{metrics.pendingApprovals} pending approval</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-white/20 bg-gray-900/80">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Platform earnings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const height = [65, 45, 80, 55, 90, 70, 85][i];
                return (
                  <motion.div
                    key={day}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full h-full bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t-lg transition-all hover:opacity-80 cursor-pointer" />
                    <span className="text-xs text-gray-400">{day}</span>
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-sm text-gray-400">Today&apos;s Revenue</p>
                <p className="text-xl font-bold text-white">₹{metrics.todayRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Weekly Growth</p>
                <p className="text-xl font-bold text-green-400">+{metrics.weeklyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel - Enhanced */}
        <QuickActionsPanel />
      </div>

      {/* Twitter-like Live Feed */}
      {/* Enhanced Twitter-like Live Feed */}
      <LiveFeedPanel updates={liveUpdates} />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-white/20 bg-gray-900/80 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Crown className="h-5 w-5 text-purple-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{metrics.totalOrganizers}</p>
              <p className="text-xs text-gray-400">Organizers</p>
            </div>
          </div>
        </Card>
        <Card className="border-white/20 bg-gray-900/80 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg"><Building className="h-5 w-5 text-cyan-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">{metrics.totalVenues}</p>
              <p className="text-xs text-gray-400">Venues</p>
            </div>
          </div>
        </Card>
        <Card className="border-white/20 bg-gray-900/80 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg"><Globe className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-xs text-gray-400">Cities</p>
            </div>
          </div>
        </Card>
        <Card className="border-white/20 bg-gray-900/80 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg"><Zap className="h-5 w-5 text-orange-400" /></div>
            <div>
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-xs text-gray-400">Uptime</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Approvals Tab - Enhanced with Events, Venues, Artists, Bad Actors, Bulk Actions
function ApprovalsTab({ events, onApprove, onReject }: { events: { id: string; title: string; organizer?: { name: string }; venue?: { name: string; city: string }; category: string; startDate: string; totalCapacity: number }[]; onApprove: (id: string) => void; onReject: (id: string, reason: string) => void }) {
  const [activeQueue, setActiveQueue] = useState<'events' | 'venues' | 'artists' | 'flagged'>('events');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const mockPendingEvents = [
    { id: '1', title: 'Tech Conference 2025', organizer: { name: 'TechEvents Inc' }, venue: { name: 'Convention Center', city: 'Mumbai' }, category: 'Conference', startDate: '2025-02-15', totalCapacity: 500, thumbnail: '🎤', aiScore: 95 },
    { id: '2', title: 'Music Festival Night', organizer: { name: 'SoundWave Productions' }, venue: { name: 'Open Arena', city: 'Delhi' }, category: 'Music', startDate: '2025-03-01', totalCapacity: 2000, thumbnail: '🎵', aiScore: 88 },
    { id: '3', title: 'Startup Pitch Day', organizer: { name: 'Startup Hub' }, venue: { name: 'Tech Park', city: 'Bangalore' }, category: 'Business', startDate: '2025-02-20', totalCapacity: 100, thumbnail: '💼', aiScore: 92 },
    { id: '4', title: 'Comedy Night Live', organizer: { name: 'LaughFactory' }, venue: { name: 'Auditorium', city: 'Pune' }, category: 'Comedy', startDate: '2025-02-25', totalCapacity: 300, thumbnail: '😂', aiScore: 90 },
    { id: '5', title: 'Art Exhibition', organizer: { name: 'ArtSpace Gallery' }, venue: { name: 'Gallery Hall', city: 'Chennai' }, category: 'Art', startDate: '2025-03-05', totalCapacity: 150, thumbnail: '🎨', aiScore: 85 },
  ];

  const mockPendingVenues = [
    { id: 'v1', name: 'Grand Convention Center', city: 'Mumbai', capacity: 5000, photos: 8, idVerified: true, owner: 'Rajesh Mehta' },
    { id: 'v2', name: 'Skyline Rooftop', city: 'Delhi', capacity: 500, photos: 5, idVerified: true, owner: 'Priya Singh' },
    { id: 'v3', name: 'Beach Resort Arena', city: 'Goa', capacity: 2000, photos: 12, idVerified: false, owner: 'John D\'Souza' },
  ];

  const mockPendingArtists = [
    { id: 'a1', name: 'DJ Arjun', instagram: '@djarjun', followers: '125K', genre: 'EDM', idVerified: true },
    { id: 'a2', name: 'Priya Sharma', instagram: '@priyasings', followers: '89K', genre: 'Bollywood', idVerified: true },
    { id: 'a3', name: 'The Rock Band', instagram: '@therockband', followers: '45K', genre: 'Rock', idVerified: false },
  ];

  const mockFlaggedUsers = [
    { id: 'f1', name: 'Spam Account 1', email: 'spam1@fake.com', reason: 'Multiple fake event submissions', flaggedBy: 'AI', severity: 'high' },
    { id: 'f2', name: 'Suspicious Buyer', email: 'buyer@temp.com', reason: 'Unusual purchase patterns', flaggedBy: 'AI', severity: 'medium' },
  ];

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (activeQueue === 'events') {
      setSelectedItems(selectedItems.length === mockPendingEvents.length ? [] : mockPendingEvents.map(e => e.id));
    }
  };

  const handleBulkApprove = () => {
    selectedItems.forEach(id => onApprove(id));
    setSelectedItems([]);
    setShowBulkConfirm(false);
  };

  const queueCounts = {
    events: mockPendingEvents.length,
    venues: mockPendingVenues.length,
    artists: mockPendingArtists.length,
    flagged: mockFlaggedUsers.length,
  };

  return (
    <div className="space-y-6">
      {/* Queue Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'events', label: 'New Events', icon: Calendar, count: queueCounts.events, color: 'purple' },
          { id: 'venues', label: 'Venue Owners', icon: Building, count: queueCounts.venues, color: 'cyan' },
          { id: 'artists', label: 'Artists', icon: Crown, count: queueCounts.artists, color: 'pink' },
          { id: 'flagged', label: 'Bad Actors', icon: AlertTriangle, count: queueCounts.flagged, color: 'red' },
        ].map(queue => (
          <Button
            key={queue.id}
            variant={activeQueue === queue.id ? 'default' : 'outline'}
            onClick={() => { setActiveQueue(queue.id as typeof activeQueue); setSelectedItems([]); }}
            className={`relative ${activeQueue === queue.id ? `bg-${queue.color}-500/20 text-${queue.color}-300 border-${queue.color}-500/50` : 'border-white/20'}`}
          >
            <queue.icon className="h-4 w-4 mr-2" />
            {queue.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeQueue === queue.id ? 'bg-white/20' : 'bg-white/10'}`}>
              {queue.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {activeQueue === 'events' && mockPendingEvents.length > 0 && (
        <Card className="border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={selectAll} className="flex items-center gap-2 text-sm text-white hover:text-green-300">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedItems.length === mockPendingEvents.length ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>
                  {selectedItems.length === mockPendingEvents.length && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
                Select All
              </button>
              <span className="text-sm text-gray-400">{selectedItems.length} selected</span>
            </div>
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-green-500/20 rounded-lg text-xs text-green-300 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> AI: These look legit!
                </div>
                <Button onClick={() => setShowBulkConfirm(true)} className="bg-green-500 hover:bg-green-600 text-white">
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve All ({selectedItems.length})
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Events Queue */}
      {activeQueue === 'events' && (
        <div className="grid gap-4">
          {mockPendingEvents.map((event) => (
            <Card key={event.id} className={`border-white/20 bg-gray-900/80 overflow-hidden ${selectedItems.includes(event.id) ? 'ring-2 ring-purple-500' : ''}`}>
              <div className="flex flex-col md:flex-row">
                <div className="flex items-center gap-4 p-4 md:p-6 flex-1">
                  <button onClick={() => toggleSelect(event.id)} className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedItems.includes(event.id) ? 'bg-purple-500 border-purple-500' : 'border-white/30'}`}>
                    {selectedItems.includes(event.id) && <CheckCircle className="h-4 w-4 text-white" />}
                  </button>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                    {event.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white truncate">{event.title}</h3>
                      <Badge className="bg-green-500/20 text-green-300 text-xs">AI: {event.aiScore}%</Badge>
                    </div>
                    <p className="text-sm text-gray-400">{event.organizer?.name} • {event.venue?.city}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{event.category}</span>
                      <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      <span>{event.totalCapacity} tickets</span>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 p-4 bg-white/5 justify-center">
                  <Button onClick={() => onApprove(event.id)} size="sm" className="gradient-purple-cyan border-0">
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20">
                    <Eye className="h-4 w-4 mr-1" /> Review
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onReject(event.id, 'Does not meet guidelines')} className="border-red-500/50 text-red-400">
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Venues Queue */}
      {activeQueue === 'venues' && (
        <div className="grid gap-4 md:grid-cols-2">
          {mockPendingVenues.map((venue) => (
            <Card key={venue.id} className="border-white/20 bg-gray-900/80 p-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <Building className="h-8 w-8 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{venue.name}</h3>
                  <p className="text-sm text-gray-400">{venue.city} • {venue.capacity} capacity</p>
                  <p className="text-xs text-gray-500 mt-1">Owner: {venue.owner}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs">{venue.photos} photos</Badge>
                    <Badge className={venue.idVerified ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}>
                      {venue.idVerified ? '✓ ID Verified' : 'ID Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30">
                  <CheckCircle className="h-4 w-4 mr-2" /> Verify Venue
                </Button>
                <Button variant="outline" className="border-red-500/50 text-red-400">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Artists Queue */}
      {activeQueue === 'artists' && (
        <div className="grid gap-4 md:grid-cols-3">
          {mockPendingArtists.map((artist) => (
            <Card key={artist.id} className="border-white/20 bg-gray-900/80 p-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <Crown className="h-8 w-8 text-pink-400" />
              </div>
              <h3 className="font-bold text-white">{artist.name}</h3>
              <a href={`https://instagram.com/${artist.instagram.slice(1)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-400 hover:underline">{artist.instagram}</a>
              <p className="text-xs text-gray-400 mt-1">{artist.followers} followers • {artist.genre}</p>
              <Badge className={`mt-2 ${artist.idVerified ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                {artist.idVerified ? '✓ ID Verified' : 'ID Pending'}
              </Badge>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30">
                  <Shield className="h-4 w-4 mr-2" /> Give Blue Tick
                </Button>
                <Button variant="outline" className="border-red-500/50 text-red-400">
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Flagged Users Queue */}
      {activeQueue === 'flagged' && (
        <div className="grid gap-4">
          {mockFlaggedUsers.map((user) => (
            <Card key={user.id} className={`border-red-500/30 bg-red-500/10 p-4 ${user.severity === 'high' ? 'animate-pulse' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-red-300 mt-1">⚠️ {user.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={user.severity === 'high' ? 'bg-red-500 text-white' : 'bg-orange-500/20 text-orange-300'}>
                    {user.severity === 'high' ? '🔴 High Risk' : '🟡 Medium Risk'}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-300">Flagged by {user.flaggedBy}</Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="outline" className="border-white/20">
                  <Eye className="h-4 w-4 mr-2" /> Review Activity
                </Button>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  <XCircle className="h-4 w-4 mr-2" /> Block User
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bulk Approve Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowBulkConfirm(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Approve {selectedItems.length} Events?</h3>
              <p className="text-gray-400 mt-2">AI confidence: All events score above 85%</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
              <p className="text-sm text-green-300 flex items-center gap-2">
                <Zap className="h-4 w-4" /> AI Suggestion: These events look legitimate and safe to approve.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowBulkConfirm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleBulkApprove} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                <CheckCircle className="h-4 w-4 mr-2" /> Approve All
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Users Tab
function UsersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const mockUsers = [
    { id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'ORGANIZER', walletAddress: '0x1234...5678', isVerified: true, totalRevenue: 250000, ticketsBought: 0, referrals: 0 },
    { id: '2', name: 'Priya Patel', email: 'priya@example.com', role: 'BUYER', walletAddress: '0x2345...6789', isVerified: false, totalRevenue: 0, ticketsBought: 8, referrals: 0 },
    { id: '3', name: 'Amit Kumar', email: 'amit@example.com', role: 'PROMOTER', walletAddress: '0x3456...7890', isVerified: true, totalRevenue: 0, ticketsBought: 0, referrals: 45 },
    { id: '4', name: 'Sneha Reddy', email: 'sneha@example.com', role: 'VENUE_OWNER', walletAddress: '0x4567...8901', isVerified: true, totalRevenue: 0, ticketsBought: 0, referrals: 0 },
    { id: '5', name: 'Vikram Singh', email: 'vikram@example.com', role: 'INSPECTOR', walletAddress: '0x5678...9012', isVerified: true, totalRevenue: 0, ticketsBought: 0, referrals: 0 },
  ];

  const filteredUsers = mockUsers.filter(u => 
    (roleFilter === 'all' || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="pl-10 bg-white/5 border-white/20 text-white" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white">
          <option value="all">All Roles</option>
          <option value="BUYER">Buyers</option>
          <option value="ORGANIZER">Organizers</option>
          <option value="PROMOTER">Promoters</option>
          <option value="VENUE_OWNER">Venue Owners</option>
          <option value="INSPECTOR">Inspectors</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="border-white/20 bg-gray-900/80">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white flex items-center gap-2">
                      {user.name}
                      {user.isVerified && <Shield className="h-3 w-3 text-blue-400" />}
                    </p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <Badge className={
                  user.role === 'ORGANIZER' ? 'bg-purple-500/20 text-purple-300' :
                  user.role === 'PROMOTER' ? 'bg-green-500/20 text-green-300' :
                  user.role === 'VENUE_OWNER' ? 'bg-cyan-500/20 text-cyan-300' :
                  user.role === 'INSPECTOR' ? 'bg-orange-500/20 text-orange-300' :
                  'bg-gray-500/20 text-gray-300'
                }>{user.role}</Badge>
              </div>
              <div className="text-xs text-gray-400 font-mono mb-3">{user.walletAddress}</div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {user.role === 'ORGANIZER' && <span className="text-green-400">₹{(user.totalRevenue / 1000).toFixed(0)}K revenue</span>}
                  {user.role === 'BUYER' && <span className="text-purple-400">{user.ticketsBought} tickets</span>}
                  {user.role === 'PROMOTER' && <span className="text-green-400">{user.referrals} referrals</span>}
                </div>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Revenue Tab - Dynamic with Analytics, Heatmap, Top Organizers
function RevenueTab({ metrics }: { metrics: DashboardMetrics }) {
  const [activeView, setActiveView] = useState<'breakdown' | 'analytics'>('breakdown');
  const [withdrawAmount, setWithdrawAmount] = useState('6840000');
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic revenue breakdown - would come from API in production
  const revenueBreakdown = [
    { label: 'Primary Fees (3%)', amount: 6840000, percentage: 61, color: 'purple', yours: true },
    { label: 'Secondary Commissions (7.5%)', amount: 2210000, percentage: 20, color: 'cyan', yours: true },
    { label: 'Referral Commissions', amount: 845000, percentage: 8, color: 'green', yours: true },
    { label: 'Venue Shares (tracked)', amount: 1230000, percentage: 11, color: 'orange', yours: false },
  ];

  const totalYours = revenueBreakdown.filter(r => r.yours).reduce((sum, r) => sum + r.amount, 0);
  const availableBalance = totalYours * 0.95; // 5% held for disputes

  // Top organizers - would come from API
  const topOrganizers = [
    { rank: 1, name: 'TechEvents Inc', events: 45, revenue: 2850000, growth: 23 },
    { rank: 2, name: 'SoundWave Productions', events: 32, revenue: 1920000, growth: 18 },
    { rank: 3, name: 'EventPro Mumbai', events: 28, revenue: 1540000, growth: 31 },
    { rank: 4, name: 'Startup Hub', events: 22, revenue: 980000, growth: 12 },
    { rank: 5, name: 'LaughFactory', events: 18, revenue: 720000, growth: 45 },
  ];

  // City heatmap data - would come from API
  const cityData = [
    { city: 'Mumbai', events: 89, revenue: 3200000, heat: 100 },
    { city: 'Delhi', events: 67, revenue: 2400000, heat: 85 },
    { city: 'Bangalore', events: 54, revenue: 1900000, heat: 70 },
    { city: 'Chennai', events: 32, revenue: 1100000, heat: 50 },
    { city: 'Pune', events: 28, revenue: 950000, heat: 45 },
    { city: 'Hyderabad', events: 24, revenue: 820000, heat: 40 },
  ];

  // User growth data - would come from API
  const userGrowth = [
    { month: 'Jul', users: 12000 },
    { month: 'Aug', users: 18500 },
    { month: 'Sep', users: 28000 },
    { month: 'Oct', users: 42000 },
    { month: 'Nov', users: 65000 },
    { month: 'Dec', users: 89421 },
  ];

  const withdrawalHistory = [
    { id: '1', amount: 500000, method: 'HDFC Bank ••••1234', status: 'completed', date: '2025-01-05' },
    { id: '2', amount: 250000, method: 'HDFC Bank ••••1234', status: 'completed', date: '2024-12-20' },
    { id: '3', amount: 100000, method: 'UPI - admin@upi', status: 'completed', date: '2024-12-10' },
  ];

  const handleWithdraw = async () => {
    setLoading(true);
    // In production: await apiClient.request('/api/admin/withdraw', { method: 'POST', body: JSON.stringify({ amount: withdrawAmount }) });
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setShowWithdrawConfirm(false);
    alert('Withdrawal initiated! Funds will arrive in 2-3 business days.');
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button variant={activeView === 'breakdown' ? 'default' : 'outline'} onClick={() => setActiveView('breakdown')} className={activeView === 'breakdown' ? 'gradient-purple-cyan border-0' : 'border-white/20'}>
          <PieChart className="h-4 w-4 mr-2" /> Revenue Breakdown
        </Button>
        <Button variant={activeView === 'analytics' ? 'default' : 'outline'} onClick={() => setActiveView('analytics')} className={activeView === 'analytics' ? 'gradient-purple-cyan border-0' : 'border-white/20'}>
          <BarChart3 className="h-4 w-4 mr-2" /> Analytics
        </Button>
      </div>

      {activeView === 'breakdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Pie Chart */}
          <Card className="lg:col-span-2 border-white/20 bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-400" />
                Revenue Breakdown
              </CardTitle>
              <CardDescription>Your platform earnings by source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#4B5563" strokeWidth="20" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#A855F7" strokeWidth="20" strokeDasharray="153.4 251.3" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#06B6D4" strokeWidth="20" strokeDasharray="50.3 251.3" strokeDashoffset="-153.4" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#22C55E" strokeWidth="20" strokeDasharray="20.1 251.3" strokeDashoffset="-203.7" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F97316" strokeWidth="20" strokeDasharray="27.6 251.3" strokeDashoffset="-223.8" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">₹1.11Cr</p>
                      <p className="text-xs text-gray-400">Total Revenue</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  {revenueBreakdown.map((item, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${item.yours ? 'bg-white/5' : 'bg-orange-500/10 border border-orange-500/20'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color === 'purple' ? 'bg-purple-500' : item.color === 'cyan' ? 'bg-cyan-500' : item.color === 'green' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className="text-sm text-gray-300">{item.label}</span>
                        {!item.yours && <Badge className="text-xs bg-orange-500/20 text-orange-300">Not Yours</Badge>}
                      </div>
                      <span className="text-sm font-bold text-white">₹{(item.amount / 100000).toFixed(1)}L</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-medium">Your Total Earnings</span>
                      <span className="text-xl font-bold text-green-400">₹{(totalYours / 10000000).toFixed(2)}Cr</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdraw Card */}
          <Card className="border-green-500/30 bg-green-500/10">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Withdraw Earnings
              </CardTitle>
              <CardDescription className="text-green-300/70">
                Available: ₹{(availableBalance / 100000).toFixed(1)}L
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Withdraw To</p>
                <p className="text-white font-medium">HDFC Bank ••••1234</p>
                <p className="text-xs text-gray-500">Savings Account</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Amount (₹)</label>
                <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="bg-white/5 border-white/20 text-white text-lg" />
              </div>
              <Button onClick={() => setShowWithdrawConfirm(true)} className="w-full bg-green-500 hover:bg-green-600 text-white">
                <Wallet className="h-4 w-4 mr-2" /> Withdraw to Bank
              </Button>
              <p className="text-xs text-gray-500 text-center">Via Razorpay • 2-3 business days</p>
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card className="lg:col-span-3 border-white/20 bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-white">Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {withdrawalHistory.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">₹{w.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">{w.method} • {w.date}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" /> {w.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* India Heatmap */}
          <Card className="border-white/20 bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-400" />
                City Heatmap
              </CardTitle>
              <CardDescription>Event activity by city</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cityData.map((city, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-white">{city.city}</div>
                    <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${city.heat}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className={`h-full rounded-lg ${city.heat > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' : city.heat > 50 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' : 'bg-gradient-to-r from-yellow-500 to-green-500'}`}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="text-xs text-white font-medium">{city.events} events</span>
                      </div>
                    </div>
                    <div className="w-20 text-right text-sm text-green-400">₹{(city.revenue / 100000).toFixed(0)}L</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-gray-400">Hot</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500" /><span className="text-xs text-gray-400">Warm</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /><span className="text-xs text-gray-400">Growing</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Top Organizers */}
          <Card className="border-white/20 bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                Top Organizers
              </CardTitle>
              <CardDescription>Ranked by earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topOrganizers.map((org) => (
                  <div key={org.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${org.rank === 1 ? 'bg-yellow-500 text-black' : org.rank === 2 ? 'bg-gray-400 text-black' : org.rank === 3 ? 'bg-orange-600 text-white' : 'bg-white/10 text-white'}`}>
                      {org.rank}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{org.name}</p>
                      <p className="text-xs text-gray-400">{org.events} events</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">₹{(org.revenue / 100000).toFixed(0)}L</p>
                      <p className="text-xs text-green-300">+{org.growth}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Growth Graph */}
          <Card className="lg:col-span-2 border-white/20 bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                User Growth
              </CardTitle>
              <CardDescription>Platform user acquisition over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end justify-between gap-4">
                {userGrowth.map((data, i) => {
                  const maxUsers = Math.max(...userGrowth.map(d => d.users));
                  const height = (data.users / maxUsers) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-white font-medium">{(data.users / 1000).toFixed(0)}K</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg min-h-[20px]"
                      />
                      <span className="text-xs text-gray-400">{data.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">89,421</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Growth Rate</p>
                  <p className="text-2xl font-bold text-green-400">+37.5%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">New This Month</p>
                  <p className="text-2xl font-bold text-cyan-400">24,421</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowWithdrawConfirm(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Confirm Withdrawal</h3>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-bold">₹{Number(withdrawAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400">To</span>
                <span className="text-white">HDFC Bank ••••1234</span>
              </div>
              <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400">Arrival</span>
                <span className="text-white">2-3 business days</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowWithdrawConfirm(false)} className="flex-1" disabled={loading}>Cancel</Button>
              <Button onClick={handleWithdraw} className="flex-1 bg-green-500 hover:bg-green-600 text-white" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" /> Confirm</>}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Artists Tab - Artist Verification and Management
function ArtistsTab() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);

  useEffect(() => {
    fetchArtists();
  }, [statusFilter]);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request(`/api/admin/artists?status=${statusFilter}`, {
        method: 'GET'
      });

      if (response.success) {
        setArtists(response.artists);
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyArtist = async (artistId: string, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      const response = await apiClient.request(`/api/admin/artists/${artistId}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          action,
          rejectionReason,
          royaltyPercentage: 15,
          canCreateGoldenTickets: true
        })
      });

      if (response.success) {
        fetchArtists(); // Refresh the list
      } else {
        alert(response.error || 'Failed to process verification');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Failed to process verification');
    }
  };

  const mockArtists = [
    {
      id: '1',
      artistName: 'Prateek Kuhad',
      realName: 'Prateek Singh Kuhad',
      userName: 'Prateek K',
      userEmail: 'prateek@example.com',
      genre: ['Indie', 'Folk'],
      verificationStatus: 'pending',
      verificationSubmittedAt: '2024-01-15T10:30:00Z',
      totalEvents: 0,
      totalRevenue: 0,
      fanCount: 0,
      socialLinks: {
        instagram: 'https://instagram.com/prateekuhad',
        spotify: 'https://open.spotify.com/artist/prateek'
      }
    },
    {
      id: '2',
      artistName: 'When Chai Met Toast',
      realName: 'Achyuth Jaigopal',
      userName: 'WCMT',
      userEmail: 'wcmt@example.com',
      genre: ['Indie', 'Pop'],
      verificationStatus: 'pending',
      verificationSubmittedAt: '2024-01-14T15:45:00Z',
      totalEvents: 2,
      totalRevenue: 125000,
      fanCount: 450
    },
    {
      id: '3',
      artistName: 'Nucleya',
      realName: 'Udyan Sagar',
      userName: 'Nucleya',
      userEmail: 'nucleya@example.com',
      genre: ['Electronic', 'Bass'],
      verificationStatus: 'verified',
      verifiedAt: '2024-01-10T12:00:00Z',
      totalEvents: 8,
      totalRevenue: 2500000,
      fanCount: 1200,
      royaltyPercentage: 20
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            Artist Verification
          </h2>
          <p className="text-gray-400">Review and approve artist verification requests</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export Artists
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {[
          { value: 'pending', label: 'Pending', count: 3 },
          { value: 'verified', label: 'Verified', count: 12 },
          { value: 'rejected', label: 'Rejected', count: 1 },
          { value: 'all', label: 'All', count: 16 }
        ].map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "default" : "outline"}
            onClick={() => setStatusFilter(filter.value)}
            className={`${statusFilter === filter.value ? 'gradient-purple-cyan border-0' : 'border-white/20'}`}
          >
            {filter.label}
            <Badge className="ml-2 bg-white/20">{filter.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Artists List */}
      <div className="space-y-4">
        {mockArtists
          .filter(artist => statusFilter === 'all' || artist.verificationStatus === statusFilter)
          .map((artist) => (
          <Card key={artist.id} className="glass-card border-white/20 bg-white/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{artist.artistName}</h3>
                      <p className="text-gray-400">{artist.realName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(artist.verificationStatus)}
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {artist.genre.join(', ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Events</p>
                      <p className="font-semibold text-white">{artist.totalEvents}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Revenue</p>
                      <p className="font-semibold text-white">₹{artist.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Fans</p>
                      <p className="font-semibold text-white">{artist.fanCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Submitted</p>
                      <p className="font-semibold text-white">
                        {artist.verificationSubmittedAt 
                          ? new Date(artist.verificationSubmittedAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Social Links */}
                  {artist.socialLinks && (
                    <div className="flex gap-2 mb-4">
                      {Object.entries(artist.socialLinks).map(([platform, url]) => (
                        <Button
                          key={platform}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10"
                          onClick={() => window.open(url as string, '_blank')}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          {platform}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {artist.verificationStatus === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleVerifyArtist(artist.id, 'approve')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) handleVerifyArtist(artist.id, 'reject', reason);
                        }}
                        variant="outline"
                        className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedArtists.length > 0 && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-white">
                {selectedArtists.length} artist{selectedArtists.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => {
                    selectedArtists.forEach(id => handleVerifyArtist(id, 'approve'));
                    setSelectedArtists([]);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                  onClick={() => {
                    const reason = prompt('Rejection reason for all selected:');
                    if (reason) {
                      selectedArtists.forEach(id => handleVerifyArtist(id, 'reject', reason));
                      setSelectedArtists([]);
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Settings Tab - Enhanced with Customization, Admin Management, Export, Logs
function SettingsTab() {
  const [activeSection, setActiveSection] = useState<'settings' | 'features' | 'admins' | 'export' | 'logs'>('settings');
  const [platformFee, setPlatformFee] = useState(10);
  const [artistRoyalty, setArtistRoyalty] = useState(10);
  const [minWithdrawal, setMinWithdrawal] = useState(50);
  const [autoApproveLimit, setAutoApproveLimit] = useState(100);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  // Feature toggles - would come from API
  const [features, setFeatures] = useState({
    soulboundTickets: true,
    resaleMarketplace: true,
    promoterSystem: true,
    dynamicPricing: false,
    aiModeration: true,
    instantWithdrawals: false,
  });

  // Admin list - would come from API
  const [admins, setAdmins] = useState([
    { id: '1', name: 'You (Owner)', email: 'owner@ticketchain.com', wallet: '0x7a23...9f4b', role: 'Super Admin', addedAt: '2024-01-01', lastActive: 'Now' },
    { id: '2', name: 'Rahul Sharma', email: 'rahul@ticketchain.com', wallet: '0x8b34...a5c6', role: 'Admin', addedAt: '2024-06-15', lastActive: '2 hours ago' },
    { id: '3', name: 'Priya Patel', email: 'priya@ticketchain.com', wallet: '0x9c45...b7d8', role: 'Moderator', addedAt: '2024-09-20', lastActive: '1 day ago' },
  ]);

  // Activity logs - would come from API
  const allLogs = [
    { id: '1', action: 'Event Approved', target: 'Tech Conference 2025', user: 'Rahul Sharma', timestamp: '2025-01-10 14:32', type: 'approval' },
    { id: '2', action: 'User Blocked', target: 'spam@fake.com', user: 'Priya Patel', timestamp: '2025-01-10 12:15', type: 'moderation' },
    { id: '3', action: 'Fee Changed', target: 'Platform Fee: 10% → 8%', user: 'You (Owner)', timestamp: '2025-01-09 18:45', type: 'settings' },
    { id: '4', action: 'Event Rejected', target: 'Suspicious Event XYZ', user: 'Rahul Sharma', timestamp: '2025-01-09 16:20', type: 'approval' },
    { id: '5', action: 'Withdrawal Processed', target: '₹5,00,000 to HDFC', user: 'You (Owner)', timestamp: '2025-01-08 10:00', type: 'finance' },
    { id: '6', action: 'Admin Added', target: 'priya@ticketchain.com', user: 'You (Owner)', timestamp: '2024-09-20 09:30', type: 'admin' },
    { id: '7', action: 'Feature Enabled', target: 'Soulbound Tickets', user: 'You (Owner)', timestamp: '2024-08-15 11:00', type: 'settings' },
    { id: '8', action: 'Event Approved', target: 'Music Festival Night', user: 'Priya Patel', timestamp: '2025-01-07 15:45', type: 'approval' },
  ];

  const filteredLogs = allLogs.filter(log => 
    log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.target.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.user.toLowerCase().includes(logSearch.toLowerCase())
  );

  const handleSaveSettings = async () => {
    setSaving(true);
    // In production: await apiClient.request('/api/admin/settings', { method: 'POST', body: JSON.stringify({ platformFee, artistRoyalty, ... }) });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const handleAddAdmin = () => {
    if (newAdminEmail) {
      setAdmins([...admins, { id: Date.now().toString(), name: 'New Admin', email: newAdminEmail, wallet: 'Pending...', role: 'Moderator', addedAt: new Date().toISOString().split('T')[0], lastActive: 'Never' }]);
      setNewAdminEmail('');
      setShowAddAdmin(false);
    }
  };

  const handleExport = (type: string) => {
    // In production: window.location.href = `/api/admin/export?type=${type}`;
    alert(`Exporting ${type} data as CSV...`);
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'settings', label: 'Platform Settings', icon: Settings },
          { id: 'features', label: 'Feature Toggles', icon: Zap },
          { id: 'admins', label: 'Admin Access', icon: Users },
          { id: 'export', label: 'Export Data', icon: Download },
          { id: 'logs', label: 'Activity Logs', icon: Clock },
        ].map(section => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'outline'}
            onClick={() => setActiveSection(section.id as typeof activeSection)}
            className={activeSection === section.id ? 'gradient-purple-cyan border-0' : 'border-white/20'}
          >
            <section.icon className="h-4 w-4 mr-2" />
            {section.label}
          </Button>
        ))}
      </div>

      {/* Platform Settings Section */}
      {activeSection === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-white/20 bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-400" />
                Fee Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Platform Fee</label>
                  <span className="text-white font-bold">{platformFee}%</span>
                </div>
                <input type="range" min="1" max="15" value={platformFee} onChange={e => setPlatformFee(Number(e.target.value))} className="w-full accent-purple-500" />
                <p className="text-xs text-gray-500 mt-1">Fee on primary ticket sales</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Artist Royalty (Default)</label>
                  <span className="text-white font-bold">{artistRoyalty}%</span>
                </div>
                <input type="range" min="1" max="20" value={artistRoyalty} onChange={e => setArtistRoyalty(Number(e.target.value))} className="w-full accent-cyan-500" />
                <p className="text-xs text-gray-500 mt-1">Default royalty for organizers on resales</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Minimum Withdrawal (₹)</label>
                <Input type="number" value={minWithdrawal} onChange={e => setMinWithdrawal(Number(e.target.value))} className="bg-white/5 border-white/20 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Auto-Approve Limit (tickets)</label>
                <Input type="number" value={autoApproveLimit} onChange={e => setAutoApproveLimit(Number(e.target.value))} className="bg-white/5 border-white/20 text-white" />
                <p className="text-xs text-gray-500 mt-1">Events under this limit auto-approve</p>
              </div>
              <Button onClick={handleSaveSettings} disabled={saving} className="w-full gradient-purple-cyan border-0">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/20 bg-gray-900/80">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Platform Fee (%)</label>
            <Input type="number" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} className="bg-white/5 border-white/20 text-white" />
            <p className="text-xs text-gray-500 mt-1">Fee charged on each ticket sale</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Minimum Withdrawal (₹)</label>
            <Input type="number" value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)} className="bg-white/5 border-white/20 text-white" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Auto-Approve Limit (tickets)</label>
            <Input type="number" value={autoApproveLimit} onChange={(e) => setAutoApproveLimit(e.target.value)} className="bg-white/5 border-white/20 text-white" />
            <p className="text-xs text-gray-500 mt-1">Events under this limit are auto-approved</p>
          </div>
          <Button className="w-full gradient-purple-cyan border-0">Save Settings</Button>
        </CardContent>
      </Card>

      <Card className="border-white/20 bg-gray-900/80">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            Security & Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium text-white">Maintenance Mode</p>
              <p className="text-sm text-gray-400">Disable public access temporarily</p>
            </div>
            <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`relative w-12 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${maintenanceMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium text-white">2FA Required for Admins</p>
              <p className="text-sm text-gray-400">Enforce two-factor authentication</p>
            </div>
            <Badge className="bg-green-500/20 text-green-300">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium text-white">API Rate Limiting</p>
              <p className="text-sm text-gray-400">1000 requests/minute</p>
            </div>
            <Badge className="bg-green-500/20 text-green-300">Active</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-500/30 bg-purple-500/10">
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Admin Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
            <p className="text-sm text-white font-mono">0x7a23...9f4b</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Platform Treasury</p>
            <p className="text-lg font-bold text-white">45.23 ETH</p>
            <p className="text-sm text-gray-400">≈ ₹75,00,000</p>
          </div>
          <Button variant="outline" className="w-full border-purple-500/50 text-purple-300">
            View on Etherscan
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/20 bg-gray-900/80">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start border-white/20">
            <Download className="h-4 w-4 mr-2" /> Export All Data (CSV)
          </Button>
          <Button variant="outline" className="w-full justify-start border-white/20">
            <Bell className="h-4 w-4 mr-2" /> Send Platform Announcement
          </Button>
          <Button variant="outline" className="w-full justify-start border-white/20">
            <Users className="h-4 w-4 mr-2" /> Manage Admin Access
          </Button>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium text-white">Maintenance Mode</p>
              <p className="text-sm text-gray-400">Disable public access</p>
            </div>
            <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`relative w-12 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-gray-600'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${maintenanceMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium text-white">2FA Required</p>
              <p className="text-sm text-gray-400">For all admins</p>
            </div>
            <Badge className="bg-green-500/20 text-green-300">Enabled</Badge>
          </div>
        </CardContent>
      </Card>
        </div>
      )}

      {/* Feature Toggles Section */}
      {activeSection === 'features' && (
        <Card className="border-white/20 bg-gray-900/80">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Feature Toggles
            </CardTitle>
            <CardDescription>Enable or disable platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'soulboundTickets', label: 'Soulbound Tickets', desc: 'Non-transferable tickets for exclusive events', icon: '🔒' },
                { key: 'resaleMarketplace', label: 'Resale Marketplace', desc: 'Allow ticket resales with royalties', icon: '🔄' },
                { key: 'promoterSystem', label: 'Promoter System', desc: 'Referral commissions for promoters', icon: '📢' },
                { key: 'dynamicPricing', label: 'Dynamic Pricing', desc: 'AI-based price adjustments', icon: '📈' },
                { key: 'aiModeration', label: 'AI Moderation', desc: 'Auto-flag suspicious content', icon: '🤖' },
                { key: 'instantWithdrawals', label: 'Instant Withdrawals', desc: 'Crypto withdrawals without delay', icon: '⚡' },
              ].map(feature => (
                <div key={feature.key} className={`p-4 rounded-lg border transition-all ${features[feature.key as keyof typeof features] ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <p className="font-medium text-white">{feature.label}</p>
                        <p className="text-xs text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFeatures(prev => ({ ...prev, [feature.key]: !prev[feature.key as keyof typeof features] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${features[feature.key as keyof typeof features] ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${features[feature.key as keyof typeof features] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Access Section */}
      {activeSection === 'admins' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Admin Users</h3>
            <Button onClick={() => setShowAddAdmin(true)} className="gradient-purple-cyan border-0">
              <Users className="h-4 w-4 mr-2" /> Add Admin
            </Button>
          </div>
          <div className="grid gap-4">
            {admins.map(admin => (
              <Card key={admin.id} className={`border-white/20 bg-gray-900/80 ${admin.role === 'Super Admin' ? 'ring-2 ring-purple-500/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                        {admin.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {admin.name}
                          {admin.role === 'Super Admin' && <Crown className="h-4 w-4 text-yellow-400" />}
                        </p>
                        <p className="text-sm text-gray-400">{admin.email}</p>
                        <p className="text-xs text-gray-500 font-mono">{admin.wallet}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={admin.role === 'Super Admin' ? 'bg-purple-500/20 text-purple-300' : admin.role === 'Admin' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-500/20 text-gray-300'}>
                        {admin.role}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">Active: {admin.lastActive}</p>
                      <p className="text-xs text-gray-500">Added: {admin.addedAt}</p>
                    </div>
                  </div>
                  {admin.role !== 'Super Admin' && (
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button size="sm" variant="outline" className="border-white/20">Change Role</Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400">Remove</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Admin Modal */}
          {showAddAdmin && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddAdmin(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-4">Add New Admin</h3>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Email or Wallet Address</label>
                    <Input value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="admin@example.com or 0x..." className="bg-white/5 border-white/20 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Role</label>
                    <select className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white">
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAddAdmin(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleAddAdmin} className="flex-1 gradient-purple-cyan border-0">Add Admin</Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Export Data Section */}
      {activeSection === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { type: 'sales', label: 'All Sales', desc: 'Complete transaction history', icon: Ticket, color: 'green' },
            { type: 'users', label: 'All Users', desc: 'User accounts and roles', icon: Users, color: 'blue' },
            { type: 'events', label: 'All Events', desc: 'Event details and stats', icon: Calendar, color: 'purple' },
            { type: 'withdrawals', label: 'Withdrawals', desc: 'Payout history', icon: Wallet, color: 'cyan' },
            { type: 'organizers', label: 'Organizers', desc: 'Organizer performance', icon: Crown, color: 'yellow' },
            { type: 'audit', label: 'Audit Log', desc: 'Complete activity log', icon: Clock, color: 'orange' },
          ].map(item => (
            <Card key={item.type} className="border-white/20 bg-gray-900/80 hover:border-white/40 transition-colors cursor-pointer" onClick={() => handleExport(item.type)}>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${item.color}-500/20 flex items-center justify-center`}>
                  <item.icon className={`h-8 w-8 text-${item.color}-400`} />
                </div>
                <h3 className="font-medium text-white mb-1">{item.label}</h3>
                <p className="text-sm text-gray-400 mb-4">{item.desc}</p>
                <Button variant="outline" className="w-full border-white/20">
                  <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Activity Logs Section */}
      {activeSection === 'logs' && (
        <Card className="border-white/20 bg-gray-900/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Activity Logs
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search logs..." className="pl-10 bg-white/5 border-white/20 text-white" />
              </div>
            </div>
            <CardDescription>Searchable history: &quot;Who approved Event X?&quot;</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className={`p-2 rounded-full ${
                    log.type === 'approval' ? 'bg-green-500/20 text-green-400' :
                    log.type === 'moderation' ? 'bg-red-500/20 text-red-400' :
                    log.type === 'settings' ? 'bg-purple-500/20 text-purple-400' :
                    log.type === 'finance' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {log.type === 'approval' ? <CheckCircle className="h-4 w-4" /> :
                     log.type === 'moderation' ? <AlertTriangle className="h-4 w-4" /> :
                     log.type === 'settings' ? <Settings className="h-4 w-4" /> :
                     log.type === 'finance' ? <Wallet className="h-4 w-4" /> :
                     <Users className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white"><span className="font-medium">{log.action}</span>: {log.target}</p>
                    <p className="text-xs text-gray-400">by {log.user}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Quick Actions Panel Component - Enhanced with all required features
function QuickActionsPanel() {
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [primaryFee, setPrimaryFee] = useState(3);
  const [secondaryFee, setSecondaryFee] = useState(7.5);
  const [royaltyFee, setRoyaltyFee] = useState(2.5);
  const [withdrawAmount, setWithdrawAmount] = useState('532000');

  const featuredEvents = [
    { id: '1', title: 'Tech Conference 2025', organizer: 'TechEvents Inc' },
    { id: '2', title: 'Music Festival Night', organizer: 'SoundWave' },
    { id: '3', title: 'Startup Summit', organizer: 'Startup Hub' },
  ];

  return (
    <>
      <Card className="border-white/20 bg-gray-900/80">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={() => setShowFeatureModal(true)} className="w-full justify-start bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30">
            <Crown className="h-4 w-4 mr-3" /> Feature Event on Homepage
          </Button>
          <Button onClick={() => setShowFeesModal(true)} className="w-full justify-start bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30">
            <Settings className="h-4 w-4 mr-3" /> Change Platform Fees
          </Button>
          <Button onClick={() => setShowWithdrawModal(true)} className="w-full justify-start bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30">
            <Wallet className="h-4 w-4 mr-3" /> Withdraw ₹5,32,000
          </Button>
          <Button className="w-full justify-start bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30">
            <AlertTriangle className="h-4 w-4 mr-3" /> Pause Platform
          </Button>
        </CardContent>
      </Card>

      {/* Feature Event Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowFeatureModal(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" /> Feature Event on Homepage
            </h3>
            <p className="text-gray-400 text-sm mb-4">Select an event to feature prominently on the homepage</p>
            <div className="space-y-2 mb-4">
              {featuredEvents.map(event => (
                <button key={event.id} className="w-full p-3 bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500/50 rounded-lg text-left transition-all">
                  <p className="text-white font-medium">{event.title}</p>
                  <p className="text-sm text-gray-400">{event.organizer}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFeatureModal(false)} className="flex-1">Cancel</Button>
              <Button className="flex-1 gradient-purple-cyan border-0">Feature Selected</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change Fees Modal */}
      {showFeesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowFeesModal(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" /> Platform Fee Settings
            </h3>
            <div className="space-y-6 mb-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Primary Sale Fee</label>
                  <span className="text-white font-bold">{primaryFee}%</span>
                </div>
                <input type="range" min="1" max="10" step="0.5" value={primaryFee} onChange={e => setPrimaryFee(Number(e.target.value))} className="w-full accent-purple-500" />
                <p className="text-xs text-gray-500 mt-1">Fee on initial ticket sales</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Secondary Sale Fee</label>
                  <span className="text-white font-bold">{secondaryFee}%</span>
                </div>
                <input type="range" min="1" max="15" step="0.5" value={secondaryFee} onChange={e => setSecondaryFee(Number(e.target.value))} className="w-full accent-cyan-500" />
                <p className="text-xs text-gray-500 mt-1">Fee on resale transactions</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-400">Royalty Fee (to Organizers)</label>
                  <span className="text-white font-bold">{royaltyFee}%</span>
                </div>
                <input type="range" min="1" max="10" step="0.5" value={royaltyFee} onChange={e => setRoyaltyFee(Number(e.target.value))} className="w-full accent-green-500" />
                <p className="text-xs text-gray-500 mt-1">Default royalty for organizers on resales</p>
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-4">
              <p className="text-sm text-purple-300">Total platform take: <span className="font-bold">{primaryFee + secondaryFee}%</span> (primary + secondary)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFeesModal(false)} className="flex-1">Cancel</Button>
              <Button className="flex-1 gradient-purple-cyan border-0">Save Changes</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowWithdrawModal(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-400" /> Withdraw Earnings
            </h3>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-3xl font-bold text-green-400">₹5,32,000</p>
            </div>
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Amount (₹)</label>
                <Input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="bg-white/5 border-white/20 text-white text-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Withdraw To</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 rounded-lg text-center transition-all">
                    <p className="text-white font-medium">Bank Account</p>
                    <p className="text-xs text-gray-400">2-3 days</p>
                  </button>
                  <button className="p-3 bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/50 rounded-lg text-center transition-all">
                    <p className="text-white font-medium">UPI</p>
                    <p className="text-xs text-gray-400">Instant</p>
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">Powered by Razorpay • Secure transfer</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowWithdrawModal(false)} className="flex-1">Cancel</Button>
              <Button className="flex-1 gradient-purple-cyan border-0">Withdraw Now</Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Enhanced Live Feed Panel with Approve Actions
function LiveFeedPanel({ updates }: { updates: { type: string; message: string; time: string; amount?: number }[] }) {
  const [feedItems, setFeedItems] = useState([
    { id: '1', type: 'pending', message: 'New event submitted: "EDM Night Party" by DJ Arjun', time: 'Just now', action: true },
    { id: '2', type: 'promoter', message: 'Promoter Priya earned ₹1,200 from referral', time: '2 min ago', amount: 1200 },
    { id: '3', type: 'resale', message: 'Ticket resold — platform commission: ₹450', time: '5 min ago', amount: 450 },
    { id: '4', type: 'sale', message: 'VIP ticket sold for "Tech Conference 2025"', time: '8 min ago', amount: 2500 },
    { id: '5', type: 'signup', message: 'New organizer registered: EventPro Inc', time: '12 min ago' },
    { id: '6', type: 'pending', message: 'New event submitted: "Startup Pitch Day" by Startup Hub', time: '15 min ago', action: true },
    { id: '7', type: 'promoter', message: 'Promoter Rahul earned ₹800 from referral', time: '20 min ago', amount: 800 },
    ...updates,
  ]);

  const handleApprove = (id: string) => {
    setFeedItems(prev => prev.map(item => 
      item.id === id ? { ...item, type: 'approved', message: item.message.replace('submitted', 'approved ✓'), action: false } : item
    ));
  };

  const handleReject = (id: string) => {
    setFeedItems(prev => prev.filter(item => item.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sale': return <Ticket className="h-4 w-4" />;
      case 'signup': return <Users className="h-4 w-4" />;
      case 'promoter': return <TrendingUp className="h-4 w-4" />;
      case 'resale': return <DollarSign className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-green-500/20 text-green-400';
      case 'signup': return 'bg-blue-500/20 text-blue-400';
      case 'promoter': return 'bg-purple-500/20 text-purple-400';
      case 'resale': return 'bg-pink-500/20 text-pink-400';
      case 'pending': return 'bg-orange-500/20 text-orange-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Card className="border-white/20 bg-gray-900/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-400" />
          Live Platform Feed
          <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full animate-pulse">LIVE</span>
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-400">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {feedItems.map((item, i) => (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${item.type === 'pending' ? 'bg-orange-500/5' : ''}`}
              >
                <div className={`p-2 rounded-full ${getIconStyle(item.type)}`}>
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{item.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                  {item.action && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleApprove(item.id)} className="h-7 px-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(item.id)} className="h-7 px-3 border-red-500/30 text-red-400 hover:bg-red-500/20">
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
                {item.amount && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-sm font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded"
                  >
                    +₹{item.amount}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
