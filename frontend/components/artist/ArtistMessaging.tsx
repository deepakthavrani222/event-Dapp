'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Crown, 
  Calendar,
  Eye,
  Click,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  Target,
  Sparkles
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ArtistMessagingProps {
  artistId: string;
  messagingEnabled: boolean;
  verificationStatus: string;
}

interface Message {
  id: string;
  eventId?: string;
  recipients: 'all_fans' | 'event_attendees' | 'golden_ticket_holders';
  message: {
    title: string;
    content: string;
    type: string;
    mediaUrl?: string;
    actionButton?: {
      text: string;
      url: string;
    };
  };
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  clickCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  createdAt: string;
  scheduledFor?: string;
  sentAt?: string;
}

const MESSAGE_TYPES = [
  { value: 'announcement', label: 'Announcement', icon: '📢' },
  { value: 'exclusive_content', label: 'Exclusive Content', icon: '🎵' },
  { value: 'meet_greet', label: 'Meet & Greet', icon: '🤝' },
  { value: 'behind_scenes', label: 'Behind the Scenes', icon: '🎬' },
  { value: 'custom', label: 'Custom', icon: '✨' }
];

export function ArtistMessaging({ 
  artistId, 
  messagingEnabled, 
  verificationStatus 
}: ArtistMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  
  const [newMessage, setNewMessage] = useState({
    recipients: 'all_fans' as 'all_fans' | 'event_attendees' | 'golden_ticket_holders',
    eventId: '',
    title: '',
    content: '',
    type: 'announcement',
    mediaUrl: '',
    actionButton: {
      text: '',
      url: ''
    },
    scheduledFor: ''
  });

  useEffect(() => {
    if (messagingEnabled && verificationStatus === 'verified') {
      fetchMessages();
    }
  }, [artistId, messagingEnabled, verificationStatus]);

  const fetchMessages = async () => {
    try {
      const response = await apiClient.request('/api/artist/messages', {
        method: 'GET'
      });

      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.title || !newMessage.content) {
      alert('Please fill in title and content');
      return;
    }

    setSending(true);

    try {
      const response = await apiClient.request('/api/artist/messages', {
        method: 'POST',
        body: JSON.stringify({
          ...newMessage,
          message: {
            title: newMessage.title,
            content: newMessage.content,
            type: newMessage.type,
            mediaUrl: newMessage.mediaUrl || undefined,
            actionButton: newMessage.actionButton.text && newMessage.actionButton.url 
              ? newMessage.actionButton 
              : undefined
          }
        })
      });

      if (response.success) {
        setShowComposer(false);
        setNewMessage({
          recipients: 'all_fans',
          eventId: '',
          title: '',
          content: '',
          type: 'announcement',
          mediaUrl: '',
          actionButton: { text: '', url: '' },
          scheduledFor: ''
        });
        fetchMessages();
      } else {
        alert(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sent
        </Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
          Draft
        </Badge>;
    }
  };

  const getRecipientsBadge = (recipients: string) => {
    switch (recipients) {
      case 'all_fans':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Users className="h-3 w-3 mr-1" />
          All Fans
        </Badge>;
      case 'golden_ticket_holders':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          <Crown className="h-3 w-3 mr-1" />
          Golden Ticket Holders
        </Badge>;
      case 'event_attendees':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          <Calendar className="h-3 w-3 mr-1" />
          Event Attendees
        </Badge>;
      default:
        return null;
    }
  };

  // Check if messaging is available
  if (verificationStatus !== 'verified') {
    return (
      <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Verification Required</h3>
          <p className="text-gray-300 mb-4">
            You need to be a verified artist to message your fans directly.
          </p>
          <Button className="gradient-purple-cyan hover:opacity-90 border-0 text-white">
            Get Verified
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!messagingEnabled) {
    return (
      <Card className="glass-card border-red-500/30 bg-red-500/10">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Messaging Disabled</h3>
          <p className="text-gray-300 mb-4">
            Fan messaging is currently disabled for your account.
          </p>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Fan Messaging</h2>
          <p className="text-gray-400">Send direct messages to your fans and build deeper connections</p>
        </div>
        <Button
          onClick={() => setShowComposer(true)}
          className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Message Composer */}
      {showComposer && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="h-5 w-5" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recipients */}
            <div className="space-y-3">
              <Label className="text-white">Send To</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'all_fans', label: 'All Fans', icon: Users, desc: 'Send to all your fans' },
                  { value: 'golden_ticket_holders', label: 'Golden Ticket Holders', icon: Crown, desc: 'VIP fans only' },
                  { value: 'event_attendees', label: 'Event Attendees', icon: Calendar, desc: 'Specific event fans' }
                ].map((option) => (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      newMessage.recipients === option.value
                        ? 'border-purple-500/50 bg-purple-500/20'
                        : 'border-white/20 bg-white/5 hover:border-purple-500/30'
                    }`}
                    onClick={() => setNewMessage(prev => ({ ...prev, recipients: option.value as any }))}
                  >
                    <CardContent className="p-4 text-center">
                      <option.icon className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                      <h4 className="font-semibold text-white text-sm">{option.label}</h4>
                      <p className="text-xs text-gray-400">{option.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Message Type */}
            <div className="space-y-3">
              <Label className="text-white">Message Type</Label>
              <div className="flex flex-wrap gap-2">
                {MESSAGE_TYPES.map((type) => (
                  <Badge
                    key={type.value}
                    variant={newMessage.type === type.value ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      newMessage.type === type.value
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                    onClick={() => setNewMessage(prev => ({ ...prev, type: type.value }))}
                  >
                    {type.icon} {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Title and Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Message Title</Label>
                <Input
                  id="title"
                  value={newMessage.title}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Exciting news for my fans!"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mediaUrl" className="text-white">Media URL (Optional)</Label>
                <Input
                  id="mediaUrl"
                  value={newMessage.mediaUrl}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, mediaUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-white">Message Content</Label>
              <Textarea
                id="content"
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Hey everyone! I have some exciting news to share..."
                className="bg-white/10 border-white/20 text-white min-h-[120px]"
              />
            </div>

            {/* Action Button */}
            <div className="space-y-3">
              <Label className="text-white">Action Button (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={newMessage.actionButton.text}
                  onChange={(e) => setNewMessage(prev => ({
                    ...prev,
                    actionButton: { ...prev.actionButton, text: e.target.value }
                  }))}
                  placeholder="Button text (e.g., 'Buy Tickets')"
                  className="bg-white/10 border-white/20 text-white"
                />
                <Input
                  value={newMessage.actionButton.url}
                  onChange={(e) => setNewMessage(prev => ({
                    ...prev,
                    actionButton: { ...prev.actionButton, url: e.target.value }
                  }))}
                  placeholder="Button URL"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowComposer(false)}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.title || !newMessage.content}
                className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white"
              >
                {sending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <Card className="glass-card border-white/20 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Message History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-white/10 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{message.message.title}</h4>
                        {getStatusBadge(message.status)}
                        {getRecipientsBadge(message.recipients)}
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">{message.message.content}</p>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      {message.sentAt 
                        ? new Date(message.sentAt).toLocaleDateString()
                        : new Date(message.createdAt).toLocaleDateString()
                      }
                    </div>
                  </div>

                  {/* Message Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{message.totalRecipients} recipients</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>{message.deliveredCount} delivered</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Eye className="h-4 w-4" />
                      <span>{message.readCount} read</span>
                    </div>
                    {message.clickCount > 0 && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <Click className="h-4 w-4" />
                        <span>{message.clickCount} clicks</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Messages Yet</h3>
              <p className="text-gray-400 mb-4">Start connecting with your fans by sending your first message</p>
              <Button
                onClick={() => setShowComposer(true)}
                className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Send First Message
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}