'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/context/ThemeContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <Card className={`w-full max-w-md rounded-2xl transition-all duration-300 ${
      isDark 
        ? 'glass-card border-white/20 bg-background/95 backdrop-blur-xl' 
        : 'bg-white border border-gray-200 shadow-xl'
    }`}>
      <CardHeader className="text-center pb-2">
        <CardTitle className={`text-2xl font-bold ${isDark ? 'text-gradient-neon' : 'text-purple-600'}`}>
          Welcome to TicketChain
        </CardTitle>
        <CardDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Enter your email to access your Web3 wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-2">
            <Label htmlFor="email" className={`font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`h-12 rounded-lg transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400' 
                  : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              }`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className={`font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>Name (optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`h-12 rounded-lg transition-all ${
                isDark 
                  ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400' 
                  : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              }`}
            />
          </div>

          {error && (
            <div className={`text-sm p-3 rounded-lg ${
              isDark 
                ? 'text-red-400 bg-red-500/10 border border-red-500/20' 
                : 'text-red-600 bg-red-50 border border-red-200'
            }`}>
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-0 text-white h-12 font-semibold rounded-lg shadow-lg shadow-purple-500/30 transition-all" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign In'}
          </Button>

          <div className="space-y-2 pt-2">
            <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              🔐 A secure crypto wallet will be created for you automatically
            </p>
            <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Your role will be automatically assigned based on your email address
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
