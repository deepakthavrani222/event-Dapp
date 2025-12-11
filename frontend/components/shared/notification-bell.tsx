'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Ticket, DollarSign, CheckCircle, XCircle, Trophy, Info, MessageCircle, Crown, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { FanNotifications } from '../notifications/FanNotifications';
import { useRole } from '@/hooks/use-role';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  TICKET_SOLD: <Ticket className="h-4 w-4 text-green-400" />,
  ROYALTY_EARNED: <DollarSign className="h-4 w-4 text-purple-400" />,
  WITHDRAWAL_COMPLETE: <DollarSign className="h-4 w-4 text-cyan-400" />,
  EVENT_APPROVED: <CheckCircle className="h-4 w-4 text-green-400" />,
  EVENT_REJECTED: <XCircle className="h-4 w-4 text-red-400" />,
  MILESTONE: <Trophy className="h-4 w-4 text-yellow-400" />,
  SYSTEM: <Info className="h-4 w-4 text-blue-400" />,
  ARTIST_MESSAGE: <MessageCircle className="h-4 w-4 text-purple-400" />,
  NFT_DROP: <Gift className="h-4 w-4 text-yellow-400" />,
  GOLDEN_TICKET: <Crown className="h-4 w-4 text-yellow-400" />,
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFanNotifications, setShowFanNotifications] = useState(false);
  const { role } = useRole();

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.request('/api/notifications?limit=10');
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      // Silently fail - user might not be logged in
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await apiClient.request('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Mock fan notification count for buyers
  const fanNotificationCount = role === 'buyer' ? 2 : 0;
  const totalUnreadCount = unreadCount + fanNotificationCount;

  const handleBellClick = () => {
    if (role === 'buyer') {
      setShowFanNotifications(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBellClick}
          className="relative text-gray-400 hover:text-white hover:bg-white/5"
        >
          <Bell className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          )}
        </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                        !notification.read ? 'bg-purple-500/5' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {typeIcons[notification.type] || <Info className="h-4 w-4 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-purple-500 rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    onClick={() => setIsOpen(false)}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>

      {/* Fan Notifications Panel */}
      <FanNotifications 
        isOpen={showFanNotifications} 
        onClose={() => setShowFanNotifications(false)} 
      />
    </>
  );
}
