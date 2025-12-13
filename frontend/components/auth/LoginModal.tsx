'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, Shield, Zap } from 'lucide-react';
import { useTheme } from '@/lib/context/ThemeContext';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Hide header when modal is open
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = open ? 'none' : '';
    }
    return () => {
      if (header) {
        header.style.display = '';
      }
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, name || undefined);
      onOpenChange(false); // Close modal on success
      // Reset form
      setEmail('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setError('');
    setEmail('');
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-md rounded-2xl border transition-all duration-300 ${
        isDark 
          ? 'glass-card border-white/20 bg-background/95 backdrop-blur-xl' 
          : 'bg-white border-gray-200 shadow-2xl shadow-black/10'
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold text-center ${
            isDark ? 'text-gradient-neon' : 'text-[#333333]'
          }`}>
            Welcome to TicketChain
          </DialogTitle>
          <DialogDescription className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Login with your email to access your Web3 wallet and tickets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center space-y-2">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <Wallet className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#333333]'}`}>Auto Wallet</p>
            </div>
            <div className="text-center space-y-2">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'
              }`}>
                <Shield className={`h-6 w-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#333333]'}`}>Secure</p>
            </div>
            <div className="text-center space-y-2">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
              }`}>
                <Zap className={`h-6 w-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-[#333333]'}`}>Instant</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-email" className={isDark ? 'text-white' : 'text-[#333333]'}>Email</Label>
              <Input
                id="modal-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400' 
                    : 'bg-white border-0 border-b-2 border-gray-200 text-[#333333] placeholder:text-gray-400 focus:border-purple-500 shadow-inner shadow-gray-100'
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-name" className={isDark ? 'text-white' : 'text-[#333333]'}>Name (optional)</Label>
              <Input
                id="modal-name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`h-12 rounded-lg transition-all ${
                  isDark 
                    ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400' 
                    : 'bg-white border-0 border-b-2 border-gray-200 text-[#333333] placeholder:text-gray-400 focus:border-purple-500 shadow-inner shadow-gray-100'
                }`}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold rounded-xl shadow-lg shadow-purple-500/30" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Login / Sign Up'}
            </Button>

            <p className={`text-xs text-center flex items-center justify-center gap-1 ${isDark ? 'text-gray-400' : 'text-[#333333]'}`}>
              <span>🔐</span> A secure crypto wallet will be created for you automatically
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}