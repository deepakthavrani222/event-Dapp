'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    venue: {
      name: string;
      city: string;
      state: string;
    };
    startDate: string;
    minPrice: number;
    totalAvailable: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {event.description}
            </CardDescription>
          </div>
          <Badge variant="secondary">{event.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {format(new Date(event.startDate), 'PPP p')}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {event.venue.name}, {event.venue.city}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Ticket className="h-4 w-4 mr-2" />
          {event.totalAvailable} tickets available
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Starting from</p>
          <p className="text-2xl font-bold">₹{event.minPrice.toLocaleString()}</p>
        </div>
        
        <Button asChild>
          <Link href={`/event/${event.id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
