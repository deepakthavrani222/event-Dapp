'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/context/AuthContext';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SupportPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    category: '',
    fullName: user?.name || '',
    email: user?.email || '',
    mobile: '',
    issue: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
        {/* Simple Logo Header */}
        <div className={`py-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <Link href="/" className="flex flex-col items-center">
            <span className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              ticket<span className={isDark ? 'text-purple-400' : 'text-[#E23744]'}>chain</span>
            </span>
            <span className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              by web3
            </span>
          </Link>
        </div>

        <div className="py-12 px-4">
          <div className="max-w-md mx-auto text-center py-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Request Submitted!
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Our support team will get back to you within 24 hours.
            </p>
            <Button 
              onClick={() => setSubmitted(false)}
              className="gradient-purple-cyan text-white"
            >
              Submit Another Request
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      {/* Simple Logo Header - Like District */}
      <div className={`py-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <Link href="/" className="flex flex-col items-center">
          <span className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            ticket<span className={isDark ? 'text-purple-400' : 'text-[#E23744]'}>chain</span>
          </span>
          <span className={`text-[10px] uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            by web3
          </span>
        </Link>
      </div>
      
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <h1 className={`text-3xl font-bold text-center mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            How can we help you?
          </h1>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Side - Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category Dropdown */}
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger className={`h-12 ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}>
                      <SelectValue placeholder="Events / Tickets / Payments / Other" />
                    </SelectTrigger>
                    <SelectContent className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="tickets">Tickets</SelectItem>
                      <SelectItem value="payments">Payments</SelectItem>
                      <SelectItem value="refunds">Refunds</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Full name *</Label>
                  <Input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Full name *"
                    className={`h-12 ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Email address *</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Email address *"
                    className={`h-12 ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Mobile number *</Label>
                  <Input
                    required
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder="Mobile number *"
                    className={`h-12 ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>

                {/* Issue Description */}
                <div className="space-y-2">
                  <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Describe your issue *</Label>
                  <Textarea
                    required
                    value={formData.issue}
                    onChange={(e) => setFormData({...formData, issue: e.target.value})}
                    placeholder="Briefly describe your issue here *"
                    rows={5}
                    className={`resize-none ${
                      isDark 
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className={`h-12 px-8 ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </form>
            </div>

            {/* Right Side - Info */}
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800/30' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Issue with your booking?
              </h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Open the TicketChain app → Go to your profile → Tap &apos;Chat with us&apos; under the Support section to connect with our customer support team for faster assistance.
              </p>

              <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-100'}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                  Quick Tips
                </h3>
                <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Check your email for booking confirmation</li>
                  <li>• Visit &apos;My Tickets&apos; to view all bookings</li>
                  <li>• Refunds are processed within 5-7 business days</li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Contact Hours
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Monday - Sunday: 9:00 AM - 9:00 PM IST
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Average response time: 2-4 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
