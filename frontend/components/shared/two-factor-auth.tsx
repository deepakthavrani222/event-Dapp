'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Smartphone, Check, Copy, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TwoFactorAuthProps {
  isEnabled?: boolean;
  onEnable?: () => void;
  onDisable?: () => void;
}

export function TwoFactorAuth({ isEnabled = false, onEnable, onDisable }: TwoFactorAuthProps) {
  const [step, setStep] = useState<'initial' | 'setup' | 'verify' | 'success'>('initial');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock secret key (in production, this would come from the server)
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/TicketChain:user@example.com?secret=${secretKey}&issuer=TicketChain`;

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In production, verify with server
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification (accept any 6-digit code for demo)
      if (verificationCode.length === 6) {
        setStep('success');
        onEnable?.();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onDisable?.();
      setStep('initial');
    } finally {
      setLoading(false);
    }
  };

  if (isEnabled && step === 'initial') {
    return (
      <Card className="border-green-500/30 bg-green-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-300">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-green-300/70">
            Your account is protected with 2FA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">2FA Enabled</p>
                <p className="text-sm text-gray-400">Using authenticator app</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDisable}
              disabled={loading}
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disable 2FA'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/20 bg-gray-900/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Shield className="h-5 w-5 text-purple-400" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* Initial State */}
          {step === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 font-medium">Recommended</p>
                    <p className="text-sm text-yellow-300/70">
                      2FA protects your account from unauthorized access, even if your password is compromised.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Smartphone className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Authenticator App</p>
                    <p className="text-xs text-gray-400">Google Authenticator, Authy, or similar</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setStep('setup')}
                className="w-full gradient-purple-cyan border-0"
              >
                <Shield className="h-4 w-4 mr-2" />
                Enable 2FA
              </Button>
            </motion.div>
          )}

          {/* Setup State */}
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Scan this QR code with your authenticator app
                </p>
                <div className="inline-block p-4 bg-white rounded-lg">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2">Or enter this key manually:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="px-3 py-2 bg-white/10 rounded text-purple-400 font-mono text-sm">
                    {secretKey}
                  </code>
                  <Button variant="ghost" size="sm" onClick={copySecretKey}>
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={() => setStep('verify')}
                className="w-full gradient-purple-cyan border-0"
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Verify State */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Verification Code</Label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest bg-white/5 border-white/20 text-white font-mono"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('setup')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 gradient-purple-cyan border-0"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Enable'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2FA Enabled!</h3>
              <p className="text-gray-400 mb-4">
                Your account is now protected with two-factor authentication.
              </p>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-300">
                You'll need to enter a code from your authenticator app when signing in.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// 2FA Verification Modal for login/sensitive actions
export function TwoFactorVerifyModal({ 
  isOpen, 
  onClose, 
  onVerify,
  title = 'Verify Your Identity'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onVerify: (code: string) => Promise<boolean>;
  title?: string;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onVerify(code);
      if (!success) {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-sm w-full"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">
            Enter the code from your authenticator app
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="text-center text-2xl tracking-widest bg-white/5 border-white/20 text-white font-mono"
            autoFocus
          />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="flex-1 gradient-purple-cyan border-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
