'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Calendar, Clock, MapPin, Ticket, Users, DollarSign, 
  TrendingUp, Share2, Copy, QrCode, Bell, Edit, Plus, Pause, Play,
  AlertTriangle, X, Check, Mail, MessageSquare, Globe, RefreshCw,
  BarChart3, PieChart as PieChartIcon, Eye, UserCheck, Loader2,
  ExternalLink, Download, Send, Megaphone, Link2, Trash2
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock sales data for chart
const generateSalesData = (totalSold: number) => {
  const days = 14;
  const data = [];
  let cumulative = 0;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dailySales = Math.floor(Math.random() * (totalSold / days) * 1.5);
    cumulative += dailySales;
    data.push({
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      sales: Math.min(cumulative, totalSold),
      daily: dailySales,
    });
  }
  return data;
};

// Mock buyer insights
const buyerInsights = {
  locations: [
    { name: 'India', value: 60, color: '#8b5cf6' },
    { name: 'USA', value: 20, color: '#06b6d4' },
    { name: 'UK', value: 12, color: '#10b981' },
    { name: 'Others', value: 8, color: '#f59e0b' },
  ],
  repeatBuyers: 40,
  newBuyers: 60,
  avgTicketsPerBuyer: 2.3,
};

export default function EventManagementPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'promote' | 'manage' | 'eventday'>('overview');
  
  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddTicketsModal, setShowAddTicketsModal] = useState(false);
  
  // States
  const [salesPaused, setSalesPaused] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch event data
  useEffect(() => {
    if (eventId) {
      fetchEventData();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchEventData, 30000);
      return () => clearInterval(interval);
    }
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const response = await apiClient.request(`/api/organizer/events/${eventId}`);
      if (response.success) {
        setEvent(response.event);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalTickets = event?.ticketTypes?.reduce((sum: number, tt: any) => sum + tt.totalSupply, 0) || 0;
  const soldTickets = event?.ticketTypes?.reduce((sum: number, tt: any) => sum + (tt.totalSupply - tt.availableSupply), 0) || 0;
  const totalRevenue = event?.ticketTypes?.reduce((sum: number, tt: any) => sum + ((tt.totalSupply - tt.availableSupply) * tt.price), 0) || 0;
  const royaltiesEarned = event?.totalRoyaltiesEarned || 0;
  const salesPercentage = totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;
  
  const salesData = generateSalesData(soldTickets);

  // Copy link
  const copyEventLink = () => {
    const link = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle cancel event
  const handleCancelEvent = async () => {
    try {
      await apiClient.request(`/api/organizer/events/${eventId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason }),
      });
      setShowCancelModal(false);
      fetchEventData();
    } catch (error) {
      console.error('Failed to cancel event:', error);
    }
  };

  // Handle message buyers
  const handleMessageBuyers = async () => {
    try {
      await apiClient.request(`/api/organizer/events/${eventId}/message`, {
        method: 'POST',
        body: JSON.stringify({ message: messageContent }),
      });
      setShowMessageModal(false);
      setMessageContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Toggle sales
  const toggleSales = async () => {
    try {
      await apiClient.request(`/api/organizer/events/${eventId}/toggle-sales`, {
        method: 'POST',
        body: JSON.stringify({ paused: !salesPaused }),
      });
      setSalesPaused(!salesPaused);
    } catch (error) {
      console.error('Failed to toggle sales:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Event not found</p>
          <Button onClick={() => router.push('/organizer')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isLive = event.status === 'approved';
  const isEventDay = new Date(event.date).toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push('/organizer')} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)} className="border-white/20">
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/organizer/events/${eventId}/edit`)} className="border-white/20">
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          </div>
        </div>

        {/* Event Header Card */}
        <Card className="mb-6 overflow-hidden border-white/20 bg-gray-900/80">
          <div className="relative">
            {event.image && (
              <div className="h-48 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={
                      event.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      event.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      'bg-gray-500/20 text-gray-300'
                    }>
                      {event.status === 'approved' ? '🟢 Live' : event.status === 'pending' ? '🟡 Pending' : event.status === 'cancelled' ? '🔴 Cancelled' : event.status}
                    </Badge>
                    {isEventDay && <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">📅 Event Day!</Badge>}
                    {salesPaused && <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">⏸️ Sales Paused</Badge>}
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.venue}, {event.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{soldTickets}/{totalTickets}</div>
                  <div className="text-sm text-gray-400">tickets sold</div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${salesPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-white/20 bg-gray-900/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/20 bg-gray-900/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Royalties Earned</p>
                  <p className="text-2xl font-bold text-purple-400">₹{royaltiesEarned.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/20 bg-gray-900/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tickets Sold</p>
                  <p className="text-2xl font-bold text-cyan-400">{soldTickets}</p>
                </div>
                <Ticket className="h-8 w-8 text-cyan-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/20 bg-gray-900/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Sales %</p>
                  <p className="text-2xl font-bold text-yellow-400">{salesPercentage}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-yellow-400/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'sales', label: 'Sales & Analytics', icon: BarChart3 },
            { id: 'promote', label: 'Promote', icon: Megaphone },
            { id: 'manage', label: 'Manage', icon: Edit },
            { id: 'eventday', label: 'Event Day', icon: Calendar },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'gradient-purple-cyan border-0' : 'border-white/20'}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Sales Chart */}
              <Card className="lg:col-span-2 border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Sales Over Time
                  </CardTitle>
                  <CardDescription>Cumulative ticket sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="sales" stroke="#8b5cf6" fill="url(#salesGradient)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Bell className="h-5 w-5 text-yellow-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { type: 'sale', message: 'New sale! +₹500', time: '2 min ago', icon: '🎫' },
                    { type: 'royalty', message: 'Royalty earned +₹25', time: '15 min ago', icon: '💰' },
                    { type: 'sale', message: 'New sale! +₹1000 (VIP)', time: '1 hour ago', icon: '🎫' },
                    { type: 'milestone', message: '50% tickets sold!', time: '3 hours ago', icon: '🎉' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                      <span className="text-lg">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.message}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ticket Types Breakdown */}
              <Card className="lg:col-span-2 border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Ticket className="h-5 w-5 text-purple-400" />
                    Ticket Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.ticketTypes?.map((tt: any, i: number) => {
                      const sold = tt.totalSupply - tt.availableSupply;
                      const percent = Math.round((sold / tt.totalSupply) * 100);
                      return (
                        <div key={i} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-white">{tt.name}</p>
                              <p className="text-sm text-gray-400">₹{tt.price.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-white">{sold}/{tt.totalSupply}</p>
                              <p className="text-xs text-gray-400">{percent}% sold</p>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${percent >= 75 ? 'bg-green-500' : percent >= 50 ? 'bg-yellow-500' : 'bg-purple-500'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Insights */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-5 w-5 text-cyan-400" />
                    Buyer Insights
                  </CardTitle>
                  <CardDescription>Anonymized statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Location Distribution</p>
                      <div className="space-y-2">
                        {buyerInsights.locations.map((loc, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: loc.color }} />
                            <span className="text-sm text-white flex-1">{loc.name}</span>
                            <span className="text-sm text-gray-400">{loc.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Repeat Buyers</span>
                        <span className="text-white font-medium">{buyerInsights.repeatBuyers}%</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-400">Avg Tickets/Buyer</span>
                        <span className="text-white font-medium">{buyerInsights.avgTicketsPerBuyer}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}


          {/* Sales & Analytics Tab */}
          {activeTab === 'sales' && (
            <motion.div
              key="sales"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Revenue Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-white/20 bg-gray-900/80">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-400 mb-1">Primary Sales</p>
                    <p className="text-3xl font-bold text-green-400">₹{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">From direct ticket sales</p>
                  </CardContent>
                </Card>
                <Card className="border-white/20 bg-gray-900/80">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-400 mb-1">Resale Royalties</p>
                    <p className="text-3xl font-bold text-purple-400">₹{royaltiesEarned.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{event.royaltySettings?.royaltyPercentage || 5}% on each resale</p>
                  </CardContent>
                </Card>
                <Card className="border-white/20 bg-gray-900/80">
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-400 mb-1">Net Earnings</p>
                    <p className="text-3xl font-bold text-cyan-400">₹{Math.round((totalRevenue + royaltiesEarned) * 0.95).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">After platform fees</p>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Sales Chart */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="text-white">Daily Sales</CardTitle>
                  <CardDescription>Tickets sold per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesData}>
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="daily" fill="#8b5cf6" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sales by Ticket Type */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="text-white">Revenue by Ticket Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={event.ticketTypes?.map((tt: any, i: number) => ({
                              name: tt.name,
                              value: (tt.totalSupply - tt.availableSupply) * tt.price,
                              fill: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i % 4],
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      {event.ticketTypes?.map((tt: any, i: number) => {
                        const revenue = (tt.totalSupply - tt.availableSupply) * tt.price;
                        return (
                          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i % 4] }} />
                              <span className="text-white">{tt.name}</span>
                            </div>
                            <span className="font-bold text-white">₹{revenue.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Promote Tab */}
          {activeTab === 'promote' && (
            <motion.div
              key="promote"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Share Links */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Share2 className="h-5 w-5 text-purple-400" />
                    Share Your Event
                  </CardTitle>
                  <CardDescription>Generate shareable links and posters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}`}
                      readOnly
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <Button onClick={copyEventLink} variant="outline" className="border-white/20">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="border-white/20">
                      <QrCode className="h-4 w-4 mr-2" /> Download QR Code
                    </Button>
                    <Button variant="outline" className="border-white/20">
                      <Download className="h-4 w-4 mr-2" /> Download Poster
                    </Button>
                    <Button variant="outline" className="border-white/20">
                      <Globe className="h-4 w-4 mr-2" /> Embed Widget
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Invite Promoters */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Megaphone className="h-5 w-5 text-green-400" />
                    Invite Promoters
                  </CardTitle>
                  <CardDescription>
                    {event.promotionSettings?.enableReferrals 
                      ? `Promoters earn ${event.promotionSettings.referralCommission}% commission per sale`
                      : 'Enable referrals in event settings to invite promoters'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {event.promotionSettings?.enableReferrals ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input placeholder="Search promoters..." className="bg-white/5 border-white/20 text-white" />
                        <Button className="gradient-purple-cyan border-0">
                          <Plus className="h-4 w-4 mr-1" /> Invite
                        </Button>
                      </div>
                      <p className="text-sm text-gray-400">No promoters invited yet. Search from our directory or share your referral link.</p>
                    </div>
                  ) : (
                    <Button variant="outline" className="border-white/20" onClick={() => router.push(`/organizer/events/${eventId}/edit`)}>
                      Enable Referrals
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Message Buyers */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                    Message Buyers
                  </CardTitle>
                  <CardDescription>Send updates to all ticket holders (email/push)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowMessageModal(true)} className="gradient-purple-cyan border-0">
                    <Send className="h-4 w-4 mr-2" /> Send Update
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}


          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Edit Event */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Edit className="h-5 w-5 text-blue-400" />
                    Edit Event Details
                  </CardTitle>
                  <CardDescription>Update event information (buyers will be notified)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push(`/organizer/events/${eventId}/edit`)} variant="outline" className="border-white/20">
                    <Edit className="h-4 w-4 mr-2" /> Edit Event
                  </Button>
                </CardContent>
              </Card>

              {/* Add More Tickets */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Plus className="h-5 w-5 text-green-400" />
                    Add More Tickets
                  </CardTitle>
                  <CardDescription>Increase capacity if sold out</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowAddTicketsModal(true)} variant="outline" className="border-white/20">
                    <Plus className="h-4 w-4 mr-2" /> Add Tickets
                  </Button>
                </CardContent>
              </Card>

              {/* Cancel Event */}
              <Card className="border-red-500/30 bg-red-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-300">
                    <AlertTriangle className="h-5 w-5" />
                    Cancel Event
                  </CardTitle>
                  <CardDescription className="text-red-300/70">
                    This will trigger automatic refunds (buyers get 97% back)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowCancelModal(true)} 
                    variant="destructive"
                    disabled={event.status === 'cancelled'}
                  >
                    <X className="h-4 w-4 mr-2" /> Cancel Event
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Event Day Tab */}
          {activeTab === 'eventday' && (
            <motion.div
              key="eventday"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Live Attendance */}
              <Card className="border-white/20 bg-gray-900/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UserCheck className="h-5 w-5 text-green-400" />
                    Live Attendance Tracker
                  </CardTitle>
                  <CardDescription>Real-time check-ins via inspector scans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <p className="text-3xl font-bold text-green-400">0</p>
                      <p className="text-sm text-gray-400">Checked In</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <p className="text-3xl font-bold text-yellow-400">{soldTickets}</p>
                      <p className="text-sm text-gray-400">Expected</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <p className="text-3xl font-bold text-cyan-400">0%</p>
                      <p className="text-sm text-gray-400">Attendance Rate</p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-white/20">
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                  </Button>
                </CardContent>
              </Card>

              {/* Emergency Controls */}
              <Card className="border-orange-500/30 bg-orange-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-300">
                    <AlertTriangle className="h-5 w-5" />
                    Emergency Controls
                  </CardTitle>
                  <CardDescription className="text-orange-300/70">Quick actions for event day</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Pause Sales</p>
                      <p className="text-sm text-gray-400">Temporarily stop ticket sales</p>
                    </div>
                    <Button 
                      onClick={toggleSales}
                      variant={salesPaused ? 'default' : 'outline'}
                      className={salesPaused ? 'bg-green-500 hover:bg-green-600' : 'border-orange-500/50 text-orange-300'}
                    >
                      {salesPaused ? <><Play className="h-4 w-4 mr-1" /> Resume</> : <><Pause className="h-4 w-4 mr-1" /> Pause</>}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">Extend Event</p>
                      <p className="text-sm text-gray-400">Add more time to the event</p>
                    </div>
                    <Button variant="outline" className="border-white/20">
                      <Clock className="h-4 w-4 mr-1" /> Extend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Share Event</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/events/${eventId}`}
                      readOnly
                      className="bg-white/5 border-white/20 text-white"
                    />
                    <Button onClick={copyEventLink}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="border-white/20">Twitter</Button>
                    <Button variant="outline" className="border-white/20">Facebook</Button>
                    <Button variant="outline" className="border-white/20">WhatsApp</Button>
                  </div>
                </div>
                <Button variant="ghost" className="w-full mt-4" onClick={() => setShowShareModal(false)}>Close</Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Message Buyers Modal */}
        <AnimatePresence>
          {showMessageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowMessageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Message All Buyers</h3>
                <p className="text-sm text-gray-400 mb-4">
                  This message will be sent via email and push notification to all {soldTickets} ticket holders.
                </p>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Event update: Doors open at 7 PM!"
                  rows={4}
                  className="bg-white/5 border-white/20 text-white mb-4"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowMessageModal(false)}>Cancel</Button>
                  <Button className="flex-1 gradient-purple-cyan border-0" onClick={handleMessageBuyers}>
                    <Send className="h-4 w-4 mr-2" /> Send Message
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Event Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCancelModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Cancel Event
                </h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-300">
                    <strong>Warning:</strong> This action cannot be undone. All ticket holders will receive automatic refunds (97% of ticket price).
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Reason for cancellation *</Label>
                    <Textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please provide a reason..."
                      rows={3}
                      className="bg-white/5 border-white/20 text-white mt-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowCancelModal(false)}>Keep Event</Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1" 
                      onClick={handleCancelEvent}
                      disabled={!cancelReason}
                    >
                      <X className="h-4 w-4 mr-2" /> Confirm Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Tickets Modal */}
        <AnimatePresence>
          {showAddTicketsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddTicketsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Add More Tickets</h3>
                <div className="space-y-4">
                  {event.ticketTypes?.map((tt: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{tt.name}</p>
                        <p className="text-sm text-gray-400">Current: {tt.totalSupply}</p>
                      </div>
                      <Input
                        type="number"
                        placeholder="+50"
                        className="w-24 bg-white/5 border-white/20 text-white"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setShowAddTicketsModal(false)}>Cancel</Button>
                    <Button className="flex-1 gradient-purple-cyan border-0">
                      <Plus className="h-4 w-4 mr-2" /> Add Tickets
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
