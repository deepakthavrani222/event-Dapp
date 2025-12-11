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
  Palette, 
  Plus, 
  Star, 
  TrendingUp,
  DollarSign,
  Gem,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Award,
  Crown,
  Zap,
  Target,
  BarChart3,
  Eye,
  Download,
  Share,
  Coins,
  Repeat,
  Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface NFTCollectible {
  id: string;
  collectionName: string;
  description: string;
  totalSupply: number;
  mintedCount: number;
  basePrice: number;
  royaltyPercentage: number;
  metadata: {
    image: string;
    animationUrl?: string;
    attributes: Array<{
      trait_type: string;
      value: string;
      rarity?: number;
    }>;
  };
  rarityTiers: Array<{
    tier: string;
    percentage: number;
    multiplier: number;
  }>;
  salesData: {
    totalSales: number;
    totalRoyalties: number;
    averagePrice: number;
    lastSalePrice: number;
  };
  isActive: boolean;
  launchDate: string;
  eventId?: any;
}

const DEFAULT_RARITY_TIERS = [
  { tier: 'Common', percentage: 60, multiplier: 1 },
  { tier: 'Rare', percentage: 25, multiplier: 2 },
  { tier: 'Epic', percentage: 10, multiplier: 5 },
  { tier: 'Legendary', percentage: 5, multiplier: 10 }
];

const RARITY_COLORS = {
  'Common': 'from-gray-400 to-gray-600',
  'Rare': 'from-blue-400 to-blue-600',
  'Epic': 'from-purple-400 to-purple-600',
  'Legendary': 'from-yellow-400 to-orange-500'
};

