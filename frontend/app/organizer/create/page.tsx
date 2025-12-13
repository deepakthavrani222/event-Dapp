'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Trash2, ArrowLeft, Loader2, Check, ChevronRight, ChevronLeft, 
  Save, Percent, Info, Calendar, Clock, MapPin, Image as ImageIcon,
  Ticket, DollarSign, Users, Link2, Share2, Eye, AlertCircle,
  Lock, Sparkles, Globe, Tag, Gift, Calculator
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { motion, AnimatePresence } from 'framer-motion';

// 4-step wizard as per Phase 2 requirements
const STEPS = [
  { id: 1, title: 'Event Details', description: 'Name, date, venue & banner', icon: Calendar },
  { id: 2, title: 'Ticket Setup', description: 'Types, pricing & Web3 options', icon: Ticket },
  { id: 3, title: 'Promotion', description: 'Categories, referrals & fees', icon: Share2 },
  { id: 4, title: 'Review & Submit', description: 'Preview and publish', icon: Eye },
];

// Categories for better search visibility
const CATEGORIES = [
  { value: 'Music', label: '🎵 Music', icon: '🎵' },
  { value: 'Sports', label: '⚽ Sports', icon: '⚽' },
  { value: 'Comedy', label: '😄 Comedy', icon: '😄' },
  { value: 'Theater', label: '🎭 Theater', icon: '🎭' },
  { value: 'Festival', label: '🎪 Festival', icon: '🎪' },
  { value: 'Conference', label: '💼 Conference', icon: '💼' },
  { value: 'Workshop', label: '🎓 Workshop', icon: '🎓' },
  { value: 'Networking', label: '🤝 Networking', icon: '🤝' },
  { value: 'Exhibition', label: '🖼️ Exhibition', icon: '🖼️' },
  { value: 'Other', label: '📋 Other', icon: '📋' },
];

// Popular tags
const POPULAR_TAGS = [
  'Live Music', 'DJ Night', 'Stand-up', 'Tech', 'Startup', 'Art', 
  'Food', 'Outdoor', 'Family', 'Nightlife', 'Corporate', 'Charity'
];

// Registered venues (mock - would come from API)
const REGISTERED_VENUES = [
  { id: '1', name: 'Mumbai Arena', city: 'Mumbai', address: 'Andheri West', fee: 2 },
  { id: '2', name: 'Delhi Convention Center', city: 'Delhi', address: 'Connaught Place', fee: 2 },
  { id: '3', name: 'Bangalore Tech Park', city: 'Bangalore', address: 'Whitefield', fee: 1.5 },
  { id: '4', name: 'Chennai Trade Centre', city: 'Chennai', address: 'Nandambakkam', fee: 2 },
];

