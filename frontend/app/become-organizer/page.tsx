'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  ArrowRight, 
  Check, 
  Ticket, 
  DollarSign, 
  Shield, 
  Zap,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const benefits = [
  {
    icon: Ticket,
    title: 'Create Unlimited Events',
    description: 'List concerts, conferences, festivals, and more',
  },
  {
    icon: DollarSign,
    title: 'Earn Royalties Forever',
    description: 'Get 5% on every ticket resale automatically',
  },
  {
    icon: Shield,
    title: 'Anti-Scalping Protection',
    description: 'Control resale prices to protect your fans',
  },
  {
    icon: Zap,
    title: 'Instant Payouts',
    description: 'Withdraw earnings to crypto or bank instantly',
  },
];

export default function BecomeOrganizerPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [step, setStep] = useState<'info' | 'signup'>('info');
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to onboarding
  if (isAuthenticated) {
    router.push('/organizer/onboarding');
    return null;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Add "organizer" to email to trigger organizer role
      const organizerEmail = email.includes('organizer') ? email : email.replace('@', '.organizer@');
      
      await login(organizerEmail, name);
      
      // Redirect to onboarding wizard
      router.push('/organizer/onboarding');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-gradient-neon">
            TicketChain
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Already have an account? Sign In
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {step === 'info' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Left: Benefits */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                    Become an <span className="text-gradient-neon">Event Organizer</span>
                  </h1>
                  <p className="text-xl text-gray-400">
                    Create events, sell tickets, and earn royalties on every resale. 
                    No crypto knowledge required.
                  </p>
                </div>

                <div className="grid gap-4">
                  {benefits.map((benefit, idx) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <benefit.icon className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{benefit.title}</h3>
                        <p className="text-sm text-gray-400">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>No hidden fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>

              {/* Right: CTA Card */}
              <Card className="glass-card border-white/20 bg-gray-900/80 backdrop-blur-xl">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Get Started Free</h2>
                    <p className="text-gray-400">Create your organizer account in 2 minutes</p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={() => setStep('signup')}
                      className="w-full h-14 gradient-purple-cyan border-0 text-white font-semibold text-lg"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Continue with Email
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-gray-900 px-2 text-gray-400">or</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-12 bg-white/5 border-white/20 text-white hover:bg-white/10"
                        onClick={() => {
                          setSignupMethod('email');
                          setStep('signup');
                        }}
                      >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 bg-white/5 border-white/20 text-white hover:bg-white/10"
                        onClick={() => {
                          setSignupMethod('phone');
                          setStep('signup');
                        }}
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        Phone
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <Button
                variant="ghost"
                onClick={() => setStep('info')}
                className="mb-6 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Card className="glass-card border-white/20 bg-gray-900/80 backdrop-blur-xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                    <p className="text-gray-400">
                      {signupMethod === 'email' 
                        ? 'Enter your email to get started' 
                        : 'Enter your phone number'}
                    </p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Your Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    {signupMethod === 'email' ? (
                      <div className="space-y-2">
                        <Label className="text-white">Email Address</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-white">Phone Number</Label>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    )}

                    {error && (
                      <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 gradient-purple-cyan border-0 text-white font-semibold"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Organizer Account
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-sm text-purple-300 flex items-start gap-2">
                      <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        A secure crypto wallet will be created automatically. 
                        No setup required - we handle everything!
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-gray-400">Events Created</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">₹50Cr+</p>
              <p className="text-sm text-gray-400">Tickets Sold</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5%</p>
              <p className="text-sm text-gray-400">Resale Royalties</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">< 5min</p>
              <p className="text-sm text-gray-400">Instant Payouts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
