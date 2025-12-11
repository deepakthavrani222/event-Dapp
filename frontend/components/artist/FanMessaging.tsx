'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Target, 
  Calendar,
  Image as ImageIcon,
  Gift,
  Mail,
  Smartphone,
  Bell,
  Eye,
  MousePointer,
  TrendingUp,
  Crown,
  MapPin,
  Ticket,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Filter,
  BarChart3
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface AudienceStats {
  totalFans: number;
  regularTicketHolders: number;
  goldenTicketHolders: number;
  citiesBreakdown: Array<{ city: string; count: number }>;
  eventsBreakdown: Array<{ eventId: string; count: number }>;
  ticketTypesBreakdown: Array<{ type: string; count: number }>;
  recentFans: Array<{
    name: string;
    email: string;
    type: 'regular' | 'golden';
    date: string;
    amount: number;
  }>;
  engagementMetrics: {
    averageTicketsPerFan: number;
    repeatCustomers: number;
    goldenTicketConversionRate: number;
  };
}

interface Message {
  id: string;
  title: string;
  content: string;
  segmentation: {
    type: string;
    estimatedReach: number;
  };
  status: string;
  analytics: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    nftsClaimed: number;
  };
  createdAt: string;
}

export function FanMessaging() {
  const [activeTab, setActiveTab] = useState('compose');
  const [audienceStats, setAudienceStats] = useState<AudienceStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Message composition state
  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    segmentation: {
      type: 'all',
      criteria: {}
    },
    deliveryChannels: {
      email: true,
      push: true,
      inApp: true
    },
    nftDrop: {
      enabled: false,
      title: '',
      description: '',
      claimLimit: 1000
    },
    scheduledFor: ''
  });

  const [estimatedReach, setEstimatedReach] = useState(0);

  useEffect(() => {
    fetchAudienceData();
    fetchMessages();
  }, []);

  useEffect(() => {
    calculateEstimatedReach();
  }, [messageForm.segmentation, audienceStats]);

  const fetchAudienceData = async () => {
    try {
      const response = await apiClient.getArtistAudience();
      if (response.success) {
        setAudienceStats(response.audienceStats);
      }
    } catch (error) {
      console.error('Failed to fetch audience data:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await apiClient.getArtistMessages();
      if (response.success) {
        setMessages(response.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedReach = () => {
    if (!audienceStats) return;

    let reach = 0;
    switch (messageForm.segmentation.type) {
      case 'all':
        reach = audienceStats.totalFans;
        break;
      case 'golden_only':
        reach = audienceStats.goldenTicketHolders;
        break;
      case 'city':
        const cityData = audienceStats.citiesBreakdown.find(
          c => c.city === messageForm.segmentation.criteria.city
        );
        reach = cityData?.count || 0;
        break;
      case 'ticket_type':
        const typeData = audienceStats.ticketTypesBreakdown.find(
          t => t.type === messageForm.segmentation.criteria.ticketType
        );
        reach = typeData?.count || 0;
        break;
      default:
        reach = 0;
    }
    setEstimatedReach(reach);
  };

  const handleSendMessage = async (sendImmediately = true) => {
    if (!messageForm.title || !messageForm.content) {
      alert('Please fill in title and content');
      return;
    }

    setSending(true);
    try {
      const response = await apiClient.sendArtistMessage({
        ...messageForm,
        sendImmediately
      });

      if (response.success) {
        alert(`🎉 Message ${sendImmediately ? 'sent' : 'saved'} successfully!\n\nReached: ${estimatedReach} fans`);
        
        // Reset form
        setMessageForm({
          title: '',
          content: '',
          segmentation: { type: 'all', criteria: {} },
          deliveryChannels: { email: true, push: true, inApp: true },
          nftDrop: { enabled: false, title: '', description: '', claimLimit: 1000 },
          scheduledFor: ''
        });
        
        // Refresh messages
        fetchMessages();
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Fan Messaging</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Send direct messages to your ticket holders. Create exclusive experiences, share updates, 
          and build a loyal community around your music.
        </p>
      </div>

      {/* AP Dhillon Success Example */}
      <Card className="glass-card border-gradient-to-r from-blue-500/30 to-purple-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Real Example: AP Dhillon Fan Messaging</h3>
              <p className="text-gray-400 text-sm">How one message created massive fan engagement</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-blue-400">30,000</p>
              <p className="text-xs text-gray-400">Ticket Holders</p>
              <p className="text-xs text-blue-300">All received message</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-green-400">1 Message</p>
              <p className="text-xs text-gray-400">Sent January 8th</p>
              <p className="text-xs text-green-300">"Free merch for first 500"</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-purple-400">Instant</p>
              <p className="text-xs text-gray-400">Fan Excitement</p>
              <p className="text-xs text-purple-300">Massive engagement boost</p>
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
            <p className="text-white font-semibold text-center">
              💬 Your messages reach all ticket holders instantly - create exclusive moments like AP Dhillon!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Audience Overview */}
      {audienceStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-blue-500/30 bg-blue-500/10">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{audienceStats.totalFans.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total Fans</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/30 bg-green-500/10">
            <CardContent className="p-6 text-center">
              <Ticket className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{audienceStats.regularTicketHolders.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Regular Tickets</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{audienceStats.goldenTicketHolders.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Golden Tickets</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-purple-500/30 bg-purple-500/10">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <p className="text-2xl font-bold text-white">{audienceStats.engagementMetrics.averageTicketsPerFan}</p>
              <p className="text-sm text-gray-400">Avg Tickets/Fan</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/20">
          <TabsTrigger value="compose" className="data-[state=active]:bg-white/20">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-white/20">
            <MessageCircle className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Composition */}
            <div className="space-y-6">
              <Card className="glass-card border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Compose Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Message Title</Label>
                    <Input
                      id="title"
                      value={messageForm.title}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Surprise! Free after-party at Hakkasan"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-white">Message Content</Label>
                    <Textarea
                      id="content"
                      value={messageForm.content}
                      onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Hey amazing fans! I have a special surprise for all Golden Pass holders..."
                      className="bg-white/10 border-white/20 text-white min-h-[120px]"
                    />
                  </div>

                  {/* Delivery Channels */}
                  <div className="space-y-3">
                    <Label className="text-white">Delivery Channels</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-400" />
                          <span className="text-white text-sm">Email</span>
                        </div>
                        <Switch
                          checked={messageForm.deliveryChannels.email}
                          onCheckedChange={(checked) => 
                            setMessageForm(prev => ({
                              ...prev,
                              deliveryChannels: { ...prev.deliveryChannels, email: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-green-400" />
                          <span className="text-white text-sm">Push Notification</span>
                        </div>
                        <Switch
                          checked={messageForm.deliveryChannels.push}
                          onCheckedChange={(checked) => 
                            setMessageForm(prev => ({
                              ...prev,
                              deliveryChannels: { ...prev.deliveryChannels, push: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-purple-400" />
                          <span className="text-white text-sm">In-App Notification</span>
                        </div>
                        <Switch
                          checked={messageForm.deliveryChannels.inApp}
                          onCheckedChange={(checked) => 
                            setMessageForm(prev => ({
                              ...prev,
                              deliveryChannels: { ...prev.deliveryChannels, inApp: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NFT Drop */}
              <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    NFT Drop (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Include NFT Drop</span>
                    <Switch
                      checked={messageForm.nftDrop.enabled}
                      onCheckedChange={(checked) => 
                        setMessageForm(prev => ({
                          ...prev,
                          nftDrop: { ...prev.nftDrop, enabled: checked }
                        }))
                      }
                    />
                  </div>

                  {messageForm.nftDrop.enabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">NFT Title</Label>
                        <Input
                          value={messageForm.nftDrop.title}
                          onChange={(e) => setMessageForm(prev => ({
                            ...prev,
                            nftDrop: { ...prev.nftDrop, title: e.target.value }
                          }))}
                          placeholder="Exclusive Merch NFT"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">NFT Description</Label>
                        <Textarea
                          value={messageForm.nftDrop.description}
                          onChange={(e) => setMessageForm(prev => ({
                            ...prev,
                            nftDrop: { ...prev.nftDrop, description: e.target.value }
                          }))}
                          placeholder="Claim your exclusive merchandise NFT - limited time only!"
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Audience Targeting */}
            <div className="space-y-6">
              <Card className="glass-card border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Audience Targeting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-white">Target Audience</Label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Fans', icon: Users, count: audienceStats?.totalFans || 0 },
                        { value: 'golden_only', label: 'Golden Ticket Holders Only', icon: Crown, count: audienceStats?.goldenTicketHolders || 0 },
                        { value: 'city', label: 'Specific City', icon: MapPin, count: 0 },
                        { value: 'ticket_type', label: 'Specific Ticket Type', icon: Ticket, count: 0 }
                      ].map((option) => (
                        <Card
                          key={option.value}
                          className={`cursor-pointer transition-all ${
                            messageForm.segmentation.type === option.value
                              ? 'border-purple-500/50 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-purple-500/30'
                          }`}
                          onClick={() => setMessageForm(prev => ({
                            ...prev,
                            segmentation: { type: option.value, criteria: {} }
                          }))}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <option.icon className="h-5 w-5 text-purple-400" />
                                <span className="text-white font-medium">{option.label}</span>
                              </div>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                {option.count.toLocaleString()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* City Selection */}
                  {messageForm.segmentation.type === 'city' && audienceStats && (
                    <div className="space-y-2">
                      <Label className="text-white">Select City</Label>
                      <div className="space-y-1">
                        {audienceStats.citiesBreakdown.map((city) => (
                          <Card
                            key={city.city}
                            className={`cursor-pointer transition-all ${
                              messageForm.segmentation.criteria.city === city.city
                                ? 'border-blue-500/50 bg-blue-500/20'
                                : 'border-white/20 bg-white/5 hover:border-blue-500/30'
                            }`}
                            onClick={() => setMessageForm(prev => ({
                              ...prev,
                              segmentation: { 
                                ...prev.segmentation, 
                                criteria: { city: city.city } 
                              }
                            }))}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-white">{city.city}</span>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  {city.count}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimated Reach */}
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-green-400" />
                        <span className="text-white font-semibold">Estimated Reach</span>
                      </div>
                      <span className="text-2xl font-bold text-green-400">
                        {estimatedReach.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-green-300 mt-1">
                      fans will receive this message
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Send Actions */}
              <Card className="glass-card border-white/20 bg-white/5">
                <CardContent className="p-6 space-y-4">
                  <Button
                    onClick={() => handleSendMessage(true)}
                    disabled={sending || !messageForm.title || !messageForm.content}
                    className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-bold h-12"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message Now
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleSendMessage(false)}
                    disabled={sending || !messageForm.title || !messageForm.content}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Save as Draft
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <Card key={message.id} className="glass-card border-white/20 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{message.title}</h3>
                        <p className="text-gray-400 text-sm">{message.content.substring(0, 100)}...</p>
                      </div>
                      <Badge className={`${
                        message.status === 'sent' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        message.status === 'sending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-300 border-gray-500/30'
                      }`}>
                        {message.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-white">{message.analytics.totalSent}</p>
                        <p className="text-xs text-gray-400">Sent</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{message.analytics.delivered}</p>
                        <p className="text-xs text-gray-400">Delivered</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{message.analytics.opened}</p>
                        <p className="text-xs text-gray-400">Opened</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{message.analytics.clicked}</p>
                        <p className="text-xs text-gray-400">Clicked</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-card border-white/20 bg-white/5">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Messages Yet</h3>
                  <p className="text-gray-400 mb-4">
                    Start building your fan community by sending your first message.
                  </p>
                  <Button
                    onClick={() => setActiveTab('compose')}
                    className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Compose First Message
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {audienceStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cities Breakdown */}
              <Card className="glass-card border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Fans by City
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {audienceStats.citiesBreakdown.slice(0, 5).map((city) => (
                    <div key={city.city} className="flex items-center justify-between">
                      <span className="text-white">{city.city}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            style={{ 
                              width: `${(city.count / audienceStats.totalFans) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-gray-400 text-sm w-12 text-right">{city.count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Fans */}
              <Card className="glass-card border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Fans
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {audienceStats.recentFans.slice(0, 5).map((fan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{fan.name}</p>
                        <p className="text-gray-400 text-xs">{new Date(fan.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${
                          fan.type === 'golden' 
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        } text-xs`}>
                          {fan.type === 'golden' ? 'Golden' : 'Regular'}
                        </Badge>
                        <p className="text-gray-400 text-xs">₹{fan.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}