export default function CreateEventPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Step 1: Event Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [venueType, setVenueType] = useState<'registered' | 'custom'>('custom');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');

  // Step 2: Ticket Setup
  const [ticketTypes, setTicketTypes] = useState([
    {
      id: '1',
      name: 'General Admission',
      description: 'Standard event access',
      price: 500,
      priceInput: '500',
      totalSupply: 100,
      maxPerWallet: 4,
      pricingType: 'fixed' as 'fixed' | 'dynamic',
      earlyBirdPrice: 0,
      earlyBirdEndDate: '',
    }
  ]);
  
  // Web3 Options
  const [enableResale, setEnableResale] = useState(true);
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5);
  const [maxPerBuyer, setMaxPerBuyer] = useState(4);
  const [maxResalePrice, setMaxResalePrice] = useState(120);
  const [enableResaleCap, setEnableResaleCap] = useState(true);
  const [soulboundMode, setSoulboundMode] = useState(false);

  // Step 3: Promotion & Settings
  const [category, setCategory] = useState('Music');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [enableReferrals, setEnableReferrals] = useState(false);
  const [referralCommission, setReferralCommission] = useState(5);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [socialLinks, setSocialLinks] = useState({ instagram: '', twitter: '', facebook: '' });

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Calculate venue fee
  const venueFee = venueType === 'registered' && selectedVenue 
    ? REGISTERED_VENUES.find(v => v.id === selectedVenue)?.fee || 0 
    : 0;
  const platformFee = 3;
  const organizerEarnings = 100 - platformFee - venueFee;

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Auto-detect timezone
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // Auto-save to localStorage
  const saveToLocalStorage = useCallback(() => {
    const draftData = {
      title, description, date, time, timezone, venueType, selectedVenue, venue, city, location, 
      image, imagePublicId, ticketTypes, enableResale, royaltyPercentage, maxPerBuyer, 
      maxResalePrice, enableResaleCap, soulboundMode, category, tags, enableReferrals, 
      referralCommission, websiteUrl, socialLinks, currentStep,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('event_draft_v2', JSON.stringify(draftData));
    setLastSaved(new Date());
    setIsSaving(false);
  }, [title, description, date, time, timezone, venueType, selectedVenue, venue, city, location, 
      image, imagePublicId, ticketTypes, enableResale, royaltyPercentage, maxPerBuyer, 
      maxResalePrice, enableResaleCap, soulboundMode, category, tags, enableReferrals, 
      referralCommission, websiteUrl, socialLinks, currentStep]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('event_draft_v2');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const savedTime = new Date(draft.savedAt);
        const hoursSinceSave = (Date.now() - savedTime.getTime()) / (1000 * 60 * 60);
        if (hoursSinceSave < 24) {
          setHasDraft(true);
        } else {
          localStorage.removeItem('event_draft_v2');
        }
      } catch (e) {
        localStorage.removeItem('event_draft_v2');
      }
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!title && !description) return;
    const autoSaveInterval = setInterval(() => {
      setIsSaving(true);
      saveToLocalStorage();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [title, description, saveToLocalStorage]);

  // Restore draft
  const restoreDraft = () => {
    const savedDraft = localStorage.getItem('event_draft_v2');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setDescription(draft.description || '');
        setDate(draft.date || '');
        setTime(draft.time || '');
        setTimezone(draft.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        setVenueType(draft.venueType || 'custom');
        setSelectedVenue(draft.selectedVenue || '');
        setVenue(draft.venue || '');
        setCity(draft.city || '');
        setLocation(draft.location || '');
        setImage(draft.image || '');
        setImagePublicId(draft.imagePublicId || '');
        setTicketTypes(draft.ticketTypes || [{ id: '1', name: 'General Admission', description: 'Standard event access', price: 500, totalSupply: 100, maxPerWallet: 4, pricingType: 'fixed', earlyBirdPrice: 0, earlyBirdEndDate: '' }]);
        setEnableResale(draft.enableResale !== false);
        setRoyaltyPercentage(draft.royaltyPercentage || 5);
        setMaxPerBuyer(draft.maxPerBuyer || 4);
        setMaxResalePrice(draft.maxResalePrice || 120);
        setEnableResaleCap(draft.enableResaleCap !== false);
        setSoulboundMode(draft.soulboundMode || false);
        setCategory(draft.category || 'Music');
        setTags(draft.tags || []);
        setEnableReferrals(draft.enableReferrals || false);
        setReferralCommission(draft.referralCommission || 5);
        setWebsiteUrl(draft.websiteUrl || '');
        setSocialLinks(draft.socialLinks || { instagram: '', twitter: '', facebook: '' });
        setCurrentStep(draft.currentStep || 1);
        setHasDraft(false);
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('event_draft_v2');
    setHasDraft(false);
  };

  // Real-time validation
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'title':
        if (!value) return 'Event title is required';
        if (value.length < 5) return 'Title must be at least 5 characters';
        return '';
      case 'description':
        if (!value) return 'Description is required';
        if (value.length < 20) return 'Description must be at least 20 characters';
        return '';
      case 'date':
        if (!value) return 'Date is required';
        if (new Date(value) <= new Date()) return 'Date must be in the future';
        return '';
      case 'time':
        if (!value) return 'Time is required';
        return '';
      case 'venue':
        if (venueType === 'custom' && !value) return 'Venue name is required';
        return '';
      case 'city':
        if (venueType === 'custom' && !value) return 'City is required';
        return '';
      default:
        return '';
    }
  };

  // Handle field change with validation
  const handleFieldChange = (field: string, value: any, setter: (v: any) => void) => {
    setter(value);
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const venueValid = venueType === 'registered' ? !!selectedVenue : !!(venue && city && location);
        return !!(title && description && date && time && image && venueValid);
      case 2:
        return ticketTypes.length > 0 && ticketTypes.every(t => t.name && t.price > 0 && t.totalSupply > 0);
      case 3:
        return !!category;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else if (!validateStep(currentStep)) {
      setError('Please fill in all required fields before continuing');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  // Add tag
  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setCustomTag('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Calculate totals
  const totalTickets = ticketTypes.reduce((sum, t) => sum + (t.totalSupply || 0), 0);
  const totalRevenue = ticketTypes.reduce((sum, t) => sum + ((t.price || 0) * (t.totalSupply || 0)), 0);
  const organizerRevenue = Math.round(totalRevenue * (organizerEarnings / 100));

  // Submit event
  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (!isAuthenticated) {
        setError('Please login to create an event');
        router.push('/login');
        return;
      }

      // Get venue details
      let finalVenue = venue;
      let finalCity = city;
      let finalLocation = location;
      
      if (venueType === 'registered' && selectedVenue) {
        const venueData = REGISTERED_VENUES.find(v => v.id === selectedVenue);
        if (venueData) {
          finalVenue = venueData.name;
          finalCity = venueData.city;
          finalLocation = venueData.address;
        }
      }

      const eventData = {
        title,
        description,
        category,
        venue: finalVenue,
        city: finalCity,
        location: finalLocation,
        image,
        imagePublicId,
        date,
        time,
        timezone,
        ticketTypes: ticketTypes.map(t => ({
          name: t.name,
          description: t.description,
          price: t.price,
          totalSupply: t.totalSupply,
          maxPerWallet: maxPerBuyer,
          pricingType: t.pricingType,
          earlyBirdPrice: t.earlyBirdPrice,
          earlyBirdEndDate: t.earlyBirdEndDate,
        })),
        royaltySettings: {
          enableResale: !soulboundMode && enableResale,
          royaltyPercentage,
          maxResalePrice: enableResaleCap ? maxResalePrice : 300,
          soulbound: soulboundMode,
        },
        promotionSettings: {
          tags,
          enableReferrals,
          referralCommission: enableReferrals ? referralCommission : 0,
          websiteUrl,
          socialLinks,
        },
        venueFee,
      };

      const response = await apiClient.createEvent(eventData);

      if (response.success) {
        localStorage.removeItem('event_draft_v2');
        
        // Check if auto-approved (small events < 100 tickets)
        const isAutoApproved = totalTickets < 100;
        
        router.push(`/organizer?created=true&autoApproved=${isAutoApproved}`);
      } else {
        setError(response.error || 'Failed to create event');
      }
    } catch (err: any) {
      console.error('Event creation error:', err);
      if (err.message?.includes('No token') || err.message?.includes('Unauthorized')) {
        setError('Session expired. Please login again.');
        router.push('/login');
      } else {
        setError(err.message || 'Failed to create event. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please login to create events</p>
          <Button onClick={() => router.push('/login')} className="gradient-purple-cyan">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {lastSaved && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Save className="h-3 w-3" />
              {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
            </span>
          )}
        </div>

        {/* Draft Restore Banner */}
        {hasDraft && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Save className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Unsaved draft found</p>
                <p className="text-sm text-gray-400">Continue where you left off?</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearDraft} className="text-gray-400">
                Start Fresh
              </Button>
              <Button size="sm" onClick={restoreDraft} className="gradient-purple-cyan border-0">
                Restore
              </Button>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all
                    ${currentStep >= step.id 
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}>
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-2 ${currentStep >= step.id ? 'text-white' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.id ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="glass-card border-white/20 bg-gray-900/95 backdrop-blur-xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">

              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Event Title */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold">Event Title *</Label>
                    <Input
                      value={title}
                      onChange={(e) => handleFieldChange('title', e.target.value, setTitle)}
                      placeholder="Rock Concert 2025"
                      className={`h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 ${validationErrors.title ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.title && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {validationErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Description with rich text hint */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold">Description *</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => handleFieldChange('description', e.target.value, setDescription)}
                      placeholder="Describe your event... What can attendees expect? Use **bold** and *italics* for formatting."
                      rows={4}
                      className={`bg-white/5 border-white/20 text-white placeholder:text-gray-400 ${validationErrors.description ? 'border-red-500' : ''}`}
                    />
                    <p className="text-xs text-gray-400">Supports basic formatting: **bold**, *italic*, [links](url)</p>
                    {validationErrors.description && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {validationErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Date, Time, Timezone */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-400" /> Date *
                      </Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => handleFieldChange('date', e.target.value, setDate)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`h-12 bg-white/5 border-white/20 text-white ${validationErrors.date ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.date && (
                        <p className="text-xs text-red-400">{validationErrors.date}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-cyan-400" /> Time *
                      </Label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => handleFieldChange('time', e.target.value, setTime)}
                        className="h-12 bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white font-semibold flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-400" /> Timezone
                      </Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="h-12 bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          <SelectItem value="Asia/Kolkata" className="text-white">IST (India)</SelectItem>
                          <SelectItem value="America/New_York" className="text-white">EST (New York)</SelectItem>
                          <SelectItem value="America/Los_Angeles" className="text-white">PST (Los Angeles)</SelectItem>
                          <SelectItem value="Europe/London" className="text-white">GMT (London)</SelectItem>
                          <SelectItem value="Asia/Dubai" className="text-white">GST (Dubai)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Venue Selection */}
                  <div className="space-y-4">
                    <Label className="text-white font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-400" /> Venue *
                    </Label>
                    
                    {/* Venue Type Toggle */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setVenueType('registered')}
                        className={`flex-1 p-3 rounded-lg border transition-all ${
                          venueType === 'registered' 
                            ? 'border-purple-500 bg-purple-500/20 text-white' 
                            : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="font-medium">Registered Venue</span>
                        <p className="text-xs mt-1 opacity-70">Partner venues with shared fees</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVenueType('custom')}
                        className={`flex-1 p-3 rounded-lg border transition-all ${
                          venueType === 'custom' 
                            ? 'border-purple-500 bg-purple-500/20 text-white' 
                            : 'border-white/20 bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="font-medium">Custom Venue</span>
                        <p className="text-xs mt-1 opacity-70">Add your own location</p>
                      </button>
                    </div>

                    {venueType === 'registered' ? (
                      <div className="space-y-2">
                        <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                          <SelectTrigger className="h-12 bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Search registered venues..." />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-white/20">
                            {REGISTERED_VENUES.map(v => (
                              <SelectItem key={v.id} value={v.id} className="text-white">
                                <div className="flex items-center justify-between w-full">
                                  <span>{v.name} - {v.city}</span>
                                  <span className="text-xs text-yellow-400 ml-2">Fee: {v.fee}%</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedVenue && (
                          <p className="text-xs text-yellow-400 flex items-center gap-1">
                            <Info className="h-3 w-3" /> Venue fee: {venueFee}% (shared with venue owner)
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Input
                            value={venue}
                            onChange={(e) => handleFieldChange('venue', e.target.value, setVenue)}
                            placeholder="Venue name"
                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            value={city}
                            onChange={(e) => handleFieldChange('city', e.target.value, setCity)}
                            placeholder="City"
                            className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Textarea
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Full address"
                            rows={2}
                            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Banner */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-pink-400" /> Event Banner *
                    </Label>
                    {image ? (
                      <div className="relative group">
                        <img src={image} alt="Event banner" className="w-full h-40 object-cover rounded-lg border border-white/20" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button variant="destructive" size="sm" onClick={() => { setImage(''); setImagePublicId(''); }}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 border-2 border-dashed border-white/20 rounded-lg bg-white/5 overflow-hidden hover:bg-white/10 transition-colors">
                        <ImageUpload
                          value={image}
                          onChange={(url, publicId) => { setImage(url); setImagePublicId(publicId || ''); }}
                          onRemove={() => { setImage(''); setImagePublicId(''); }}
                          type="event"
                          className="h-full"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400">Drag & drop or click to upload. Recommended: 1920x1080px, auto-optimized.</p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Ticket Setup */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Ticket Types */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white font-semibold text-lg">Ticket Types</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTicketTypes([...ticketTypes, {
                            id: Date.now().toString(),
                            name: '',
                            description: '',
                            price: 0,
                            priceInput: '',
                            totalSupply: 0,
                            maxPerWallet: 4,
                            pricingType: 'fixed',
                            earlyBirdPrice: 0,
                            earlyBirdEndDate: '',
                          }]);
                        }}
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Type
                      </Button>
                    </div>

                    {ticketTypes.map((ticket, index) => (
                      <div key={ticket.id} className="border border-white/20 rounded-lg p-4 space-y-4 bg-white/5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-purple-400" />
                            {ticket.name || `Ticket Type ${index + 1}`}
                          </span>
                          {ticketTypes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== index))}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Name *</Label>
                            <Input
                              value={ticket.name}
                              onChange={(e) => {
                                const updated = [...ticketTypes];
                                updated[index].name = e.target.value;
                                setTicketTypes(updated);
                              }}
                              placeholder="VIP, General, etc."
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Quantity *</Label>
                            <Input
                              type="number"
                              value={ticket.totalSupply || ''}
                              onChange={(e) => {
                                const updated = [...ticketTypes];
                                updated[index].totalSupply = parseInt(e.target.value) || 0;
                                setTicketTypes(updated);
                              }}
                              placeholder="100"
                              min="1"
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Price (₹) *</Label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={ticket.priceInput ?? ticket.price ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                // Allow empty, numbers, and decimals only
                                if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                  const updated = [...ticketTypes];
                                  updated[index].priceInput = val;
                                  updated[index].price = val === '' ? 0 : (parseFloat(val) || 0);
                                  setTicketTypes(updated);
                                }
                              }}
                              placeholder="Enter any price (e.g., 0.0000000001)"
                              className="bg-white/5 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Pricing Type</Label>
                            <Select 
                              value={ticket.pricingType} 
                              onValueChange={(v: 'fixed' | 'dynamic') => {
                                const updated = [...ticketTypes];
                                updated[index].pricingType = v;
                                setTicketTypes(updated);
                              }}
                            >
                              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-white/20">
                                <SelectItem value="fixed" className="text-white">Fixed Price</SelectItem>
                                <SelectItem value="dynamic" className="text-white">Early Bird</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {ticket.pricingType === 'dynamic' && (
                          <div className="grid grid-cols-2 gap-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="space-y-2">
                              <Label className="text-sm text-yellow-300">Early Bird Price (₹)</Label>
                              <Input
                                type="number"
                                value={ticket.earlyBirdPrice || ''}
                                onChange={(e) => {
                                  const updated = [...ticketTypes];
                                  updated[index].earlyBirdPrice = parseInt(e.target.value) || 0;
                                  setTicketTypes(updated);
                                }}
                                placeholder="400"
                                className="bg-white/5 border-white/20 text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm text-yellow-300">Early Bird Ends</Label>
                              <Input
                                type="date"
                                value={ticket.earlyBirdEndDate}
                                onChange={(e) => {
                                  const updated = [...ticketTypes];
                                  updated[index].earlyBirdEndDate = e.target.value;
                                  setTicketTypes(updated);
                                }}
                                className="bg-white/5 border-white/20 text-white"
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-sm text-gray-300">Description</Label>
                          <Textarea
                            value={ticket.description}
                            onChange={(e) => {
                              const updated = [...ticketTypes];
                              updated[index].description = e.target.value;
                              setTicketTypes(updated);
                            }}
                            placeholder="What's included..."
                            rows={2}
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Web3 Options */}
                  <div className="border border-purple-500/30 rounded-lg p-5 bg-purple-500/10 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Sparkles className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Web3 Options</h4>
                        <p className="text-sm text-gray-400">Blockchain-powered features (defaults for ease)</p>
                      </div>
                    </div>

                    {/* Anti-Scalping: Max per buyer */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-cyan-400" />
                        <div>
                          <p className="font-medium text-white">Limit per Buyer</p>
                          <p className="text-xs text-gray-400">Anti-scalping: Prevent bulk buying</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={maxPerBuyer}
                          onChange={(e) => setMaxPerBuyer(parseInt(e.target.value) || 4)}
                          min="1"
                          max="20"
                          className="w-20 h-9 bg-white/10 border-white/20 text-white text-center"
                        />
                        <span className="text-sm text-gray-400">tickets</span>
                      </div>
                    </div>

                    {/* Soulbound Mode */}
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="font-medium text-white">Soulbound Mode</p>
                          <p className="text-xs text-gray-400">Non-resellable (exclusive events)</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSoulboundMode(!soulboundMode)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${soulboundMode ? 'bg-red-500' : 'bg-gray-600'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${soulboundMode ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {!soulboundMode && (
                      <>
                        {/* Resale Toggle */}
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-green-400" />
                            <div>
                              <p className="font-medium text-white">Allow Resale</p>
                              <p className="text-xs text-gray-400">Earn royalties on every resale</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnableResale(!enableResale)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${enableResale ? 'bg-green-500' : 'bg-gray-600'}`}
                          >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enableResale ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>

                        {enableResale && (
                          <>
                            {/* Royalty Slider */}
                            <div className="space-y-3 p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Percent className="h-4 w-4 text-purple-400" />
                                  <span className="text-white font-medium">Your Royalty</span>
                                </div>
                                <span className="text-2xl font-bold text-purple-400">{royaltyPercentage}%</span>
                              </div>
                              <input
                                type="range"
                                min="2"
                                max="10"
                                step="1"
                                value={royaltyPercentage}
                                onChange={(e) => setRoyaltyPercentage(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                              <div className="flex justify-between text-xs text-gray-400">
                                <span>2%</span>
                                <span>5% (Default)</span>
                                <span>10%</span>
                              </div>
                              <p className="text-xs text-green-400">💰 Earn {royaltyPercentage}% on every resale forever!</p>
                            </div>

                            {/* Resale Price Cap */}
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Calculator className="h-5 w-5 text-yellow-400" />
                                <div>
                                  <p className="font-medium text-white">Cap Resale Price</p>
                                  <p className="text-xs text-gray-400">Anti-scalping protection</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEnableResaleCap(!enableResaleCap)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${enableResaleCap ? 'bg-yellow-500' : 'bg-gray-600'}`}
                              >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enableResaleCap ? 'left-7' : 'left-1'}`} />
                              </button>
                            </div>

                            {enableResaleCap && (
                              <div className="space-y-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-white font-medium">Max Resale Price</span>
                                  <span className="text-lg font-bold text-yellow-400">+{maxResalePrice - 100}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="100"
                                  max="200"
                                  step="10"
                                  value={maxResalePrice}
                                  onChange={(e) => setMaxResalePrice(parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                  <span>Face value</span>
                                  <span>+20% (Default)</span>
                                  <span>+100%</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    {/* NFT Preview */}
                    <div className="p-4 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-lg">
                      <p className="text-sm text-gray-300 mb-3">🎫 Mock Ticket NFT Preview</p>
                      <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <Ticket className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{title || 'Your Event'}</p>
                          <p className="text-sm text-gray-400">{ticketTypes[0]?.name || 'General Admission'}</p>
                          <p className="text-xs text-purple-400">NFT #{Math.floor(Math.random() * 1000)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}


              {/* Step 3: Promotion & Settings */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-white font-semibold">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20">
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value} className="text-white">
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <Label className="text-white font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4 text-cyan-400" /> Tags (for better search visibility)
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            tags.includes(tag)
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Add custom tag..."
                        className="bg-white/5 border-white/20 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(customTag))}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addTag(customTag)}
                        disabled={!customTag || tags.length >= 5}
                        className="border-white/20"
                      >
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-1">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">Max 5 tags. Selected: {tags.length}/5</p>
                  </div>

                  {/* Referral Commission */}
                  <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="font-medium text-white">Referral Program</p>
                          <p className="text-xs text-gray-400">Give promoters commission per sale</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEnableReferrals(!enableReferrals)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${enableReferrals ? 'bg-green-500' : 'bg-gray-600'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enableReferrals ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {enableReferrals && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white">Commission Rate</span>
                          <span className="text-lg font-bold text-green-400">{referralCommission}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          step="1"
                          value={referralCommission}
                          onChange={(e) => setReferralCommission(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>1%</span>
                          <span>5% (Recommended)</span>
                          <span>15%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Integrations */}
                  <div className="space-y-4">
                    <Label className="text-white font-semibold flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-blue-400" /> Integrations (Optional)
                    </Label>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-300">Website URL</Label>
                        <Input
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://yourevent.com"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-300">Instagram</Label>
                          <Input
                            value={socialLinks.instagram}
                            onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                            placeholder="@handle"
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-300">Twitter/X</Label>
                          <Input
                            value={socialLinks.twitter}
                            onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                            placeholder="@handle"
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-300">Facebook</Label>
                          <Input
                            value={socialLinks.facebook}
                            onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                            placeholder="page-name"
                            className="bg-white/5 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="border border-white/20 rounded-lg p-4 bg-white/5 space-y-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-yellow-400" /> Fee Breakdown
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Platform Fee</span>
                        <span className="text-white">{platformFee}%</span>
                      </div>
                      {venueFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Venue Fee (shared with owner)</span>
                          <span className="text-white">{venueFee}%</span>
                        </div>
                      )}
                      {enableReferrals && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Referral Commission (if used)</span>
                          <span className="text-white">Up to {referralCommission}%</span>
                        </div>
                      )}
                      <div className="border-t border-white/10 pt-2 flex justify-between">
                        <span className="text-white font-medium">You Earn</span>
                        <span className="text-green-400 font-bold">{organizerEarnings}% per ticket</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      After {platformFee}% platform{venueFee > 0 ? ` + ${venueFee}% venue` : ''} fees
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Event Preview */}
                  <div className="border border-white/20 rounded-lg overflow-hidden">
                    {image && (
                      <img src={image} alt={title} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">{category}</span>
                          <h3 className="text-xl font-bold text-white mt-2">{title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          {date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-cyan-400" />
                          {time || 'Time TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-red-400" />
                          {venueType === 'registered' && selectedVenue 
                            ? REGISTERED_VENUES.find(v => v.id === selectedVenue)?.name 
                            : venue}, {venueType === 'registered' && selectedVenue 
                            ? REGISTERED_VENUES.find(v => v.id === selectedVenue)?.city 
                            : city}
                        </span>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ticket Summary */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Tickets</h4>
                    {ticketTypes.map((ticket, index) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <p className="font-medium text-white">{ticket.name}</p>
                          <p className="text-xs text-gray-400">{ticket.totalSupply} available • Max {maxPerBuyer}/person</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-400">₹{ticket.price?.toLocaleString()}</p>
                          {ticket.pricingType === 'dynamic' && ticket.earlyBirdPrice > 0 && (
                            <p className="text-xs text-yellow-400">Early: ₹{ticket.earlyBirdPrice}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Web3 Settings Summary */}
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg space-y-2">
                    <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Web3 Settings
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Resale</p>
                        <p className="text-white font-medium">
                          {soulboundMode ? '❌ Disabled (Soulbound)' : enableResale ? '✅ Enabled' : '❌ Disabled'}
                        </p>
                      </div>
                      {!soulboundMode && enableResale && (
                        <>
                          <div>
                            <p className="text-gray-400">Your Royalty</p>
                            <p className="text-purple-400 font-bold">{royaltyPercentage}%</p>
                          </div>
                          {enableResaleCap && (
                            <div>
                              <p className="text-gray-400">Max Resale Price</p>
                              <p className="text-yellow-400 font-medium">+{maxResalePrice - 100}% cap</p>
                            </div>
                          )}
                        </>
                      )}
                      <div>
                        <p className="text-gray-400">Max per Buyer</p>
                        <p className="text-white font-medium">{maxPerBuyer} tickets</p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Summary */}
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <h4 className="font-semibold text-green-300 mb-3">Revenue Potential</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{totalTickets}</p>
                        <p className="text-xs text-gray-400">Total Tickets</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Gross Revenue</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-300">₹{organizerRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Your Earnings ({organizerEarnings}%)</p>
                      </div>
                    </div>
                    {!soulboundMode && enableResale && (
                      <p className="text-xs text-purple-400 text-center mt-3">
                        + {royaltyPercentage}% royalties on every resale 💰
                      </p>
                    )}
                  </div>

                  {/* Auto-approval notice */}
                  <div className={`p-4 rounded-lg border ${totalTickets < 100 ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    {totalTickets < 100 ? (
                      <div className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="font-medium text-green-300">Auto-Approval Eligible</p>
                          <p className="text-xs text-gray-400">Small events (&lt;100 tickets) are approved instantly!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="font-medium text-yellow-300">Admin Review Required</p>
                          <p className="text-xs text-gray-400">Large events are reviewed within 1-24 hours. You'll get an email update.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1" />
                      <span className="text-sm text-gray-300">
                        I confirm all event details are accurate and agree to the{' '}
                        <span className="text-purple-400 underline">Terms & Conditions</span>
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="border-white/20 text-white hover:bg-white/10">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={() => router.back()} className="text-gray-400">
                  Cancel
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="gradient-purple-cyan border-0 text-white font-semibold px-6"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="gradient-purple-cyan border-0 text-white font-semibold px-8"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit for Approval
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
