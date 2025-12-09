'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Ticket, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchEvents();
    fetchUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.request('/api/admin/dashboard');
      if (response.success) {
        setMetrics(response.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await apiClient.request('/api/admin/events');
      if (response.success) {
        setEvents(response.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.request('/api/admin/users');
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const approveEvent = async (eventId: string) => {
    try {
      const response = await apiClient.request(`/api/admin/events/${eventId}/approve`, {
        method: 'POST',
      });
      if (response.success) {
        fetchEvents();
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to approve event:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await apiClient.request(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      if (response.success) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
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

  const pendingEvents = events.filter(e => e.status === 'DRAFT');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage platform, approve events, and monitor activity
        </p>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={Users}
            color="text-blue-500"
          />
          <StatCard
            title="Total Events"
            value={metrics.totalEvents}
            icon={Calendar}
            color="text-green-500"
          />
          <StatCard
            title="Tickets Sold"
            value={metrics.totalTickets}
            icon={Ticket}
            color="text-purple-500"
          />
          <StatCard
            title="Platform Revenue"
            value={`₹${metrics.platformRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="text-orange-500"
          />
        </div>
      )}

      {/* Pending Approvals Alert */}
      {pendingEvents.length > 0 && (
        <Card className="mb-8 border-orange-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <CardTitle>Pending Approvals</CardTitle>
            </div>
            <CardDescription>
              {pendingEvents.length} event(s) waiting for approval
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">
            Events ({events.length})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({users.length})
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {events.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No events yet</p>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {event.organizer?.name} • {event.venue.city}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      event.status === 'PUBLISHED' ? 'default' :
                      event.status === 'DRAFT' ? 'secondary' : 'outline'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {event.category} • {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    {event.status === 'DRAFT' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveEvent(event.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {users.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No users yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <Badge>{user.role}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground font-mono">
                        {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                        >
                          <option value="BUYER">Buyer</option>
                          <option value="ORGANIZER">Organizer</option>
                          <option value="PROMOTER">Promoter</option>
                          <option value="INSPECTOR">Inspector</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
