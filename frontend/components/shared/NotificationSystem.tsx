'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Crown, 
  Sparkles, 
  X, 
  PartyPopper,
  Star
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'artist_approved' | 'artist_rejected' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock notification for demo
  useEffect(() => {
    // Simulate receiving an artist approval notification
    const mockNotification: Notification = {
      id: '1',
      type: 'artist_approved',
      title: 'Welcome to the stage! 🎉',
      message: 'Congratulations! You are now a verified artist with blue tick status. You can now create Golden Tickets and message your fans directly.',
      timestamp: new Date(),
      read: false,
      data: {
        royaltyPercentage: 15,
        canCreateGoldenTickets: true
      }
    };

    // Show notification after 3 seconds (simulate approval)
    const timer = setTimeout(() => {
      setNotifications([mockNotification]);
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#A855F7', '#06B6D4', '#22C55E', '#F59E0B', '#EC4899'][i % 5],
                left: `${Math.random() * 100}%`,
                top: -20,
              }}
              animate={{
                y: [0, window.innerHeight + 100],
                rotate: [0, 360],
                opacity: [1, 0],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-4 max-w-sm">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className="relative"
            >
              <Card className={`glass-card border-2 ${
                notification.type === 'artist_approved' 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-white/20 bg-white/5'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {notification.type === 'artist_approved' && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="text-sm text-gray-300 mb-3">
                    {notification.message}
                  </p>

                  {notification.type === 'artist_approved' && notification.data && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Artist
                        </Badge>
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Golden Tickets
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          {notification.data.royaltyPercentage}% Royalties
                        </Badge>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => {
                          markAsRead(notification.id);
                          window.location.href = '/artist';
                        }}
                        className="w-full gradient-blue-purple hover:opacity-90 border-0 text-white text-xs h-8"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Go to Artist Dashboard
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}