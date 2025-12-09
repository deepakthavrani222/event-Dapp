'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, User, Ticket, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { PurchaseDialog } from '@/components/events/PurchaseDialog';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      fetchEvent(params.id as string);
    }
  }, [params.id]);

  const fetchEvent = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiClient.getEvent(id);
      if (response.success) {
        setEvent(response.event);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Event not found</p>
          <Button onClick={() => router.push('/buyer')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                  <Badge variant="secondary" className="text-sm">
                    {event.category}
                  </Badge>
                </div>
              </div>

              <p className="text-lg text-muted-foreground">
                {event.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-muted-foreground">
                    {format(new Date(event.startDate), 'PPPP')}
                  </p>
                  <p className="text-muted-foreground">
                    {format(new Date(event.startDate), 'p')} - {format(new Date(event.endDate), 'p')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{event.venue.name}</p>
                  <p className="text-muted-foreground">
                    {event.venue.address}
                  </p>
                  <p className="text-muted-foreground">
                    {event.venue.city}, {event.venue.state}
                  </p>
                </div>
              </div>

              {event.organizer && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Organized by</p>
                    <p className="text-muted-foreground">{event.organizer.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Types */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Select Tickets</h2>
            
            {event.ticketTypes.map((ticketType: any) => (
              <Card key={ticketType.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{ticketType.name}</span>
                    <Badge variant={ticketType.availableSupply > 0 ? 'default' : 'secondary'}>
                      {ticketType.availableSupply > 0 ? 'Available' : 'Sold Out'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{ticketType.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        ₹{ticketType.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        <Ticket className="h-4 w-4 inline mr-1" />
                        {ticketType.availableSupply} / {ticketType.totalSupply}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      disabled={ticketType.availableSupply === 0 || !isAuthenticated}
                      onClick={() => setSelectedTicketType(ticketType)}
                    >
                      {!isAuthenticated ? 'Login to Purchase' : 'Purchase'}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Max {ticketType.maxPerWallet} per wallet
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {selectedTicketType && (
        <PurchaseDialog
          ticketType={selectedTicketType}
          eventTitle={event.title}
          onClose={() => setSelectedTicketType(null)}
          onSuccess={() => {
            setSelectedTicketType(null);
            router.push('/buyer/tickets');
          }}
        />
      )}
    </div>
  );
}
