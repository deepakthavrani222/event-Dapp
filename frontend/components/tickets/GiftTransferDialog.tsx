'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Gift, 
  Mail, 
  Smartphone, 
  CheckCircle, 
  ArrowRight,
  User,
  Heart,
  Send
} from 'lucide-react';

interface GiftTransferDialogProps {
  ticket: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function GiftTransferDialog({ ticket, onClose, onSuccess }: GiftTransferDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [transferMethod, setTransferMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      // Simulate transfer process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDetailsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
          <Gift className="h-8 w-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Gift This Ticket</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Transfer instantly to a friend or family member</p>
      </div>

      {/* Transfer Method Selection */}
      <div className="space-y-3">
        <Label className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Send via:</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={transferMethod === 'email' ? 'default' : 'outline'}
            onClick={() => setTransferMethod('email')}
            className={`flex items-center gap-2 h-12 ${transferMethod !== 'email' && !isDark ? 'border-gray-300 text-gray-700' : ''}`}
          >
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </Button>
          <Button
            variant={transferMethod === 'phone' ? 'default' : 'outline'}
            onClick={() => setTransferMethod('phone')}
            className={`flex items-center gap-2 h-12 ${transferMethod !== 'phone' && !isDark ? 'border-gray-300 text-gray-700' : ''}`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Phone</span>
          </Button>
        </div>
      </div>

      {/* Recipient Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="recipientName" className={isDark ? 'text-white' : 'text-gray-900'}>Recipient Name</Label>
          <Input
            id="recipientName"
            placeholder="Friend's name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className={isDark ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500'}
          />
        </div>

        {transferMethod === 'email' ? (
          <div>
            <Label htmlFor="recipientEmail" className={isDark ? 'text-white' : 'text-gray-900'}>Email Address</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className={isDark ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500'}
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="recipientPhone" className={isDark ? 'text-white' : 'text-gray-900'}>Phone Number</Label>
            <Input
              id="recipientPhone"
              type="tel"
              placeholder="+91 98765 43210"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className={isDark ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500'}
            />
          </div>
        )}

        <div>
          <Label htmlFor="message" className={isDark ? 'text-white' : 'text-gray-900'}>Personal Message (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Hey! I'm gifting you this ticket to..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`resize-none ${isDark ? 'bg-white/5 border-white/20 text-white placeholder:text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
            rows={3}
          />
        </div>
      </div>

      {/* Ticket Preview */}
      <div className={`p-4 rounded-xl ${isDark ? 'glass-card border-white/20 bg-white/5' : 'bg-gray-100 border border-gray-200'}`}>
        <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ticket to Transfer:</h3>
        <div className="flex items-center gap-3">
          <img 
            src={ticket.eventImage} 
            alt={ticket.eventTitle}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.eventTitle}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.ticketType} • ₹{ticket.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setStep('confirm')}
        disabled={!recipientName || (!recipientEmail && !recipientPhone)}
        className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold"
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  );

  const renderConfirmStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Transfer</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Review the details before sending</p>
      </div>

      {/* Transfer Summary */}
      <div className={`p-6 rounded-xl space-y-4 ${isDark ? 'glass-card border-white/20 bg-white/5' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{recipientName}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {transferMethod === 'email' ? recipientEmail : recipientPhone}
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>&quot;{message}&quot;</p>
          </div>
        )}

        <div className={`border-t pt-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <img 
              src={ticket.eventImage} 
              alt={ticket.eventTitle}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.eventTitle}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.ticketType}</p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Seat: {ticket.seatNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
        <h4 className={`font-semibold mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Important:</h4>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-yellow-200' : 'text-yellow-600'}`}>
          <li>• This transfer is instant and cannot be undone</li>
          <li>• The ticket will be removed from your account</li>
          <li>• Recipient will receive full ownership rights</li>
          <li>• No fees for gifting to friends & family</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep('details')}
          className={`flex-1 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
        >
          Back
        </Button>
        <Button
          onClick={handleTransfer}
          disabled={loading}
          className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              Transferring...
            </div>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Gift
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8"
    >
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto bg-green-500/20 rounded-full animate-ping"></div>
      </div>
      
      <div className="space-y-2">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Gift Sent! 🎁</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Your ticket has been transferred successfully</p>
      </div>

      <div className={`p-4 rounded-xl ${isDark ? 'glass-card border-green-500/30 bg-green-500/10' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
          <Heart className="h-5 w-5" />
          <span className="font-semibold">Transfer Complete</span>
        </div>
        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{recipientName}</p>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          has received the {ticket.eventTitle} ticket
        </p>
      </div>

      <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center justify-center gap-2">
          <Mail className="h-4 w-4" />
          <span>Confirmation sent to recipient</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Ownership transferred on blockchain</span>
        </div>
      </div>
    </motion.div>
  );

  const modalContent = (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col ${
          isDark 
            ? 'glass-card border-border/50 backdrop-blur-xl bg-card/90' 
            : 'bg-white border border-gray-200 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        {step !== 'success' && (
          <Button
            variant="ghost"
            onClick={onClose}
            className={`absolute top-3 right-3 z-10 h-8 w-8 p-0 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            ✕
          </Button>
        )}
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto scrollbar-hide p-6 flex-1">
          {step === 'details' && renderDetailsStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </motion.div>
    </div>
  );

  // Use portal to render modal at document body level
  if (!mounted) return null;
  
  return createPortal(modalContent, document.body);
}