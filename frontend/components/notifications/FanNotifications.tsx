'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  Crown, 
  Gift, 
  MessageCircle, 
  Star, 
  Calendar,
  ExternalLink,
  Check,
  Sparkles
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface FanNotification {
  id: string;
  type: 'artist_message' | 'nft_drop' | 'event_update' | 'golden_ticket';
  title: string;
  content: string;
  artistName: string;
  artistImage?: string;
  isRead: boolean;
  hasNFTDrop: boolean;
  nftClaimed: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface FanNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FanNotifications({ isOpen, onClose }: FanNotificationsProps) {
  const [notifications, setNotifications] = useState<FanNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingNFT, setClaimingNFT] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      // Mock notifications for demo
      const mockNotifications: FanNotification[] = [
        {
          id: '1',
          type: 'artist_message',
          title: 'Surprise! Free after-party at Hakkasan',
          content: 'Hey amazing fans! I have a special surprise for all Golden Pass holders. Join me at Hakkasan for an exclusive after-party tonight!',
          artistName: 'Badshah',
          isRead: false,
          hasNFTDrop: true,
          nftClaimed: false,
          createdAt: '2024-12-11T18:30:00Z'
        },
        {
          id: '2',
          type: 'nft_drop',
          title: 'Exclusive Merch NFT Available',
          content: 'Claim your limited edition merchandise NFT! Only available for the next 24 hours.',
          artistName: 'Prateek Kuhad',
          isRead: false,
          hasNFTDrop: true,
          nftClaimed: false,
          createdAt: '2024-12-11T16:00:00Z'
        },
        {
          id: '3',
          type: 'event_update',
          title: 'Show Update: Mumbai Concert',
          content: 'The venue has been upgraded to a larger space due to popular demand! All tickets remain valid.',
          artistName: 'Nucleya',
          isRead: true,
          hasNFTDrop: false,
          nftClaimed: false,
          createdAt: '2024-12-11T14:15:00Z'
        },
        {
          id: '4',
          type: 'golden_ticket',
          title: 'New Golden Ticket Available',
          content: 'I just dropped a limited edition Golden VIP Experience for my upcoming Delhi show. Only 25 available!',
          artistName: 'DIVINE',
          isRead: true,
          hasNFTDrop: false,
          nftClaimed: false,
          createdAt: '2024-12-11T12:00:00Z'
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const claimNFT = async (notificationId: string) => {
    setClaimingNFT(notificationId);
    
    try {
      // Simulate NFT claiming
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, nftClaimed: true }
            : notif
        )
      );

      alert('🎉 NFT Claimed Successfully!\n\nYour exclusive NFT has been minted to your wallet. Check your collection to view it.');
    } catch (error) {
      console.error('Failed to claim NFT:', error);
      alert('Failed to claim NFT. Please try again.');
    } finally {
      setClaimingNFT(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'artist_message':
        return MessageCircle;
      case 'nft_drop':
        return Gift;
      case 'event_update':
        return Calendar;
      case 'golden_ticket':
        return Crown;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'artist_message':
        return 'from-purple-500 to-pink-500';
      case 'nft_drop':
        return 'from-yellow-500 to-orange-500';
      case 'event_update':
        return 'from-blue-500 to-cyan-500';
      case 'golden_ticket':
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Notifications Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 max-w-[90vw] bg-gray-900/95 backdrop-blur-xl border-l border-white/20 z-[101] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {unreadCount > 0 && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            {/* Notifications List */}
            <div className="p-4 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-white/10 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative overflow-hidden rounded-xl border transition-all ${
                        notification.isRead 
                          ? 'border-white/10 bg-white/5' 
                          : 'border-purple-500/30 bg-purple-500/10'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      )}

                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white text-sm truncate">
                                {notification.title}
                              </h3>
                              {notification.type === 'golden_ticket' && (
                                <Crown className="h-3 w-3 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              from {notification.artistName}
                            </p>
                          </div>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {notification.content}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>

                          {notification.hasNFTDrop && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!notification.nftClaimed) {
                                  claimNFT(notification.id);
                                }
                              }}
                              disabled={notification.nftClaimed || claimingNFT === notification.id}
                              size="sm"
                              className={`${
                                notification.nftClaimed
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : 'gradient-yellow-orange hover:opacity-90 border-0 text-black'
                              } text-xs`}
                            >
                              {claimingNFT === notification.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                                  Claiming...
                                </>
                              ) : notification.nftClaimed ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Claimed
                                </>
                              ) : (
                                <>
                                  <Gift className="h-3 w-3 mr-1" />
                                  Claim NFT
                                </>
                              )}
                            </Button>
                          )}

                          {notification.actionUrl && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(notification.actionUrl, '_blank');
                              }}
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Notifications</h3>
                  <p className="text-gray-400 text-sm">
                    You'll receive updates from artists you follow here
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/20 bg-white/5">
              <Button
                onClick={() => {
                  setNotifications(prev => 
                    prev.map(notif => ({ ...notif, isRead: true }))
                  );
                }}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}