'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { PremiumEventDetail } from '@/components/events/PremiumEventDetail';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎫</div>
          <h2 className="text-2xl font-bold text-white">Event not found</h2>
          <p className="text-gray-400">The event you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => router.push('/buyer')} 
            className="gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold px-8 py-3 rounded-full"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PremiumEventDetail 
      event={event} 
      onBack={() => router.back()} 
    />
  );
}
