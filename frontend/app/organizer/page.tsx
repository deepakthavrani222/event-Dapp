'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Ticket, TrendingUp, Users, DollarSign, BarChart3, Eye, Play, X, Sparkles, ArrowRight, CheckCircle, Clock, Share2, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Footer } from '@/components/shared/footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrganizerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isAutoApproved, setIsAutoApproved] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchEvents();
    // Check if this is a new organizer (show welcome)
    const hasSeenWelcome = localStorage.getItem('organizer_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
    
    // Check for event creation success
    const created = searchParams.get('created');
    const autoApproved = searchParams.get('autoApproved');
    if (created === 'true') {
      setShowSuccessMessage(true);
      setIsAutoApproved(autoApproved === 'true');
      // Clear URL params
      window.history.replaceState({}, '', '/organizer');
      // Auto-hide after 10 seconds
      setTimeout(() => setShowSuccessMessage(false), 10000);
    }
  }, [searchParams]);

  const dismissWelcome = () => {
    localStorage.setItem('organizer_welcome_seen', 'true');
    setShowWelcome(false);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrganizerEvents();
      if (response.success) {
        setEvents(response.events || []);
        calculateStats(response.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (eventsList: any[]) => {
    const totalEvents = eventsList.length;
    const activeEvents = eventsList.filter(e => e.status === 'approved').length;
    
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    eventsList.forEach(event => {
      event.ticketTypes?.forEach((tt: any) => {
        const sold = tt.totalSupply - tt.availableSupply;
        totalTicketsSold += sold;
        totalRevenue += sold * tt.price;
      });
    });

    setStats({
      totalEvents,
      activeEvents,
      totalTicketsSold,
      totalRevenue,
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, change, trend }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color.bg}`}>
          <Icon className={`h-4 w-4 ${color.text}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {change} from last month
          </p>
        )}
      </CardContent>
      <div className={`absolute top-0 right-0 w-16 h-16 ${color.bg} opacity-10 rounded-full -mr-8 -mt-8`} />
    </Card>
  );

  const EventCard = ({ event }: { event: any }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/organizer/events/${event.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {event.description}
            </CardDescription>
          </div>
          <Badge 
            className={
              event.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
              event.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
              event.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
              'bg-gray-500/20 text-gray-300 border-gray-500/30'
            }
          >
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {event.venue}, {event.city}
        </div>
        
        {event.status === 'rejected' && event.rejectionReason && (
          <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded mt-2">
            <strong>Rejected:</strong> {event.rejectionReason}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center text-sm">
            <Ticket className="h-4 w-4 mr-1" />
            <span>{event.ticketTypes?.length || 0} ticket types</span>
          </div>
          <div className="text-sm font-semibold">
            {event.ticketTypes?.reduce((sum: number, tt: any) => 
              sum + (tt.totalSupply - tt.availableSupply), 0
            )} sold
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Organizer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your events and track performance
          </p>
        </div>
        <Button onClick={() => router.push('/organizer/create')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Event Created Success Message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Card className={`border ${isAutoApproved ? 'bg-green-500/20 border-green-500/30' : 'bg-yellow-500/20 border-yellow-500/30'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {isAutoApproved ? (
                      <CheckCircle className="h-6 w-6 text-green-400 mt-0.5" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-400 mt-0.5" />
                    )}
                    <div>
                      <h3 className={`font-semibold ${isAutoApproved ? 'text-green-300' : 'text-yellow-300'}`}>
                        {isAutoApproved ? '🎉 Event Created & Live!' : '📝 Event Submitted for Review'}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        {isAutoApproved 
                          ? 'Your event is now live and ready for ticket sales. Share it with your audience!'
                          : 'Your event is pending admin review. You\'ll receive an email update within 1-24 hours.'}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        {isAutoApproved && (
                          <Button size="sm" variant="outline" className="border-green-500/50 text-green-300 hover:bg-green-500/20">
                            <Share2 className="h-4 w-4 mr-1" /> Share Event
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Mail className="h-4 w-4 mr-1" /> {isAutoApproved ? 'Email Sent' : 'Check Email'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSuccessMessage(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner for New Organizers */}
      <AnimatePresence>
        {showWelcome && events.length === 0 && !showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Sparkles className="h-8 w-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Welcome to TicketChain, {user?.name}! 🎉
                      </h3>
                      <p className="text-gray-300 mb-4">
                        You're ready to create your first event. Here's a quick guide to get started:
                      </p>
                      
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                          <div>
                            <p className="font-medium text-white">Create Event</p>
                            <p className="text-xs text-gray-400">Add details, tickets & pricing</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                          <div>
                            <p className="font-medium text-white">Get Approved</p>
                            <p className="text-xs text-gray-400">Quick review by our team</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                          <div>
                            <p className="font-medium text-white">Start Selling</p>
                            <p className="text-xs text-gray-400">Earn from sales & royalties</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => router.push('/organizer/create')}
                          className="gradient-purple-cyan border-0 text-white"
                        >
                          Create Your First Event
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={() => window.open('https://youtube.com', '_blank')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Tutorial (1 min)
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={dismissWelcome}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          color={{ bg: 'bg-blue-500/10', text: 'text-blue-500' }}
          change="+12%"
          trend="up"
        />
        <StatCard
          title="Approved Events"
          value={stats.activeEvents}
          icon={Eye}
          color={{ bg: 'bg-green-500/10', text: 'text-green-500' }}
          change="+8%"
          trend="up"
        />
        <StatCard
          title="Tickets Sold"
          value={stats.totalTicketsSold.toLocaleString()}
          icon={Ticket}
          color={{ bg: 'bg-purple-500/10', text: 'text-purple-500' }}
          change="+23%"
          trend="up"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color={{ bg: 'bg-orange-500/10', text: 'text-orange-500' }}
          change="+15%"
          trend="up"
        />
      </div>

      {/* Quick Actions - Earnings & Withdrawals */}
      <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <DollarSign className="h-8 w-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Earnings & Withdrawals</h3>
                <p className="text-sm text-muted-foreground">
                  View detailed earnings, royalties, and withdraw funds instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-green-400">₹{(stats.totalRevenue * 0.9).toLocaleString()}</p>
              </div>
              <Button 
                onClick={() => router.push('/organizer/earnings')}
                className="gradient-purple-cyan border-0 text-white"
              >
                View Earnings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[200px] w-full"
            >
              <BarChart
                data={[
                  { month: 'Jul', revenue: 45000 },
                  { month: 'Aug', revenue: 52000 },
                  { month: 'Sep', revenue: 48000 },
                  { month: 'Oct', revenue: 61000 },
                  { month: 'Nov', revenue: 55000 },
                  { month: 'Dec', revenue: stats.totalRevenue || 58000 },
                ]}
              >
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Event Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Event Status
            </CardTitle>
            <CardDescription>Distribution of your events by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                approved: { label: "Approved", color: "hsl(142, 76%, 36%)" },
                pending: { label: "Pending", color: "hsl(48, 96%, 53%)" },
                rejected: { label: "Rejected", color: "hsl(0, 84%, 60%)" },
              }}
              className="h-[200px] w-full"
            >
              <PieChart>
                <Pie
                  data={[
                    { name: 'Approved', value: stats.activeEvents, fill: 'hsl(142, 76%, 36%)' },
                    { name: 'Pending', value: events.filter(e => e.status === 'pending').length, fill: 'hsl(48, 96%, 53%)' },
                    { name: 'Rejected', value: events.filter(e => e.status === 'rejected').length, fill: 'hsl(0, 84%, 60%)' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Events</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event to get started
            </p>
            <Button onClick={() => router.push('/organizer/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
