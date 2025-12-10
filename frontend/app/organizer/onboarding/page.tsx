'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  User, 
  Building, 
  CreditCard, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Wallet,
  Smartphone,
  Instagram,
  Twitter,
  Globe,
  Shield,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User, description: 'Tell us about yourself' },
  { id: 2, title: 'Verification', icon: Shield, description: 'Build trust with attendees' },
  { id: 3, title: 'Payouts', icon: CreditCard, description: 'How you want to get paid' },
];

export default function OrganizerOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Step 1: Basic Info
  const [displayName, setDisplayName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Step 2: Verification (optional)
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [skipVerification, setSkipVerification] = useState(false);

  // Step 3: Payout Preferences
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi' | 'crypto'>('upi');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/become-organizer');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Pre-fill with user data
    if (user) {
      setDisplayName(user.name || '');
      setCryptoWallet(user.walletAddress || '');
    }
  }, [user]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(displayName && organizationName);
      case 2:
        return skipVerification || !!(instagram || twitter || website);
      case 3:
        if (payoutMethod === 'bank') return !!(bankAccount && ifscCode);
        if (payoutMethod === 'upi') return !!upiId;
        if (payoutMethod === 'crypto') return !!cryptoWallet;
        return false;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save organizer profile
      await apiClient.request('/api/organizer/profile', {
        method: 'POST',
        body: JSON.stringify({
          displayName,
          organizationName,
          bio,
          profileImage,
          socialLinks: { instagram, twitter, website },
          payoutPreferences: {
            method: payoutMethod,
            bankAccount: payoutMethod === 'bank' ? { accountNumber: bankAccount, ifscCode } : null,
            upiId: payoutMethod === 'upi' ? upiId : null,
            cryptoWallet: payoutMethod === 'crypto' ? cryptoWallet : null,
          },
          onboardingCompleted: true,
        }),
      });

      setCompleted(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/organizer');
      }, 2000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // Still redirect even if save fails - they can update later
      router.push('/organizer');
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

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">You're All Set!</h1>
          <p className="text-gray-400 mb-4">Welcome to TicketChain, {displayName}!</p>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-gray-400">Just a few more steps to start creating events</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full transition-all
                ${currentStep >= step.id 
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
                }
              `}>
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`
                  w-16 h-1 mx-2 rounded transition-all
                  ${currentStep > step.id ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-700'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-white">{STEPS[currentStep - 1].title}</h2>
          <p className="text-sm text-gray-400">{STEPS[currentStep - 1].description}</p>
        </div>

        {/* Form Card */}
        <Card className="glass-card border-white/20 bg-gray-900/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Profile Image */}
                  <div className="flex justify-center">
                    <div className="relative">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center border-4 border-purple-500/30">
                          <User className="h-10 w-10 text-purple-400" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2">
                        <ImageUpload
                          value={profileImage}
                          onChange={(url) => setProfileImage(url)}
                          onRemove={() => setProfileImage('')}
                          type="avatar"
                          className="w-8 h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Display Name *</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How attendees will see you"
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Organization / Brand Name *</Label>
                    <Input
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Your company or brand"
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Bio (optional)</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell attendees about yourself..."
                      rows={3}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Verification */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">
                      <strong>Optional:</strong> Link your social accounts to build trust with attendees. 
                      Required for events with 500+ capacity.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-400" />
                        Instagram
                      </Label>
                      <Input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@yourusername"
                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-blue-400" />
                        Twitter / X
                      </Label>
                      <Input
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="@yourusername"
                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-400" />
                        Website
                      </Label>
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                    <input
                      type="checkbox"
                      id="skipVerification"
                      checked={skipVerification}
                      onChange={(e) => setSkipVerification(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="skipVerification" className="text-sm text-gray-300">
                      Skip for now - I'll add this later
                    </label>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payout Preferences */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>
                        <strong>Earn royalties forever!</strong> Get 5% on every ticket resale automatically.
                      </span>
                    </p>
                  </div>

                  {/* Payout Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-white">How do you want to receive payments?</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('upi')}
                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                          payoutMethod === 'upi' 
                            ? 'border-purple-500 bg-purple-500/20' 
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <Smartphone className="h-6 w-6 text-cyan-400" />
                        <span className="text-sm text-white font-medium">UPI</span>
                        <span className="text-xs text-gray-400">Instant</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('bank')}
                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                          payoutMethod === 'bank' 
                            ? 'border-purple-500 bg-purple-500/20' 
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <Building className="h-6 w-6 text-blue-400" />
                        <span className="text-sm text-white font-medium">Bank</span>
                        <span className="text-xs text-gray-400">1-2 days</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('crypto')}
                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                          payoutMethod === 'crypto' 
                            ? 'border-purple-500 bg-purple-500/20' 
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <Wallet className="h-6 w-6 text-purple-400" />
                        <span className="text-sm text-white font-medium">Crypto</span>
                        <span className="text-xs text-green-400">Instant</span>
                      </button>
                    </div>
                  </div>

                  {/* Payout Details */}
                  {payoutMethod === 'upi' && (
                    <div className="space-y-2">
                      <Label className="text-white">UPI ID</Label>
                      <Input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  {payoutMethod === 'bank' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Account Number</Label>
                        <Input
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="Enter account number"
                          className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">IFSC Code</Label>
                        <Input
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value)}
                          placeholder="SBIN0001234"
                          className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  )}

                  {payoutMethod === 'crypto' && (
                    <div className="space-y-2">
                      <Label className="text-white">Wallet Address</Label>
                      <Input
                        value={cryptoWallet}
                        onChange={(e) => setCryptoWallet(e.target.value)}
                        placeholder="0x..."
                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 font-mono"
                      />
                      {user?.walletAddress && (
                        <button
                          type="button"
                          onClick={() => setCryptoWallet(user.walletAddress)}
                          className="text-xs text-purple-400 hover:underline"
                        >
                          Use my TicketChain wallet
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>

              <div>
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    className="gradient-purple-cyan border-0 text-white font-semibold"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleComplete}
                    disabled={loading || !validateStep(currentStep)}
                    className="gradient-purple-cyan border-0 text-white font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/organizer')}
            className="text-gray-400 hover:text-white"
          >
            Skip for now, I'll complete this later
          </Button>
        </div>
      </div>
    </div>
  );
}
