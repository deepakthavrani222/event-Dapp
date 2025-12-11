'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Calendar, 
  MessageCircle, 
  TrendingUp,
  DollarSign,
  Users,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  Repeat,
  Target,
  Zap
} from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    date: 'Jan 5, 2025',
    title: 'Artist Verification',
    description: 'Applied and got verified in just 3 hours',
    icon: Star,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    details: [
      'Submitted verification documents',
      'Fast-track approval for 50k+ followers',
      'Verified artist badge activated',
      'Golden ticket access unlocked'
    ],
    metrics: {
      time: '3 hours',
      status: 'Verified',
      tier: 'Gold'
    }
  },
  {
    date: 'Jan 7, 2025',
    title: 'Golden Tickets Launch',
    description: '500 Golden Passes @ ₹50,000 each → sold out in 11 minutes',
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    details: [
      'Created premium NFT tickets',
      'Exclusive meet & greet access',
      'VIP seating and backstage pass',
      'Limited edition merchandise included'
    ],
    metrics: {
      revenue: '₹2.5 Crore',
      quantity: '500 tickets',
      sellout: '11 minutes'
    }
  },
  {
    date: 'Jan 8, 2025',
    title: 'Fan Messaging',
    description: 'Messaged all 30,000 ticket holders about free merch',
    icon: MessageCircle,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    details: [
      'Instant message to all ticket holders',
      'Multi-channel delivery (email, push, in-app)',
      'Exclusive offer for first 500 at venue',
      'Massive fan engagement boost'
    ],
    metrics: {
      reach: '30,000 fans',
      channels: '3 channels',
      engagement: '95% open rate'
    }
  },
  {
    date: 'Mar 1-15, 2025',
    title: '5-City Tour',
    description: 'Normal tickets resold 4000+ times → extra ₹3+ crore royalty',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    details: [
      'Mumbai, Delhi, Bangalore, Pune, Hyderabad',
      '4000+ ticket resales during tour',
      '15% royalty on every resale',
      'Continuous revenue stream activated'
    ],
    metrics: {
      cities: '5 cities',
      resales: '4000+ tickets',
      royalties: '₹3+ Crore'
    }
  },
  {
    date: 'Dec 2025',
    title: 'Long-term Royalties',
    description: 'One old ticket resells for ₹5 lakh → AP gets ₹75,000 without doing anything',
    icon: Repeat,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    details: [
      'Single ticket: ₹5,000 → ₹5,00,000',
      'AP Dhillon earns ₹75,000 (15% royalty)',
      'Zero effort required from artist',
      'Royalties continue forever'
    ],
    metrics: {
      resalePrice: '₹5 Lakh',
      royalty: '₹75,000',
      effort: '0 minutes'
    }
  }
];

