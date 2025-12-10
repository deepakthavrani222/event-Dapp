'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Shield, Zap } from 'lucide-react';

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
      <DialogContent className="sm:max-w-md glass-card border-white/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-neon text-center">
            Welcome to TicketChain
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Login with your email to access your Web3 wallet and tickets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-purple-400" />
              </div>
              <p className="text-xs text-gray-400">Auto Wallet</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <p className="text-xs text-gray-400">Secure</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-xs text-gray-400">Instant</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-email" className="text-white">Email</Label>
              <Input
                id="modal-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-name" className="text-white">Name (optional)</Label>
              <Input
                id="modal-name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold neon-glow" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Login / Sign Up'}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              🔐 A secure crypto wallet will be created for you automatically
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}