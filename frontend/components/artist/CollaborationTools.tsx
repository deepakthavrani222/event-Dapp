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
  Users, 
  Plus, 
  MessageSquare, 
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  X,
  Send,
  Star,
  Award,
  Handshake,
  Target,
  Zap,
  Crown,
  Music,
  Ticket,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Collaboration {
  id: string;
  title: string;
  description: string;
  initiatorId: any;
  collaboratorIds: any[];
  status: 'proposed' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  collabType: 'joint_event' | 'cross_promotion' | 'nft_collection' | 'tour';
  terms: {
    revenueShare: Array<{
      artistId: string;
      percentage: number;
    }>;
    responsibilities: Array<{
      artistId: string;
      tasks: string[];
    }>;
  };
  timeline: {
    proposedAt: string;
    acceptedAt?: string;
    startDate?: string;
    endDate?: string;
    completedAt?: string;
  };
  messages: Array<{
    senderId: string;
    message: string;
    timestamp: string;
  }>;
}

const COLLAB_TYPES = {
  joint_event: {
    name: 'Joint Event',
    description: 'Co-host an event together and share the stage',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500'
  },
  cross_promotion: {
    name: 'Cross Promotion',
    description: 'Promote each other\'s events to your fanbases',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500'
  },
  nft_collection: {
    name: 'NFT Collection',
    description: 'Create a collaborative NFT collection',
    icon: Star,
    color: 'from-purple-500 to-pink-500'
  },
  tour: {
    name: 'Tour',
    description: 'Plan a multi-city tour together',
    icon: Music,
    color: 'from-orange-500 to-red-500'
  }
};