export function APDhillonWorkflow() {
  const [selectedStep, setSelectedStep] = useState(0);

  const totalRevenue = 25000000 + 30000000 + 75000; // Initial + Tour + Single resale
  const totalRoyalties = 30000000 + 75000; // Tour royalties + Single resale

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">AP Dhillon Success Journey</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Real example of how our platform features work together to create massive success. 
          Follow this exact workflow to achieve similar results.
        </p>
      </div>

      {/* Total Impact Summary */}
      <Card className="glass-card border-gradient-to-r from-green-500/30 to-blue-500/30 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Total Impact: 2025 Tour</h3>
            <p className="text-gray-400">Complete revenue breakdown from platform features</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-green-400">₹{(totalRevenue / 10000000).toFixed(1)}Cr+</p>
              <p className="text-sm text-gray-400">Total Revenue Generated</p>
              <p className="text-xs text-green-300 mt-1">Initial + Ongoing</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">₹{(totalRoyalties / 10000000).toFixed(1)}Cr+</p>
              <p className="text-sm text-gray-400">Ongoing Royalties</p>
              <p className="text-xs text-blue-300 mt-1">Passive Income</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">30K+</p>
              <p className="text-sm text-gray-400">Fans Reached</p>
              <p className="text-xs text-purple-300 mt-1">Direct Messaging</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">∞</p>
              <p className="text-sm text-gray-400">Lifetime Value</p>
              <p className="text-xs text-yellow-300 mt-1">Royalties Never Stop</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Steps */}
        <div className="lg:col-span-2 space-y-4">
          {WORKFLOW_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isSelected = selectedStep === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`glass-card cursor-pointer transition-all ${
                    isSelected 
                      ? `${step.borderColor} ${step.bgColor}` 
                      : 'border-white/20 bg-white/5 hover:border-purple-500/30'
                  }`}
                  onClick={() => setSelectedStep(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <StepIcon className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-white/20 text-white text-xs">
                            {step.date}
                          </Badge>
                          {isSelected && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                        <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                        
                        {/* Quick Metrics */}
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(step.metrics).map(([key, value]) => (
                            <Badge key={key} className="bg-white/10 text-white text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Step Details */}
        <div className="space-y-6">
          <Card className={`glass-card ${WORKFLOW_STEPS[selectedStep].borderColor} ${WORKFLOW_STEPS[selectedStep].bgColor}`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <WORKFLOW_STEPS[selectedStep].icon className="h-5 w-5" />
                Step Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">{WORKFLOW_STEPS[selectedStep].title}</h4>
                <p className="text-gray-300 text-sm mb-4">{WORKFLOW_STEPS[selectedStep].description}</p>
              </div>
              
              <div>
                <h5 className="font-medium text-white mb-2">What Happened:</h5>
                <ul className="space-y-2">
                  {WORKFLOW_STEPS[selectedStep].details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-white/20">
                <h5 className="font-medium text-white mb-2">Key Metrics:</h5>
                <div className="space-y-2">
                  {Object.entries(WORKFLOW_STEPS[selectedStep].metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="glass-card border-purple-500/30 bg-purple-500/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedStep === 0 && (
                <div className="space-y-2">
                  <Button className="w-full gradient-blue-cyan hover:opacity-90 border-0 text-white">
                    <Star className="h-4 w-4 mr-2" />
                    Start Artist Verification
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Get verified in 3 hours with 50k+ followers
                  </p>
                </div>
              )}
              
              {selectedStep === 1 && (
                <div className="space-y-2">
                  <Button className="w-full gradient-yellow-orange hover:opacity-90 border-0 text-black font-semibold">
                    <Crown className="h-4 w-4 mr-2" />
                    Create Golden Tickets
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Price high (₹25K-₹50K) for exclusivity
                  </p>
                </div>
              )}
              
              {selectedStep === 2 && (
                <div className="space-y-2">
                  <Button className="w-full gradient-purple-pink hover:opacity-90 border-0 text-white">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Your Fans
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Reach all ticket holders instantly
                  </p>
                </div>
              )}
              
              {selectedStep === 3 && (
                <div className="space-y-2">
                  <Button className="w-full gradient-green-emerald hover:opacity-90 border-0 text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    Plan Your Tour
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Multi-city events = more resales
                  </p>
                </div>
              )}
              
              {selectedStep === 4 && (
                <div className="space-y-2">
                  <Button className="w-full gradient-cyan-blue hover:opacity-90 border-0 text-white">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create NFT Collections
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Turn past tickets into valuable NFTs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="glass-card border-gradient-to-r from-purple-500/30 to-cyan-500/30 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <CardContent className="p-8 text-center">
          <Zap className="h-12 w-12 mx-auto text-purple-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Ready to Follow AP Dhillon's Path?</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Every feature in this workflow is available to you right now. Start with artist verification 
            and build your way to crores in revenue with our proven system.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button className="gradient-purple-cyan hover:opacity-90 border-0 text-white font-bold px-8">
              <Star className="h-5 w-5 mr-2" />
              Start My Journey
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Award className="h-5 w-5 mr-2" />
              View All Features
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}