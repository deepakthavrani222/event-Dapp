'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ResaleMarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getResaleListings();
      if (response.success) {
        setListings(response.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (listingId: string) => {
    try {
      setPurchasing(listingId);
      const response = await apiClient.purchaseResaleTicket(listingId, 'UPI');

      if (response.success) {
        router.push('/buyer/tickets');
      }
    } catch (error: any) {
      alert(error.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const ListingCard = ({ listing }: { listing: any }) => {
    const priceChange = listing.ticketType?.originalPrice 
      ? ((listing.price - listing.ticketType.originalPrice) / listing.ticketType.originalPrice) * 100
      : 0;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="line-clamp-1">
                {listing.event?.title || 'Event'}
              </CardTitle>
              <CardDescription>
                {listing.ticketType?.name || 'Ticket'}
              </CardDescription>
            </div>
            <Badge variant="secondary">Resale</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {listing.event && (
            <>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {format(new Date(listing.event.startDate), 'PPP')}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                {listing.event.venue.name}, {listing.event.venue.city}
              </div>
            </>
          )}

          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resale Price</p>
                <p className="text-2xl font-bold">₹{listing.price.toLocaleString()}</p>
              </div>
              
              {listing.ticketType?.originalPrice && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Original</p>
                  <p className="text-sm line-through">
                    ₹{listing.ticketType.originalPrice.toLocaleString()}
                  </p>
                  <div className={`flex items-center text-xs ${priceChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {priceChange > 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(priceChange).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => handlePurchase(listing.id)}
              disabled={purchasing === listing.id}
            >
              {purchasing === listing.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Purchasing...
                </>
              ) : (
                'Purchase Resale Ticket'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Listed {format(new Date(listing.listedAt), 'PPP')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Resale Marketplace</h1>
        <p className="text-muted-foreground">
          Buy tickets from other users at market prices
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No resale listings</h3>
          <p className="text-muted-foreground mb-4">
            Check back later for resale tickets
          </p>
          <Button onClick={() => router.push('/buyer')}>
            Browse Events
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
