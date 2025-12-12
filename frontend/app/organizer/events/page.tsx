'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Calendar, MapPin, Ticket, Search, Filter, Plus,
  Eye, Clock, XCircle, CheckCircle, Loader2
} from 'lucide-react';

type EventStatus = 'all' | 'approved' | 'pending' | 'rejected' | 'completed';

export default function OrganizerEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus>('all');

  useEffect(() => {
    // Get status from URL params
    const status = searchParams.get('status') as EventStatus;
    if (status && ['all', 'approved', 'pending', 'rejected', 'completed'].includes(status)) {
      setStatusFilter(status);
    }
    fetchEvents();
  }, [searchParams]);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrganizerEvents();
      if (response.success) {
        setEvents(response.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.venue?.toLowerCase().includes(query) ||
        e.city?.toLowerCase().includes(query)
      );
    }
    
    setFilteredEvents(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-green-500/20 text-green-300 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    };
    return styles[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'completed': return <Eye className="h-4 w-4" />;
      default: return null;
    }
  };

  const statusTabs: { value: EventStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All Events', count: events.length },
    { value: 'approved', label: 'Approved', count: events.filter(e => e.status === 'approved').length },
    { value: 'pending', label: 'Pending', count: events.filter(e => e.status === 'pending').length },
    { value: 'rejected', label: 'Rejected', count: events.filter(e => e.status === 'rejected').length },
    { value: 'completed', label: 'Completed', count: events.filter(e => e.status === 'completed').length },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/organizer')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-muted-foreground">Manage all your events</p>
          </div>
        </div>
        <Button onClick={() => router.push('/organizer/create')} className="gradient-purple-cyan border-0 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900/50 border-white/20"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? 'default' : 'outline'}
            onClick={() => {
              setStatusFilter(tab.value);
              router.push(`/organizer/events${tab.value !== 'all' ? `?status=${tab.value}` : ''}`);
            }}
            className={statusFilter === tab.value ? 'gradient-purple-cyan border-0' : 'border-white/20'}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
              {tab.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center border-white/20 bg-gray-900/50">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {statusFilter === 'all' ? 'No events yet' : `No ${statusFilter} events`}
          </h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter === 'all' 
              ? 'Create your first event to get started'
              : `You don't have any ${statusFilter} events`}
          </p>
          {statusFilter === 'all' && (
            <Button onClick={() => router.push('/organizer/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className="hover:shadow-lg transition-all cursor-pointer border-white/20 bg-gray-900/50 hover:bg-gray-900/80"
              onClick={() => router.push(`/organizer/events/${event.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1 text-white">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {event.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusBadge(event.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(event.status)}
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
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
                    <strong>Reason:</strong> {event.rejectionReason}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Ticket className="h-4 w-4 mr-1" />
                    <span>{event.ticketTypes?.length || 0} ticket types</span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {event.ticketTypes?.reduce((sum: number, tt: any) => 
                      sum + (tt.totalSupply - tt.availableSupply), 0
                    ) || 0} sold
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
