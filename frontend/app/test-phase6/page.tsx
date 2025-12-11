'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  MessageCircle, 
  Sparkles, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function TestPhase6Page() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const updateTestResult = (name: string, status: 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      } else {
        return [...prev, { name, status, message, data }];
      }
    });
  };

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    updateTestResult(testName, 'pending', 'Running...');
    try {
      await testFn();
      updateTestResult(testName, 'success', 'Passed');
    } catch (error: any) {
      updateTestResult(testName, 'error', error.message);
    }
  };

  const testArtistPerks = async () => {
    const response = await apiClient.getArtistPerks();
    if (!response.success) throw new Error('Failed to get artist perks');
    
    const tier = response.artistTier;
    if (!tier) throw new Error('No tier data returned');
    
    updateTestResult('Artist Perks', 'success', `Tier: ${tier.tier}, Score: ${tier.tierScore}`, tier);
  };

  const testGoldenTickets = async () => {
    // Test AP Dhillon model
    const goldenTicketData = {
      name: 'AP Dhillon VIP Experience',
      description: 'Ultimate fan experience with exclusive perks',
      priceMultiplier: 10, // ₹50K tickets
      basePrice: 5000,
      maxQuantity: 500,
      royaltyBonus: 5,
      perks: ['meet_greet', 'backstage', 'vip_seating']
    };

    const response = await apiClient.createGoldenTicketTemplate(goldenTicketData);
    if (!response.success) throw new Error('Failed to create golden ticket');
    
    const revenue = goldenTicketData.maxQuantity * goldenTicketData.basePrice * goldenTicketData.priceMultiplier * 0.9;
    updateTestResult('Golden Tickets', 'success', `Created! Projected: ₹${revenue.toLocaleString()}`, response);
  };

  const testFanMessaging = async () => {
    const messageData = {
      title: 'Free Merch Alert!',
      content: 'First 500 fans at venue get exclusive merchandise - AP Dhillon style!',
      segmentation: {
        type: 'all',
        estimatedReach: 30000
      },
      deliveryChannels: {
        email: true,
        push: true,
        inApp: true
      }
    };

    const response = await apiClient.sendArtistMessage(messageData);
    if (!response.success) throw new Error('Failed to send message');
    
    updateTestResult('Fan Messaging', 'success', `Sent to ${messageData.segmentation.estimatedReach} fans`, response);
  };

  const testNFTCollectibles = async () => {
    const nftData = {
      collectionName: '2024 Tour Memories',
      description: 'Exclusive NFT collection with lifetime royalties',
      totalSupply: 1000,
      basePrice: 5000,
      royaltyPercentage: 15
    };

    const response = await apiClient.createNFTCollectible(nftData);
    if (!response.success) throw new Error('Failed to create NFT collection');
    
    const lifetimeRoyalties = nftData.totalSupply * nftData.basePrice * 2 * (nftData.royaltyPercentage / 100) * 10;
    updateTestResult('NFT Collectibles', 'success', `Created! Lifetime: ₹${lifetimeRoyalties.toLocaleString()}`, response);
  };

  const testCollaborations = async () => {
    const collabData = {
      title: 'Epic Joint Concert',
      description: 'Multi-artist collaboration for massive tour',
      collabType: 'joint_event',
      collaboratorEmails: ['artist2@example.com'],
      revenueShare: [{ email: 'test@example.com', percentage: 50 }]
    };

    const response = await apiClient.createCollaboration(collabData);
    if (!response.success) throw new Error('Failed to create collaboration');
    
    updateTestResult('Collaborations', 'success', 'Collaboration proposal created', response);
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);

    const tests = [
      { name: 'Artist Perks', fn: testArtistPerks },
      { name: 'Golden Tickets', fn: testGoldenTickets },
      { name: 'Fan Messaging', fn: testFanMessaging },
      { name: 'NFT Collectibles', fn: testNFTCollectibles },
      { name: 'Collaborations', fn: testCollaborations }
    ];

    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setTesting(false);
  };

  const calculateAPDhillonMetrics = () => {
    return {
      goldenTickets: 500 * 50000, // ₹2.5 Cr
      tourRoyalties: 4000 * 15000 * 0.15, // ₹90L
      singleResale: 500000 * 0.15, // ₹75K
      lifetimeProjection: 4000 * 15000 * 0.15 * 10 * 1.5 // ₹13.5 Cr
    };
  };

  const metrics = calculateAPDhillonMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Phase 6 Testing Dashboard</h1>
          <p className="text-gray-400 mb-6">
            Test all AP Dhillon success journey features in one place
          </p>
          
          <Button
            onClick={runAllTests}
            disabled={testing}
            className="gradient-purple-cyan hover:opacity-90 border-0 text-white font-bold px-8 py-3"
          >
            {testing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Star className="h-5 w-5 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>

        {/* AP Dhillon Metrics */}
        <Card className="glass-card border-yellow-500/30 bg-yellow-500/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5" />
              AP Dhillon Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-yellow-400">₹{(metrics.goldenTickets / 10000000).toFixed(1)}Cr</p>
                <p className="text-sm text-gray-400">Golden Tickets (11 min)</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">₹{(metrics.tourRoyalties / 1000000).toFixed(0)}L</p>
                <p className="text-sm text-gray-400">Tour Royalties</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">₹{(metrics.singleResale / 1000).toFixed(0)}K</p>
                <p className="text-sm text-gray-400">Single Resale</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">₹{(metrics.lifetimeProjection / 10000000).toFixed(1)}Cr</p>
                <p className="text-sm text-gray-400">Lifetime Projection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Artist Perks', icon: Award, description: 'Tier system and perk unlocking' },
            { name: 'Golden Tickets', icon: Crown, description: '₹2.5 Cr in 11 minutes model' },
            { name: 'Fan Messaging', icon: MessageCircle, description: '30K fans reached instantly' },
            { name: 'NFT Collectibles', icon: Sparkles, description: 'Lifetime royalty streams' },
            { name: 'Collaborations', icon: Users, description: 'Artist-to-artist partnerships' }
          ].map((test) => {
            const result = testResults.find(r => r.name === test.name);
            const TestIcon = test.icon;
            
            return (
              <Card key={test.name} className="glass-card border-white/20 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TestIcon className="h-5 w-5" />
                    {test.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-4">{test.description}</p>
                  
                  {result ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                        {result.status === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
                        {result.status === 'pending' && <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />}
                        
                        <Badge className={`${
                          result.status === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          result.status === 'error' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {result.status}
                        </Badge>
                      </div>
                      
                      <p className="text-white text-sm">{result.message}</p>
                      
                      {result.data && (
                        <details className="text-xs text-gray-400">
                          <summary className="cursor-pointer hover:text-white">View Details</summary>
                          <pre className="mt-2 p-2 bg-black/20 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Not tested yet</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-blue-500/30 bg-blue-500/10">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">View Artist Tools</h3>
              <Button 
                onClick={() => window.location.href = '/artist-tools'}
                className="gradient-blue-cyan hover:opacity-90 border-0 text-white"
              >
                Open Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-purple-500/30 bg-purple-500/10">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Success Journey</h3>
              <Button 
                onClick={() => window.location.href = '/artist-tools?tab=success-journey'}
                className="gradient-purple-pink hover:opacity-90 border-0 text-white"
              >
                View Journey
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/30 bg-green-500/10">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Admin Settings</h3>
              <Button 
                onClick={() => window.location.href = '/admin-settings'}
                className="gradient-green-emerald hover:opacity-90 border-0 text-white"
              >
                Open Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="glass-card border-white/20 bg-white/5 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Prerequisites</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Backend server running on :3001</li>
                  <li>• MongoDB connected</li>
                  <li>• User logged in as artist</li>
                  <li>• Artist verification completed</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">What Gets Tested</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Artist tier calculation</li>
                  <li>• Golden ticket creation (₹50K model)</li>
                  <li>• Fan messaging (30K reach)</li>
                  <li>• NFT collectibles (lifetime royalties)</li>
                  <li>• Collaboration proposals</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
              <p className="text-white font-semibold text-center">
                🎯 This tests the complete AP Dhillon success journey - from verification to ₹5.5+ Cr revenue!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}