'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Instagram, 
  Twitter, 
  Globe, 
  Youtube, 
  Sparkles,
  Star,
  Crown,
  Plus,
  X
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ArtistProfileSetupProps {
  existingProfile?: any;
  onProfileCreated: () => void;
}

const GENRE_OPTIONS = [
  'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Classical', 'Jazz', 'Blues', 'Country',
  'Folk', 'Reggae', 'Punk', 'Metal', 'Alternative', 'Indie', 'R&B', 'Soul',
  'Funk', 'Disco', 'House', 'Techno', 'Trance', 'Dubstep', 'Bollywood',
  'Punjabi', 'Sufi', 'Ghazal', 'Qawwali', 'Devotional'
];

const GOLDEN_TICKET_PERKS = [
  'Meet & Greet Access',
  'Backstage Pass',
  'Exclusive Merchandise',
  'Priority Entry',
  'VIP Seating',
  'Photo Opportunity',
  'Signed Memorabilia',
  'Exclusive Content Access',
  'Direct Artist Messages',
  'Early Event Access',
  'Complimentary Drinks',
  'Dedicated Support'
];

export function ArtistProfileSetup({ existingProfile, onProfileCreated }: ArtistProfileSetupProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    artistName: existingProfile?.artistName || '',
    realName: existingProfile?.realName || '',
    bio: existingProfile?.bio || '',
    genre: existingProfile?.genre || [],
    socialLinks: {
      instagram: existingProfile?.socialLinks?.instagram || '',
      twitter: existingProfile?.socialLinks?.twitter || '',
      youtube: existingProfile?.socialLinks?.youtube || '',
      website: existingProfile?.socialLinks?.website || '',
    },
    goldenTicketPerks: existingProfile?.goldenTicketPerks || [],
    messagingEnabled: existingProfile?.messagingEnabled !== undefined ? existingProfile.messagingEnabled : true
  });

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const handlePerkToggle = (perk: string) => {
    setFormData(prev => ({
      ...prev,
      goldenTicketPerks: prev.goldenTicketPerks.includes(perk)
        ? prev.goldenTicketPerks.filter(p => p !== perk)
        : [...prev.goldenTicketPerks, perk]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.request('/api/artist/profile', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        onProfileCreated();
      } else {
        alert(response.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Music className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            {existingProfile ? 'Update Artist Profile' : 'Become a Verified Artist'}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join the elite tier of creators. Get verified, earn higher royalties (10-25%), 
            create Golden NFT tickets, and message your fans directly.
          </p>
        </div>

        {/* Benefits */}
        {!existingProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-purple-500/30 bg-purple-500/10">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Blue Tick Verification</h3>
                <p className="text-sm text-gray-300">Get verified artist status and stand out from regular organizers</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
              <CardContent className="p-6 text-center">
                <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Golden NFT Tickets</h3>
                <p className="text-sm text-gray-300">Create premium tickets with exclusive perks and higher prices</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-green-500/30 bg-green-500/10">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Higher Royalties</h3>
                <p className="text-sm text-gray-300">Earn 10-25% royalties vs 2-5% for regular organizers</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Form */}
        <Card className="glass-card border-white/20 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Artist Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="artistName" className="text-white">Stage Name *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
                    placeholder="e.g., Prateek Kuhad, Nucleya"
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                  <p className="text-xs text-gray-400">This will appear on your verified profile</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="realName" className="text-white">Legal Name *</Label>
                  <Input
                    id="realName"
                    value={formData.realName}
                    onChange={(e) => setFormData(prev => ({ ...prev, realName: e.target.value }))}
                    placeholder="As per government ID"
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                  <p className="text-xs text-gray-400">Must match your ID document</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Artist Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell your fans about your music journey..."
                  className="bg-white/10 border-white/20 text-white min-h-[100px]"
                />
              </div>

              {/* Genres */}
              <div className="space-y-3">
                <Label className="text-white">Music Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <Badge
                      key={genre}
                      variant={formData.genre.includes(genre) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        formData.genre.includes(genre)
                          ? 'bg-purple-500 text-white border-purple-500'
                          : 'border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social Media Verification Links */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  <Label className="text-white">Social Media Profiles *</Label>
                </div>
                <p className="text-sm text-gray-400">
                  Add your verified social profiles. Artists with 50k+ followers get fast-tracked!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-400" />
                      <Label className="text-gray-300">Instagram *</Label>
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">Required</Badge>
                    </div>
                    <Input
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                      }))}
                      placeholder="https://instagram.com/yourusername"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-400" />
                      <Label className="text-gray-300">YouTube</Label>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Recommended</Badge>
                    </div>
                    <Input
                      value={formData.socialLinks.youtube}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                      }))}
                      placeholder="https://youtube.com/c/yourchannel"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-green-400" />
                      <Label className="text-gray-300">Spotify</Label>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">Recommended</Badge>
                    </div>
                    <Input
                      value={formData.socialLinks.spotify || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, spotify: e.target.value }
                      }))}
                      placeholder="https://open.spotify.com/artist/..."
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-400" />
                      <Label className="text-gray-300">Manager Email</Label>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">Optional</Badge>
                    </div>
                    <Input
                      value={formData.socialLinks.managerEmail || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, managerEmail: e.target.value }
                      }))}
                      placeholder="manager@example.com"
                      className="bg-white/10 border-white/20 text-white"
                      type="email"
                    />
                  </div>
                </div>
              </div>

              {/* Golden Ticket Perks */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <Label className="text-white">Golden Ticket Perks</Label>
                </div>
                <p className="text-sm text-gray-400">
                  Select perks you can offer to Golden Ticket holders (unlocked after verification)
                </p>
                <div className="flex flex-wrap gap-2">
                  {GOLDEN_TICKET_PERKS.map((perk) => (
                    <Badge
                      key={perk}
                      variant={formData.goldenTicketPerks.includes(perk) ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        formData.goldenTicketPerks.includes(perk)
                          ? 'bg-yellow-500 text-black border-yellow-500'
                          : 'border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                      onClick={() => handlePerkToggle(perk)}
                    >
                      {perk}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading || !formData.artistName || !formData.realName}
                  className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-12"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      {existingProfile ? 'Update Profile' : 'Create Artist Profile'}
                      <Sparkles className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}