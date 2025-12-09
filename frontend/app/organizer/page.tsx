'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Ticket, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function OrganizerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          color="text-blue-500"
        />
        <StatCard
          title="Approved Events"
          value={stats.activeEvents}
          icon={TrendingUp}
          color="text-green-500"
        />
        <StatCard
          title="Tickets Sold"
          value={stats.totalTicketsSold}
          icon={Ticket}
          color="text-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="text-orange-500"
        />
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
    </div>
  );
}