export function CollaborationTools() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<Collaboration | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    collabType: 'joint_event' as keyof typeof COLLAB_TYPES,
    collaboratorEmails: '',
    revenueShare: [{ email: '', percentage: 50 }],
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      const response = await apiClient.request('/api/artist/collaborations');
      if (response.success) {
        setCollaborations(response.collaborations || []);
      }
    } catch (error) {
      console.error('Failed to fetch collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollaboration = async () => {
    try {
      const collaboratorEmails = formData.collaboratorEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      const response = await apiClient.request('/api/artist/collaborations', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          collabType: formData.collabType,
          collaboratorEmails,
          revenueShare: formData.revenueShare,
          startDate: formData.startDate,
          endDate: formData.endDate
        })
      });

      if (response.success) {
        await fetchCollaborations();
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          collabType: 'joint_event',
          collaboratorEmails: '',
          revenueShare: [{ email: '', percentage: 50 }],
          startDate: '',
          endDate: ''
        });
        alert('🎉 Collaboration proposal sent successfully!');
      }
    } catch (error: any) {
      console.error('Failed to create collaboration:', error);
      alert(`Failed to create collaboration: ${error.message}`);
    }
  };

  const handleRespondToCollaboration = async (collabId: string, action: 'accept' | 'reject') => {
    try {
      const response = await apiClient.request(`/api/artist/collaborations/${collabId}`, {
        method: 'PUT',
        body: JSON.stringify({
          action: 'respond',
          status: action === 'accept' ? 'accepted' : 'cancelled'
        })
      });

      if (response.success) {
        await fetchCollaborations();
        alert(`Collaboration ${action}ed successfully!`);
      }
    } catch (error: any) {
      console.error(`Failed to ${action} collaboration:`, error);
      alert(`Failed to ${action} collaboration`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filterCollaborations = (status: string) => {
    if (status === 'active') {
      return collaborations.filter(c => ['proposed', 'accepted', 'in_progress'].includes(c.status));
    }
    return collaborations.filter(c => c.status === status);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 gap-6">
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Collaboration Tools</h2>
          <p className="text-gray-400">
            Connect with other verified artists to create amazing experiences together
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Collaboration
        </Button>
      </div>

      {/* Create Collaboration Form */}
      {showCreateForm && (
        <Card className="glass-card border-purple-500/30 bg-purple-500/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Handshake className="h-5 w-5" />
              Propose New Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Collaboration Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Epic Mumbai-Delhi Joint Concert"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Let's create an unforgettable experience for our fans..."
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Collaborator Emails</Label>
                  <Input
                    value={formData.collaboratorEmails}
                    onChange={(e) => setFormData(prev => ({ ...prev, collaboratorEmails: e.target.value }))}
                    placeholder="artist1@email.com, artist2@email.com"
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <p className="text-xs text-gray-400">Separate multiple emails with commas</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Collaboration Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(COLLAB_TYPES).map(([key, type]) => {
                      const TypeIcon = type.icon;
                      return (
                        <Card
                          key={key}
                          className={`cursor-pointer transition-all ${
                            formData.collabType === key
                              ? 'border-purple-500/50 bg-purple-500/20'
                              : 'border-white/20 bg-white/5 hover:border-purple-500/30'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, collabType: key as keyof typeof COLLAB_TYPES }))}
                        >
                          <CardContent className="p-3 text-center">
                            <TypeIcon className="h-6 w-6 mx-auto text-purple-400 mb-2" />
                            <p className="text-white text-sm font-medium">{type.name}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCollaboration}
                disabled={!formData.title || !formData.description || !formData.collaboratorEmails}
                className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Proposal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaborations List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/20">
          <TabsTrigger value="active" className="data-[state=active]:bg-white/20">
            <Zap className="h-4 w-4 mr-2" />
            Active ({filterCollaborations('active').length})
          </TabsTrigger>
          <TabsTrigger value="proposed" className="data-[state=active]:bg-white/20">
            <Clock className="h-4 w-4 mr-2" />
            Proposed ({filterCollaborations('proposed').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white/20">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed ({filterCollaborations('completed').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-white/20">
            <X className="h-4 w-4 mr-2" />
            Cancelled ({filterCollaborations('cancelled').length})
          </TabsTrigger>
        </TabsList>

        {['active', 'proposed', 'completed', 'cancelled'].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {filterCollaborations(tabValue).length > 0 ? (
              filterCollaborations(tabValue).map((collab) => {
                const collabType = COLLAB_TYPES[collab.collabType];
                const CollabIcon = collabType.icon;
                
                return (
                  <Card key={collab.id} className="glass-card border-white/20 bg-white/5">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${collabType.color} rounded-full flex items-center justify-center`}>
                            <CollabIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">{collab.title}</h3>
                            <p className="text-gray-400 text-sm mb-2">{collab.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(collab.status)}>
                                {collab.status.replace('_', ' ')}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                {collabType.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-400">
                            Proposed: {new Date(collab.timeline.proposedAt).toLocaleDateString()}
                          </p>
                          {collab.timeline.startDate && (
                            <p className="text-sm text-gray-400">
                              Starts: {new Date(collab.timeline.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Collaborators */}
                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-2">Collaborators:</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                              <Crown className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white text-sm">
                              {collab.initiatorId?.artistName || 'You'} (Initiator)
                            </span>
                          </div>
                          {collab.collaboratorIds.map((collaborator, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-white text-sm">
                                {collaborator?.artistName || 'Artist'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      {collab.status === 'proposed' && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleRespondToCollaboration(collab.id, 'accept')}
                            className="gradient-green hover:opacity-90 border-0 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRespondToCollaboration(collab.id, 'reject')}
                            variant="outline"
                            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {collab.status === 'accepted' && (
                        <div className="flex gap-3">
                          <Button
                            className="gradient-blue hover:opacity-90 border-0 text-white"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Open Chat
                          </Button>
                          <Button
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Plan Event
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="glass-card border-white/20 bg-white/5">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No {tabValue} collaborations
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {tabValue === 'active' 
                      ? 'Start collaborating with other artists to unlock new opportunities'
                      : `No ${tabValue} collaborations found`
                    }
                  </p>
                  {tabValue === 'active' && (
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Collaboration
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}