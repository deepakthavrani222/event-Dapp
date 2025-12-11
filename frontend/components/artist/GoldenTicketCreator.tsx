'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Crown, 
  Sparkles, 
  Star, 
  Gift, 
  Users, 
  DollarSign,
  Award,
  Heart,
  Camera,
  Music,
  Ticket,
  Check,
  Lock,
  Zap,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface GoldenTicketCreatorProps {
  artistId: string;
  canCreateGoldenTickets: boolean;
  verificationStatus: string;
  goldenTicketPerks: string[];
}

const AVAILABLE_PERKS = [
  { id: 'meet_greet', label: 'Meet & Greet Access', icon: Users, description: 'Personal meeting with the artist' },
  { id: 'backstage', label: 'Backstage Pass', icon: Star, description: 'Exclusive backstage access' },
  { id: 'merchandise', label: 'Limited Merchandise', icon: Gift, description: 'Exclusive artist merchandise' },
  { id: 'priority_entry', label: 'Priority Entry', icon: Zap, description: 'Skip the queue with fast entry' },
  { id: 'vip_seating', label: 'VIP Seating', icon: Crown, description: 'Best seats in the house' },
  { id: 'photo_op', label: 'Photo Opportunity', icon: Camera, description: 'Professional photos with artist' },
  { id: 'signed_items', label: 'Signed Memorabilia', icon: Award, description: 'Personally signed items' },
  { id: 'exclusive_content', label: 'Exclusive Content', icon: Music, description: 'Unreleased tracks or videos' },
  { id: 'direct_messages', label: 'Direct Messages', icon: Heart, description: 'Personal messages from artist' },
  { id: 'early_access', label: 'Early Event Access', icon: Ticket, description: 'Enter venue before others' },
  { id: 'complimentary', label: 'Complimentary Items', icon: Sparkles, description: 'Free drinks or food' },
  { id: 'support', label: 'Dedicated Support', icon: Users, description: 'Priority customer support' }
];

const PRICE_MULTIPLIERS = [
  { value: 2, label: '2x Price', description: 'Double the regular ticket price' },
  { value: 3, label: '3x Price', description: 'Triple the regular ticket price' },
  { value: 5, label: '5x Price', description: 'Five times the regular price' },
  { value: 10, label: '10x Price', description: 'Premium luxury experience' }
];

