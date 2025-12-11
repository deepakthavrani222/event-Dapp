'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Award, 
  FileText, 
  Image as ImageIcon,
  ExternalLink,
  Star,
  Crown,
  Sparkles
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ArtistVerificationProps {
  artistId: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  onVerificationUpdate: () => void;
}

interface VerificationData {
  status: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  documentsSubmitted: {
    idProof: boolean;
    artistProof: boolean;
    additionalDocs: number;
  };
}

export function ArtistVerification({ 
  artistId, 
  verificationStatus, 
  onVerificationUpdate 
}: ArtistVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [documents, setDocuments] = useState({
    idProof: '',
    artistProof: '',
    additionalDocs: [] as string[]
  });

  useEffect(() => {
    fetchVerificationStatus();
  }, [artistId]);

  const fetchVerificationStatus = async () => {
    try {
      const response = await apiClient.request('/api/artist/verification', {
        method: 'GET'
      });

      if (response.success) {
        setVerificationData(response.verification);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    }
  };

  const handleFileUpload = async (file: File, type: 'idProof' | 'artistProof' | 'additional') => {
    setUploading(true);
    
    try {
      // In a real app, you'd upload to Cloudinary or similar service
      // For now, we'll simulate the upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock URL - in real app this would be the actual uploaded URL
      const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
      
      if (type === 'additional') {
        setDocuments(prev => ({
          ...prev,
          additionalDocs: [...prev.additionalDocs, mockUrl]
        }));
      } else {
        setDocuments(prev => ({
          ...prev,
          [type]: mockUrl
        }));
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!documents.idProof || !documents.artistProof) {
      alert('Please upload both ID proof and artist proof documents');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.request('/api/artist/verification', {
        method: 'POST',
        body: JSON.stringify(documents)
      });

      if (response.success) {
        onVerificationUpdate();
        fetchVerificationStatus();
      } else {
        alert(response.error || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Verification submission failed:', error);
      alert('Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (verificationStatus) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-400" />,
          title: 'Verified Artist',
          description: 'Congratulations! You are now a verified artist with full access to premium features.',
          color: 'border-green-500/30 bg-green-500/10'
        };
      case 'pending':
        return {
          icon: <Clock className="h-8 w-8 text-yellow-400" />,
          title: 'Verification Pending',
          description: 'Your verification is under review. This typically takes 24-48 hours.',
          color: 'border-yellow-500/30 bg-yellow-500/10'
        };
      case 'rejected':
        return {
          icon: <AlertCircle className="h-8 w-8 text-red-400" />,
          title: 'Verification Rejected',
          description: 'Your verification was rejected. Please review the feedback and resubmit.',
          color: 'border-red-500/30 bg-red-500/10'
        };
      default:
        return {
          icon: <Award className="h-8 w-8 text-purple-400" />,
          title: 'Get Verified',
          description: 'Submit your documents to become a verified artist and unlock premium features.',
          color: 'border-purple-500/30 bg-purple-500/10'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`glass-card ${status.color}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {status.icon}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{status.title}</h3>
              <p className="text-gray-300">{status.description}</p>
              
              {verificationData?.rejectionReason && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">
                    <strong>Rejection Reason:</strong> {verificationData.rejectionReason}
                  </p>
                </div>
              )}
              
              {verificationData?.verifiedAt && (
                <p className="text-sm text-gray-400 mt-2">
                  Verified on {new Date(verificationData.verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      {verificationStatus === 'verified' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-blue-500/30 bg-blue-500/10">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Blue Tick Verified</h3>
              <p className="text-sm text-gray-300">Your profile shows verified artist status</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="p-6 text-center">
              <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Golden Tickets</h3>
              <p className="text-sm text-gray-300">Create premium NFT tickets with exclusive perks</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-500/30 bg-green-500/10">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Higher Royalties</h3>
              <p className="text-sm text-gray-300">Earn 10-25% royalties on all ticket sales</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Requirements */}
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Verification Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Proof */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <h4 className="font-semibold text-white">Government ID Proof</h4>
                    {documents.idProof && <CheckCircle className="h-4 w-4 text-green-400" />}
                  </div>
                  <p className="text-sm text-gray-400">
                    Upload a clear photo of your Aadhaar, PAN, Passport, or Driver's License
                  </p>
                  
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'idProof');
                      }}
                      className="hidden"
                      id="idProof"
                    />
                    <label htmlFor="idProof" className="cursor-pointer">
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">
                        {documents.idProof ? 'ID Proof Uploaded' : 'Click to upload ID proof'}
                      </p>
                    </label>
                  </div>
                </div>

                {/* Artist Proof */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-400" />
                    <h4 className="font-semibold text-white">Artist Proof</h4>
                    {documents.artistProof && <CheckCircle className="h-4 w-4 text-green-400" />}
                  </div>
                  <p className="text-sm text-gray-400">
                    Upload proof of your artist status (press coverage, music platform profiles, etc.)
                  </p>
                  
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'artistProof');
                      }}
                      className="hidden"
                      id="artistProof"
                    />
                    <label htmlFor="artistProof" className="cursor-pointer">
                      <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">
                        {documents.artistProof ? 'Artist Proof Uploaded' : 'Click to upload artist proof'}
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Documents */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-400" />
                  <h4 className="font-semibold text-white">Additional Documents (Optional)</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Upload any additional proof like awards, certifications, or media coverage
                </p>
                
                <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => handleFileUpload(file, 'additional'));
                    }}
                    className="hidden"
                    id="additionalDocs"
                  />
                  <label htmlFor="additionalDocs" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {documents.additionalDocs.length > 0 
                        ? `${documents.additionalDocs.length} additional documents uploaded`
                        : 'Click to upload additional documents'
                      }
                    </p>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              {verificationStatus !== 'pending' && (
                <div className="pt-4">
                  <Button
                    onClick={handleSubmitVerification}
                    disabled={loading || uploading || !documents.idProof || !documents.artistProof}
                    className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold h-12"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Submitting Verification...
                      </div>
                    ) : uploading ? (
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Uploading Documents...
                      </div>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Submit for Verification
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="glass-card border-blue-500/30 bg-blue-500/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5" />
                Verification Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Ensure all documents are clear and readable</p>
                <p>• Use recent documents (issued within last 2 years)</p>
                <p>• Artist proof can include Spotify/Apple Music profiles, press coverage, or performance videos</p>
                <p>• Verification typically takes 24-48 hours</p>
                <p>• You'll receive an email notification once reviewed</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}