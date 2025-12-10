'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
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
      const response = await login(email, name || undefined);
      
      // Get the actual role assigned by backend
      const userRole = response?.user?.role?.toLowerCase() || 'buyer';
      
      // Store the backend-assigned role
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo-role', userRole);
      }
      
      // Redirect based on backend-assigned role
      const roleRoutes: Record<string, string> = {
        'guest': '/',
        'buyer': '/buyer',
        'organizer': '/organizer',
        'promoter': '/promoter',
        'venue_owner': '/venue-owner',
        'venue-owner': '/venue-owner',
        'artist': '/artist',
        'reseller': '/reseller',
        'admin': '/admin',
        'inspector': '/inspector',
      };

      const redirectPath = roleRoutes[userRole] || '/buyer';
      window.location.href = redirectPath;
      
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass-card border-white/20 bg-background/95 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gradient-neon">Welcome to TicketChain</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your email to access your Web3 wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Name (optional)</Label>
            <Input
              id="name"
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
            {loading ? 'Creating Account...' : 'Sign In'}
          </Button>

          <div className="space-y-2">
            <p className="text-xs text-gray-400 text-center">
              🔐 A secure crypto wallet will be created for you automatically
            </p>
            <p className="text-xs text-gray-400 text-center">
              Your role will be automatically assigned based on your email address
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
