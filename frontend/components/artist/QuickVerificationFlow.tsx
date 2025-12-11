'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Instagram, 
  Youtube, 
  Music, 
  Upload, 
  CheckCircle, 
  Clock, 
  Sparkles,
  Camera,
  FileText,
  ArrowRight,
  Crown,
  Zap,
  Users
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface QuickVerificationFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function QuickVerificationFlow({ onComplete, onCancel }: QuickVerificationFlowProps) {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Social Links, 3: Documents, 4: Success
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    stageName: '',
    legalName: '',
    instagram: '',
    youtube: '',
    spotify: '',
    managerEmail: '',
    idDocument: '',
    selfieDocument: ''
  });

  const [followerCount, setFollowerCount] = useState(0);
  const [fastTrack, setFastTrack] = useState(false);

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({ ...prev, [platform]: value }));
    
    // Check for fast-track eligibility (mock - in real app would verify follower count)
    if (platform === 'instagram' && value.includes('instagram.com')) {
      // Mock follower count check
      const mockFollowerCount = Math.floor(Math.random() * 200000);
      setFollowerCount(mockFollowerCount);
      setFastTrack(mockFollowerCount >= 50000);
    }
  };

  const handleFileUpload = async (file: File, type: 'id' | 'selfie') => {
    setUploading(true);
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
      
      setFormData(prev => ({
        ...prev,
        [type === 'id' ? 'idDocument' : 'selfieDocument']: mockUrl
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Submit artist profile
      const profileResponse = await apiClient.saveArtistProfile({
        artistName: formData.stageName,
        realName: formData.legalName,
        socialLinks: {
          instagram: formData.instagram,
          youtube: formData.youtube,
          spotify: formData.spotify,
          managerEmail: formData.managerEmail
        }
      });

      if (profileResponse.success) {
        // Submit verification documents
        const verificationResponse = await apiClient.submitArtistVerification({
          idProof: formData.idDocument,
          artistProof: formData.selfieDocument, // Using selfie as artist proof for quick flow
          fastTrack: fastTrack
        });

        if (verificationResponse.success) {
          setStep(4);
        } else {
          throw new Error(verificationResponse.error);
        }
      } else {
        throw new Error(profileResponse.error);
      }
    } catch (error: any) {
      console.error('Verification submission failed:', error);
      alert(error.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => ((step - 1) / 3) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Get Verified as Artist</h2>
                <p className="text-gray-400">Join the elite tier • 5-15 minutes</p>
              </div>
            </div>
            
            {fastTrack && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Fast Track Eligible!
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getStepProgress()}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Basic Info</span>
            <span>Social Links</span>
            <span>Documents</span>
            <span>Complete</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Tell us about yourself</h3>
                  <p className="text-gray-400">This information will appear on your verified profile</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stageName" className="text-white">Stage Name *</Label>
                    <Input
                      id="stageName"
                      value={formData.stageName}
                      onChange={(e) => setFormData(prev => ({ ...prev, stageName: e.target.value }))}
                      placeholder="e.g., Prateek Kuhad, Nucleya, When Chai Met Toast"
                      className="bg-white/10 border-white/20 text-white h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legalName" className="text-white">Legal Name *</Label>
                    <Input
                      id="legalName"
                      value={formData.legalName}
                      onChange={(e) => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
                      placeholder="As per government ID"
                      className="bg-white/10 border-white/20 text-white h-12"
                      required
                    />
                    <p className="text-xs text-gray-400">Must match your ID document exactly</p>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.stageName || !formData.legalName}
                  className="w-full gradient-blue-purple hover:opacity-90 border-0 text-white font-semibold h-12"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Social Links */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Connect your social profiles</h3>
                  <p className="text-gray-400">We'll verify your identity through your existing presence</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-400" />
                      <Label className="text-white">Instagram Profile *</Label>
                      <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">Required</Badge>
                    </div>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourusername"
                      className="bg-white/10 border-white/20 text-white h-12"
                      required
                    />
                    {followerCount > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          ~{followerCount.toLocaleString()} followers detected
                        </span>
                        {fastTrack && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Fast Track!
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-400" />
                      <Label className="text-white">YouTube Channel</Label>
                      <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">Optional</Badge>
                    </div>
                    <Input
                      value={formData.youtube}
                      onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/c/yourchannel"
                      className="bg-white/10 border-white/20 text-white h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-green-400" />
                      <Label className="text-white">Spotify Artist Profile</Label>
                      <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">Optional</Badge>
                    </div>
                    <Input
                      value={formData.spotify}
                      onChange={(e) => handleSocialLinkChange('spotify', e.target.value)}
                      placeholder="https://open.spotify.com/artist/..."
                      className="bg-white/10 border-white/20 text-white h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Manager Email (Optional)</Label>
                    <Input
                      value={formData.managerEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, managerEmail: e.target.value }))}
                      placeholder="manager@example.com"
                      className="bg-white/10 border-white/20 text-white h-12"
                      type="email"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.instagram}
                    className="flex-1 gradient-blue-purple hover:opacity-90 border-0 text-white font-semibold"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Upload verification documents</h3>
                  <p className="text-gray-400">Just 2 quick photos to verify your identity</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Government ID */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <h4 className="font-semibold text-white">Government ID</h4>
                      {formData.idDocument && <CheckCircle className="h-4 w-4 text-green-400" />}
                    </div>
                    
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-blue-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'id');
                        }}
                        className="hidden"
                        id="idUpload"
                      />
                      <label htmlFor="idUpload" className="cursor-pointer">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-white mb-1">
                          {formData.idDocument ? 'ID Uploaded ✓' : 'Upload Government ID'}
                        </p>
                        <p className="text-xs text-gray-400">Aadhaar, PAN, Passport, or License</p>
                      </label>
                    </div>
                  </div>

                  {/* Selfie */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-purple-400" />
                      <h4 className="font-semibold text-white">Selfie with ID</h4>
                      {formData.selfieDocument && <CheckCircle className="h-4 w-4 text-green-400" />}
                    </div>
                    
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-purple-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'selfie');
                        }}
                        className="hidden"
                        id="selfieUpload"
                      />
                      <label htmlFor="selfieUpload" className="cursor-pointer">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-white mb-1">
                          {formData.selfieDocument ? 'Selfie Uploaded ✓' : 'Upload Selfie'}
                        </p>
                        <p className="text-xs text-gray-400">Hold your ID next to your face</p>
                      </label>
                    </div>
                  </div>
                </div>

                {uploading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-400">Uploading document...</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !formData.idDocument || !formData.selfieDocument}
                    className="flex-1 gradient-blue-purple hover:opacity-90 border-0 text-white font-semibold"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Submitting...
                      </div>
                    ) : (
                      <>
                        Submit for Verification
                        <Sparkles className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
                  <p className="text-gray-400 mb-4">
                    {fastTrack 
                      ? "Fast-track review in progress • Usually approved within 12 hours"
                      : "Your verification is under review • Usually takes 24-48 hours"
                    }
                  </p>
                </div>

                <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
                  <CardContent className="p-4 text-left">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      What happens next?
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Our team reviews your application</li>
                      <li>• You'll get an email notification when approved</li>
                      <li>• Blue tick badge appears on your profile</li>
                      <li>• Access to Golden Tickets and fan messaging</li>
                      <li>• Higher royalty rates (10-25%)</li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={onComplete}
                    className="flex-1 gradient-blue-purple hover:opacity-90 border-0 text-white font-semibold"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Go to Artist Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}