export function GoldenTicketCreator({ 
  canCreateGoldenTickets, 
  verificationStatus,
  goldenTicketPerks 
}: GoldenTicketCreatorProps) {
  const [selectedPerks, setSelectedPerks] = useState<string[]>(goldenTicketPerks || []);
  const [priceMultiplier, setPriceMultiplier] = useState(3);
  const [limitedQuantity, setLimitedQuantity] = useState(true);
  const [maxQuantity, setMaxQuantity] = useState(50);
  const [royaltyBonus, setRoyaltyBonus] = useState(5); // Additional royalty % for golden tickets
  const [isSoulbound, setIsSoulbound] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [goldenTicketTemplate, setGoldenTicketTemplate] = useState({
    name: 'Golden VIP Experience',
    description: 'The ultimate fan experience with exclusive perks and artist access',
    backgroundColor: '#FFD700',
    textColor: '#000000',
    includeNFTArt: true,
    customMessage: ''
  });

  const handlePerkToggle = (perkId: string) => {
    setSelectedPerks(prev => 
      prev.includes(perkId) 
        ? prev.filter(id => id !== perkId)
        : [...prev, perkId]
    );
  };

  const calculateEstimatedRevenue = () => {
    // AP Dhillon model: High-value tickets with premium pricing
    const basePrice = 5000; // Higher base for premium artists
    const goldenPrice = basePrice * priceMultiplier;
    const estimatedSales = Math.min(maxQuantity * 0.9, maxQuantity); // High demand = 90% sell-through
    const totalRevenue = goldenPrice * estimatedSales;
    const artistRoyalty = totalRevenue * ((15 + royaltyBonus) / 100); // Base 15% + bonus
    
    // AP Dhillon scenario calculations for comparison
    const apDhillonExample = {
      ticketPrice: 50000,
      quantity: 500,
      totalRevenue: 50000 * 500, // ₹2.5 crore
      selloutTime: '11 minutes'
    };
    
    return {
      goldenPrice,
      estimatedSales,
      totalRevenue,
      artistRoyalty,
      apDhillonExample
    };
  };

  const revenue = calculateEstimatedRevenue();

  const handleCreateTemplate = async () => {
    if (selectedPerks.length === 0) {
      alert('Please select at least one perk for your Golden Ticket');
      return;
    }

    setCreating(true);
    
    try {
      const templateData = {
        name: goldenTicketTemplate.name,
        description: goldenTicketTemplate.description,
        priceMultiplier,
        basePrice: 2000, // Base price - in real app this would come from event
        maxQuantity: limitedQuantity ? maxQuantity : 1000,
        royaltyBonus,
        perks: selectedPerks,
        isLimited: limitedQuantity,
        isSoulbound,
        backgroundColor: goldenTicketTemplate.backgroundColor,
        textColor: goldenTicketTemplate.textColor,
        customMessage: goldenTicketTemplate.customMessage
      };

      const response = await apiClient.createGoldenTicketTemplate(templateData);
      
      if (response.success) {
        alert('🎉 Golden Ticket Template Created Successfully!\n\nYour premium NFT ticket is now ready. Fans can purchase it for exclusive perks and experiences.');
        
        // Reset form
        setSelectedPerks([]);
        setGoldenTicketTemplate({
          name: 'Golden VIP Experience',
          description: 'The ultimate fan experience with exclusive perks and artist access',
          backgroundColor: '#FFD700',
          textColor: '#000000',
          includeNFTArt: true,
          customMessage: ''
        });
        setPriceMultiplier(3);
        setMaxQuantity(50);
        setRoyaltyBonus(5);
        setIsSoulbound(false);
      } else {
        throw new Error(response.error || 'Failed to create template');
      }
    } catch (error: any) {
      console.error('Failed to create golden ticket template:', error);
      alert(`Failed to create Golden Ticket template: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  // Check if golden tickets are available
  if (verificationStatus !== 'verified') {
    return (
      <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
        <CardContent className="p-8 text-center">
          <Lock className="h-12 w-12 mx-auto text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Verification Required</h3>
          <p className="text-gray-300 mb-4">
            You need to be a verified artist to create Golden NFT tickets.
          </p>
          <Button className="gradient-purple-cyan hover:opacity-90 border-0 text-white">
            Get Verified First
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!canCreateGoldenTickets) {
    return (
      <Card className="glass-card border-red-500/30 bg-red-500/10">
        <CardContent className="p-8 text-center">
          <Crown className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Golden Tickets Not Available</h3>
          <p className="text-gray-300 mb-4">
            Golden ticket creation is not enabled for your account. Contact support for assistance.
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
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Golden NFT Tickets</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Create premium NFT tickets with exclusive perks, higher prices, and enhanced royalties. 
          Turn your most dedicated fans into VIP experiences.
        </p>
      </div>

      {/* AP Dhillon Success Story */}
      <Card className="glass-card border-gradient-to-r from-yellow-500/30 to-orange-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Real Success: AP Dhillon 2025 Tour</h3>
              <p className="text-gray-400 text-sm">How Golden Tickets generated ₹2.5 crores in 11 minutes</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center mb-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-yellow-400">500</p>
              <p className="text-xs text-gray-400">Golden Tickets</p>
              <p className="text-xs text-yellow-300">@ ₹50,000 each</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-green-400">₹2.5 Cr</p>
              <p className="text-xs text-gray-400">Total Revenue</p>
              <p className="text-xs text-green-300">Sold out completely</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-blue-400">11 min</p>
              <p className="text-xs text-gray-400">Sellout Time</p>
              <p className="text-xs text-blue-300">Instant success</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-purple-400">₹3+ Cr</p>
              <p className="text-xs text-gray-400">Resale Royalties</p>
              <p className="text-xs text-purple-300">Ongoing income</p>
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
            <p className="text-white font-semibold text-center">
              🎯 Your Golden Tickets can achieve the same results - premium pricing for premium experiences!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Higher Revenue</h3>
            <p className="text-sm text-gray-300">Charge 2-10x regular ticket prices for premium experiences</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30 bg-purple-500/10">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Enhanced Royalties</h3>
            <p className="text-sm text-gray-300">Earn up to 25% royalties on golden ticket sales</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Fan Loyalty</h3>
            <p className="text-sm text-gray-300">Create deeper connections with exclusive experiences</p>
          </CardContent>
        </Card>
      </div>

      {/* Golden Ticket Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Basic Settings */}
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Golden Ticket Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name and Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketName" className="text-white">Ticket Name</Label>
                  <Input
                    id="ticketName"
                    value={goldenTicketTemplate.name}
                    onChange={(e) => setGoldenTicketTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={goldenTicketTemplate.description}
                    onChange={(e) => setGoldenTicketTemplate(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              {/* Price Multiplier */}
              <div className="space-y-3">
                <Label className="text-white">Price Multiplier</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PRICE_MULTIPLIERS.map((multiplier) => (
                    <Card
                      key={multiplier.value}
                      className={`cursor-pointer transition-all ${
                        priceMultiplier === multiplier.value
                          ? 'border-yellow-500/50 bg-yellow-500/20'
                          : 'border-white/20 bg-white/5 hover:border-yellow-500/30'
                      }`}
                      onClick={() => setPriceMultiplier(multiplier.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold text-white text-sm">{multiplier.label}</h4>
                        <p className="text-xs text-gray-400">{multiplier.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quantity Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">Limited Quantity</Label>
                  <Switch
                    checked={limitedQuantity}
                    onCheckedChange={setLimitedQuantity}
                  />
                </div>

                {limitedQuantity && (
                  <div className="space-y-2">
                    <Label className="text-white">Maximum Quantity: {maxQuantity}</Label>
                    <Slider
                      value={[maxQuantity]}
                      onValueChange={(value) => setMaxQuantity(value[0])}
                      max={200}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400">
                      Scarcity increases demand. Recommended: 20-50 tickets
                    </p>
                  </div>
                )}
              </div>

              {/* Royalty Bonus */}
              <div className="space-y-2">
                <Label className="text-white">Additional Royalty Bonus: +{royaltyBonus}%</Label>
                <Slider
                  value={[royaltyBonus]}
                  onValueChange={(value) => setRoyaltyBonus(value[0])}
                  max={10}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">
                  Total royalty: {15 + royaltyBonus}% (Base 15% + {royaltyBonus}% bonus)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Perks Selection */}
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Exclusive Perks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {AVAILABLE_PERKS.map((perk) => (
                  <div
                    key={perk.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPerks.includes(perk.id)
                        ? 'border-yellow-500/50 bg-yellow-500/20'
                        : 'border-white/20 bg-white/5 hover:border-yellow-500/30'
                    }`}
                    onClick={() => handlePerkToggle(perk.id)}
                  >
                    <div className="flex items-center gap-3">
                      <perk.icon className="h-5 w-5 text-yellow-400" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{perk.label}</h4>
                        <p className="text-xs text-gray-400">{perk.description}</p>
                      </div>
                      {selectedPerks.includes(perk.id) && (
                        <Check className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Analytics */}
        <div className="space-y-6">
          {/* Revenue Projection - AP Dhillon Style */}
          <Card className="glass-card border-green-500/30 bg-green-500/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Your Projection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Golden Ticket Price</p>
                  <p className="text-xl font-bold text-white">₹{revenue.goldenPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Quantity</p>
                  <p className="text-xl font-bold text-white">{maxQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Revenue (90% sold)</p>
                  <p className="text-xl font-bold text-white">₹{revenue.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Your Royalties</p>
                  <p className="text-xl font-bold text-green-400">₹{Math.round(revenue.artistRoyalty).toLocaleString()}</p>
                </div>
              </div>

              {/* AP Dhillon Comparison */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm font-semibold text-white">AP Dhillon Comparison</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-2 bg-yellow-500/20 rounded">
                    <p className="text-yellow-300 font-semibold">AP Dhillon 2025</p>
                    <p className="text-white">₹{revenue.apDhillonExample.totalRevenue.toLocaleString()}</p>
                    <p className="text-gray-400">500 × ₹50,000</p>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded">
                    <p className="text-blue-300 font-semibold">Your Potential</p>
                    <p className="text-white">₹{(maxQuantity * revenue.goldenPrice * 0.9).toLocaleString()}</p>
                    <p className="text-gray-400">{maxQuantity} × ₹{revenue.goldenPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              {/* Royalty Breakdown */}
              <div className="pt-4 border-t border-white/20">
                <p className="text-xs text-gray-400 mb-2">Royalty Breakdown:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base royalty (15%)</span>
                    <span className="text-white">₹{Math.round(revenue.totalRevenue * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Golden bonus ({royaltyBonus}%)</span>
                    <span className="text-green-400">₹{Math.round(revenue.totalRevenue * (royaltyBonus / 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t border-white/10">
                    <span className="text-white">Total ({15 + royaltyBonus}%)</span>
                    <span className="text-green-400">₹{Math.round(revenue.artistRoyalty).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Success Tips */}
              <div className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                <p className="text-white font-semibold text-xs mb-1">💡 Success Tips:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Price high for exclusivity (₹25K-₹50K+)</li>
                  <li>• Limit quantity to create urgency</li>
                  <li>• Include meet & greet for premium feel</li>
                  <li>• Message fans about limited availability</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Golden Ticket Preview */}
          <Card className="glass-card border-yellow-500/30 bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Golden Ticket Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-xl text-black">
                <div className="flex items-center justify-between mb-4">
                  <Crown className="h-8 w-8" />
                  <Badge className="bg-black/20 text-black">NFT</Badge>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{goldenTicketTemplate.name}</h3>
                <p className="text-sm opacity-80 mb-4">{goldenTicketTemplate.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price</span>
                    <span className="font-bold">₹{revenue.goldenPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Perks Included</span>
                    <span className="font-bold">{selectedPerks.length}</span>
                  </div>
                  {limitedQuantity && (
                    <div className="flex justify-between text-sm">
                      <span>Limited Edition</span>
                      <span className="font-bold">#{maxQuantity} only</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Perks Preview */}
              {selectedPerks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-sm">Included Perks:</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedPerks.map((perkId) => {
                      const perk = AVAILABLE_PERKS.find(p => p.id === perkId);
                      return perk ? (
                        <Badge key={perkId} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                          {perk.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Soulbound Option */}
          <Card className="glass-card border-white/20 bg-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white mb-1">Soulbound NFT</h4>
                  <p className="text-sm text-gray-400">Non-transferable tickets for true fans only</p>
                </div>
                <Switch
                  checked={isSoulbound}
                  onCheckedChange={setIsSoulbound}
                />
              </div>
              {isSoulbound && (
                <div className="mt-3 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                  <p className="text-xs text-purple-300">
                    ⚡ Soulbound tickets cannot be resold, ensuring only real fans get access to exclusive experiences.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Button */}
          <Button
            onClick={handleCreateTemplate}
            disabled={selectedPerks.length === 0 || creating}
            className="w-full gradient-yellow-orange hover:opacity-90 border-0 text-black font-bold h-12 text-lg"
          >
            {creating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating Template...
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Create Golden Ticket Template
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}