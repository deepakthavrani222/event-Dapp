'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Ticket, ExternalLink, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import { ResellDialog } from '@/components/tickets/ResellDialog';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resellTicket, setResellTicket] = useState<any>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyTickets();
      if (response.success) {
        setTickets(response.tickets || []);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResellSuccess = () => {
    setResellTicket(null);
    fetchTickets();
  };

  const activeTickets = tickets.filter(t => t.status === 'ACTIVE');
  const usedTickets = tickets.filter(t => t.status === 'USED');

  const TicketCard = ({ ticket }: { ticket: any }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">
              {ticket.event?.title || 'Event'}
            </CardTitle>
            <CardDescription>
              {ticket.ticketType?.name || 'Ticket'}
            </CardDescription>
          </div>
          <Badge variant={ticket.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {ticket.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {ticket.event && (
          <>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {format(new Date(ticket.event.startDate), 'PPP p')}
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {ticket.event.venue.name}, {ticket.event.venue.city}
            </div>
          </>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Price Paid</span>
          <span className="font-semibold">₹{ticket.price.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Token ID</span>
          <span className="font-mono text-xs">{ticket.tokenId}</span>
        </div>

        {ticket.status === 'ACTIVE' && (
          <div className="pt-4 border-t">
            <div className="bg-white p-4 rounded-lg">
              <QRCode
                value={JSON.stringify({
                  ticketId: ticket.id,
                  tokenId: ticket.tokenId,
                  eventId: ticket.event?.id,
                })}
                size={200}
                className="mx-auto"
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Show this QR code at the venue
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {ticket.status === 'ACTIVE' && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => setResellTicket(ticket)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Resell
            </Button>
          )}
          
          {ticket.txHash && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${ticket.txHash}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Blockchain
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your purchased tickets
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            <Ticket className="h-4 w-4 mr-2" />
            Active ({activeTickets.length})
          </TabsTrigger>
          <TabsTrigger value="used">
            Used ({usedTickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No active tickets</p>
              <Button onClick={() => window.location.href = '/buyer'} className="mt-4">
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="used" className="space-y-6">
          {usedTickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No used tickets</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usedTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {resellTicket && (
        <ResellDialog
          ticket={resellTicket}
          onClose={() => setResellTicket(null)}
          onSuccess={handleResellSuccess}
        />
      )}
    </div>
  );
}