export function NFTCollectiblesCreator() {
  const [collectibles, setCollectibles] = useState<NFTCollectible[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    collectionName: '',
    description: '',
    totalSupply: 1000,
    basePrice: 500,
    royaltyPercentage: 10,
    image: '',
    animationUrl: '',
    attributes: [
      { trait_type: 'Artist', value: '', rarity: 100 },
      { trait_type: 'Event', value: '', rarity: 100 },
      { trait_type: 'Year', value: new Date().getFullYear().toString(), rarity: 100 }
    ],
    rarityTiers: DEFAULT_RARITY_TIERS,
    launchDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchCollectibles();
  }, []);

  const fetchCollectibles = async () => {
    try {
      const response = await apiClient.request('/api/artist/nft-collectibles');
      if (response.success) {
        setCollectibles(response.collectibles || []);
      }
    } catch (error) {
      console.error('Failed to fetch NFT collectibles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollectible = async () => {
    if (!formData.collectionName || !formData.description) {
      alert('Please fill in collection name and description');
      return;
    }

    setCreating(true);
    try {
      const response = await apiClient.request('/api/artist/nft-collectibles', {
        method: 'POST',
        body: JSON.stringify({
          collectionName: formData.collectionName,
          description: formData.description,
          totalSupply: formData.totalSupply,
          basePrice: formData.basePrice,
          royaltyPercentage: formData.royaltyPercentage,
          metadata: {
            image: formData.image || '/api/placeholder/400/400',
            animationUrl: formData.animationUrl,
            attributes: formData.attributes.filter(attr => attr.trait_type && attr.value)
          },
          rarityTiers: formData.rarityTiers,
          launchDate: formData.launchDate
        })
      });

      if (response.success) {
        await fetchCollectibles();
        setShowCreateForm(false);
        // Reset form
        setFormData({
          collectionName: '',
          description: '',
          totalSupply: 1000,
          basePrice: 500,
          royaltyPercentage: 10,
          image: '',
          animationUrl: '',
          attributes: [
            { trait_type: 'Artist', value: '', rarity: 100 },
            { trait_type: 'Event', value: '', rarity: 100 },
            { trait_type: 'Year', value: new Date().getFullYear().toString(), rarity: 100 }
          ],
          rarityTiers: DEFAULT_RARITY_TIERS,
          launchDate: new Date().toISOString().split('T')[0]
        });
        alert('🎉 NFT Collection created successfully! Your past tickets are now valuable collectibles.');
      }
    } catch (error: any) {
      console.error('Failed to create NFT collectible:', error);
      alert(`Failed to create NFT collection: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '', rarity: 100 }]
    }));
  };

  const updateAttribute = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalRoyalties = () => {
    return collectibles.reduce((total, collectible) => total + collectible.salesData.totalRoyalties, 0);
  };

  const calculateTotalSales = () => {
    return collectibles.reduce((total, collectible) => total + collectible.salesData.totalSales, 0);
  };

  const calculateLifetimeRoyaltyProjection = () => {
    // Based on AP Dhillon example: ₹5L resale → ₹75K royalty (15%)
    // Assume 30% of tickets get resold annually at 2x average price
    const totalTickets = collectibles.reduce((sum, c) => sum + c.mintedCount, 0);
    const avgPrice = collectibles.reduce((sum, c) => sum + c.basePrice, 0) / Math.max(collectibles.length, 1);
    const avgRoyalty = collectibles.reduce((sum, c) => sum + c.royaltyPercentage, 0) / Math.max(collectibles.length, 1);
    
    // Conservative projection: 30% resale rate, 2x price appreciation annually
    const annualResales = totalTickets * 0.3;
    const avgResalePrice = avgPrice * 2;
    const annualRoyalties = annualResales * avgResalePrice * (avgRoyalty / 100);
    
    return {
      annual: annualRoyalties,
      fiveYear: annualRoyalties * 5 * 1.2, // 20% compound growth
      lifetime: annualRoyalties * 10 * 1.5 // 10 years with 50% total growth
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-white/10 rounded-xl"></div>
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
          <Palette className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">NFT Collectibles</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Transform your past tickets into valuable NFT collectibles. Create continuous royalty streams 
          that generate income long after your events end.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-green-500/30 bg-green-500/10">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">₹{calculateTotalRoyalties().toLocaleString()}</p>
            <p className="text-sm text-gray-400">Earned Royalties</p>
            <p className="text-xs text-green-300 mt-1">
              +₹{calculateLifetimeRoyaltyProjection().annual.toLocaleString()}/year projected
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">{calculateTotalSales().toLocaleString()}</p>
            <p className="text-sm text-gray-400">NFTs Minted</p>
            <p className="text-xs text-blue-300 mt-1">
              {collectibles.reduce((sum, c) => sum + c.totalSupply - c.mintedCount, 0).toLocaleString()} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30 bg-purple-500/10">
          <CardContent className="p-6 text-center">
            <Gem className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">{collectibles.length}</p>
            <p className="text-sm text-gray-400">Collections</p>
            <p className="text-xs text-purple-300 mt-1">
              {collectibles.filter(c => c.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="p-6 text-center">
            <Repeat className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <p className="text-2xl font-bold text-white">
              ₹{calculateLifetimeRoyaltyProjection().lifetime.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Lifetime Projection</p>
            <p className="text-xs text-yellow-300 mt-1">
              10-year royalty estimate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AP Dhillon Success Story Example */}
      <Card className="glass-card border-gradient-to-r from-yellow-500/30 to-orange-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Success Story: AP Dhillon Model</h3>
              <p className="text-gray-400 text-sm">How top artists generate crores in continuous royalties</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-yellow-400">₹2.5 Cr</p>
              <p className="text-xs text-gray-400">Initial Golden Ticket Sales</p>
              <p className="text-xs text-yellow-300">500 tickets @ ₹50K each</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-green-400">₹3+ Cr</p>
              <p className="text-xs text-gray-400">Tour Resale Royalties</p>
              <p className="text-xs text-green-300">4000+ resales @ 15% royalty</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-blue-400">₹75K</p>
              <p className="text-xs text-gray-400">Single Ticket Royalty</p>
              <p className="text-xs text-blue-300">₹5L resale → ₹75K earned</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-lg font-bold text-purple-400">∞</p>
              <p className="text-xs text-gray-400">Lifetime Income</p>
              <p className="text-xs text-purple-300">Royalties never stop</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
            <p className="text-white font-semibold text-center">
              🎯 Your NFT collections work the same way - every resale generates royalties forever!
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="collections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/20">
          <TabsTrigger value="collections" className="data-[state=active]:bg-white/20">
            <Gem className="h-4 w-4 mr-2" />
            My Collections
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-white/20">
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </TabsTrigger>
        </TabsList>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-6">
          {collectibles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collectibles.map((collectible) => (
                <Card key={collectible.id} className="glass-card border-white/20 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Palette className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{collectible.collectionName}</h3>
                        <p className="text-gray-400 text-sm mb-2">{collectible.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            collectible.isActive 
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }`}>
                            {collectible.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                            {collectible.royaltyPercentage}% Royalty
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Supply Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm">Minted Progress</span>
                        <span className="text-gray-400 text-sm">
                          {collectible.mintedCount} / {collectible.totalSupply}
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(collectible.mintedCount / collectible.totalSupply) * 100}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Rarity Tiers */}
                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2">Rarity Tiers</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {collectible.rarityTiers.map((tier, index) => (
                          <div key={index} className={`p-2 rounded bg-gradient-to-r ${
                            RARITY_COLORS[tier.tier as keyof typeof RARITY_COLORS] || 'from-gray-400 to-gray-600'
                          } bg-opacity-20`}>
                            <div className="flex items-center justify-between">
                              <span className="text-white text-xs font-medium">{tier.tier}</span>
                              <span className="text-white text-xs">{tier.percentage}%</span>
                            </div>
                            <p className="text-xs text-gray-300">{tier.multiplier}x price</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sales Data */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-green-400">
                          ₹{collectible.salesData.totalRoyalties.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Royalties Earned</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-400">
                          ₹{collectible.salesData.averagePrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Avg Price</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        <Share className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card border-white/20 bg-white/5">
              <CardContent className="p-8 text-center">
                <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No NFT Collections Yet</h3>
                <p className="text-gray-400 mb-4">
                  Create your first NFT collection to turn your past tickets into valuable collectibles 
                  with continuous royalty streams.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="gradient-purple-pink hover:opacity-90 border-0 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Collection
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create Collection Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card className="glass-card border-purple-500/30 bg-purple-500/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Create NFT Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Collection Name *</Label>
                    <Input
                      value={formData.collectionName}
                      onChange={(e) => setFormData(prev => ({ ...prev, collectionName: e.target.value }))}
                      placeholder="Badshah Concert Series 2024"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Description *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Exclusive NFT collection from my 2024 concert series..."
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Total Supply</Label>
                      <Input
                        type="number"
                        value={formData.totalSupply}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: parseInt(e.target.value) || 1000 }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Base Price (₹)</Label>
                      <Input
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseInt(e.target.value) || 500 }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Royalty Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="25"
                      value={formData.royaltyPercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercentage: parseInt(e.target.value) || 10 }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      You'll earn {formData.royaltyPercentage}% on every future resale
                    </p>
                  </div>
                </div>

                {/* Attributes & Rarity */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">NFT Attributes</Label>
                    <div className="space-y-2">
                      {formData.attributes.map((attr, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Trait type"
                            value={attr.trait_type}
                            onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                          <Input
                            placeholder="Value"
                            value={attr.value}
                            onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                            className="bg-white/10 border-white/20 text-white"
                          />
                          <Button
                            onClick={() => removeAttribute(index)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        onClick={addAttribute}
                        size="sm"
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Attribute
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Rarity Tiers</Label>
                    <div className="space-y-2">
                      {formData.rarityTiers.map((tier, index) => (
                        <div key={index} className={`p-3 rounded bg-gradient-to-r ${
                          RARITY_COLORS[tier.tier as keyof typeof RARITY_COLORS] || 'from-gray-400 to-gray-600'
                        } bg-opacity-20`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{tier.tier}</span>
                            <Badge className="bg-white/20 text-white">
                              {tier.percentage}% supply
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300">
                            {tier.multiplier}x base price (₹{(formData.basePrice * tier.multiplier).toLocaleString()})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Launch Date</Label>
                    <Input
                      type="date"
                      value={formData.launchDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, launchDate: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Revenue Projection - AP Dhillon Style */}
              <Card className="glass-card border-green-500/30 bg-green-500/10">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Revenue Projection (AP Dhillon Model)
                  </h4>
                  
                  {/* Timeline Projection */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-white text-sm">Initial Collection Sales</span>
                      <span className="text-green-400 font-bold">
                        ₹{(formData.totalSupply * formData.basePrice * 1.5).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-white text-sm">Year 1 Resale Royalties (30% resold @ 2x)</span>
                      <span className="text-blue-400 font-bold">
                        ₹{(formData.totalSupply * 0.3 * formData.basePrice * 2 * formData.royaltyPercentage / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <span className="text-white text-sm">5-Year Cumulative Royalties</span>
                      <span className="text-purple-400 font-bold">
                        ₹{(formData.totalSupply * 0.3 * formData.basePrice * 2 * formData.royaltyPercentage / 100 * 5 * 1.2).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded border border-yellow-500/30">
                      <span className="text-white text-sm font-semibold">Lifetime Royalty Potential</span>
                      <span className="text-yellow-400 font-bold text-lg">
                        ₹{(formData.totalSupply * 0.3 * formData.basePrice * 2 * formData.royaltyPercentage / 100 * 10 * 1.5).toLocaleString()}+
                      </span>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <h5 className="text-blue-300 font-semibold text-sm mb-1">High-Value Resales</h5>
                      <p className="text-xs text-gray-300">
                        Single ticket: ₹{formData.basePrice.toLocaleString()} → ₹{(formData.basePrice * 10).toLocaleString()} 
                        = ₹{(formData.basePrice * 10 * formData.royaltyPercentage / 100).toLocaleString()} royalty
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <h5 className="text-green-300 font-semibold text-sm mb-1">Passive Income</h5>
                      <p className="text-xs text-gray-300">
                        {formData.royaltyPercentage}% royalty on every resale, forever. 
                        No work required after creation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleCreateCollectible}
                disabled={creating || !formData.collectionName || !formData.description}
                className="w-full gradient-purple-pink hover:opacity-90 border-0 text-white font-bold h-12"
              >
                {creating ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Creating Collection...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create NFT Collection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}