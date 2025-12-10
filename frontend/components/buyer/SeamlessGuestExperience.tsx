'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle, 
  Star,
  Users,
  Ticket,
  ArrowRight,
  Heart,
  Share2,
  MapPin,
  Calendar
} from 'lucide-react';

interface SeamlessGuestExperienceProps {
  onStartBuying: () => void;
}

export function SeamlessGuestExperience({ onStartBuying }: SeamlessGuestExperienceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const benefits = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Instant Purchase",
      description: "Buy tickets in under 30 seconds",
      color: "text-yellow-400"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "100% Secure",
      description: "Blockchain-verified authenticity",
      color: "text-green-400"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "No Waiting",
      description: "Tickets delivered instantly",
      color: "text-blue-400"
    }
  ];

  const steps = [
    "Browse events without signing up",
    "Click any event to see details",
    "Select tickets and click 'Buy Now'",
    "Quick sign-in with email/phone",
    "Pay with UPI, card, or wallet",
    "Get tickets instantly in your wallet"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Badge className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border-purple-500/30 px-4 py-2">
            🎫 Zero Crypto Knowledge Required
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            Buy Tickets Like
            <br />
            <span className="text-gradient-neon">Never Before</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Easier than BookMyShow. Safer than Ticketmaster. 
            <span className="text-white font-semibold"> Powered by Web3.</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={onStartBuying}
            size="lg"
            className="gradient-purple-cyan hover:opacity-90 border-0 text-white text-lg h-16 px-10 rounded-full neon-glow font-bold"
          >
            Start Browsing Events
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="glass-card hover:bg-white/10 border-white/20 text-white text-lg h-16 px-10 rounded-full font-bold bg-transparent"
          >
            Watch Demo (30s)
          </Button>
        </motion.div>
      </div>

      {/* Benefits Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardContent className="p-6 text-center space-y-3">
                <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center ${benefit.color}`}>
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">How It Works</h2>
          <p className="text-gray-400">Simple as 1-2-3, but with Web3 superpowers</p>
        </div>

        <div className="glass-card border-white/20 bg-white/5 backdrop-blur-sm p-6 rounded-2xl">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0.5 }}
                animate={{ 
                  opacity: currentStep === index ? 1 : 0.5,
                  scale: currentStep === index ? 1.02 : 1
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  currentStep === index 
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30' 
                    : 'bg-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  currentStep === index 
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {index + 1}
                </div>
                <p className={`font-medium ${
                  currentStep === index ? 'text-white' : 'text-gray-400'
                }`}>
                  {step}
                </p>
                {currentStep === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">50K+</p>
            <p className="text-sm text-gray-400">Happy Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">1000+</p>
            <p className="text-sm text-gray-400">Events Hosted</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">99.9%</p>
            <p className="text-sm text-gray-400">Secure Tickets</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
          ))}
          <span className="ml-2 text-gray-400">4.9/5 from 10,000+ reviews</span>
        </div>

        <p className="text-sm text-gray-400 max-w-2xl mx-auto">
          "Finally, a ticketing platform that just works. No crypto wallets to set up, 
          no gas fees to worry about. Just click, buy, and go!" - Priya S., Mumbai
        </p>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="flex items-center justify-center gap-8 text-xs text-gray-400"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Bank-level Security</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Instant Refunds</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>24/7 Support</span>
        </div>
      </motion.div>
    </div>
  );
}