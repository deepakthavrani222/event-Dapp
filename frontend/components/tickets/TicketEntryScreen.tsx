'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  ArrowLeft, 
  Maximize2,
  Sun,
  Volume2,
  CheckCircle,
  MapPin,
  Calendar,
  Clock,
  User,
  Ticket,
  Shield,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface TicketEntryScreenProps {
  ticket: {
    id: string;
    eventTitle: string;
    eventImage: string;
    venue: string;
    city: string;
    date: string;
    seatNumber?: string;
    ticketType: string;
    qrCode: string;
    ownerName: string;
    tokenId: string;
  };
  onBack: () => void;
}

export function TicketEntryScreen({ ticket, onBack }: TicketEntryScreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [isVerified, setIsVerified] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Auto-maximize brightness for QR visibility
  useEffect(() => {
    setBrightness(100);
    // Request screen wake lock to prevent screen from sleeping
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch(console.error);
    }
  }, []);

  // Simulate verification (in real app, this would be triggered by inspector scan)
  const simulateVerification = () => {
    setIsVerified(true);
    setShowWelcome(true);
    
    // Vibrate phone for haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Auto-hide welcome after 5 seconds
    setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Welcome screen after successful scan
  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-center space-y-8 p-8"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="h-24 w-24 text-green-500" />
            </div>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 w-40 h-40 mx-auto bg-white/30 rounded-full"
            />
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-black text-white">
              WELCOME!
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-300" />
              <p className="text-2xl text-white/90 font-semibold">
                Enjoy the show, {ticket.ownerName}!
              </p>
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
          </motion.div>

          {/* Event Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto"
          >
            <h2 className="text-xl font-bold text-white mb-2">{ticket.eventTitle}</h2>
            <div className="flex items-center justify-center gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{ticket.venue}</span>
              </div>
              {ticket.seatNumber && (
                <div className="flex items-center gap-1">
                  <Ticket className="h-4 w-4" />
                  <span>Seat: {ticket.seatNumber}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Verified Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-2 text-white/80"
          >
            <Shield className="h-5 w-5" />
            <span>Ticket verified on blockchain</span>
            <CheckCircle className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/10"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <Sun className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        {/* Event Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {ticket.eventTitle}
          </h1>
          <div className="flex items-center justify-center gap-4 text-gray-300 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{ticket.venue}, {ticket.city}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-gray-300 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(ticket.date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(ticket.date), 'h:mm a')}</span>
            </div>
          </div>
        </motion.div>

        {/* HUGE QR Code */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative"
        >
          {/* QR Container */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl">
            <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center bg-white">
              {/* QR Code - In real app, use actual QR library */}
              <div className="relative w-full h-full">
                <QrCode className="w-full h-full text-black" strokeWidth={0.5} />
                {/* Center logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Ticket className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated border */}
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.5)',
                '0 0 40px rgba(6, 182, 212, 0.5)',
                '0 0 20px rgba(139, 92, 246, 0.5)'
              ]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-3xl pointer-events-none"
          />

          {/* Verified badge */}
          {isVerified && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-3 -right-3 bg-green-500 rounded-full p-2"
            >
              <CheckCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </motion.div>

        {/* Show to Staff Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-2xl p-6">
            <p className="text-2xl md:text-3xl font-bold text-white mb-2">
              📱 Show to Staff
            </p>
            <p className="text-gray-300">
              Hold your phone steady for scanning
            </p>
          </div>

          {/* Ticket Details */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-gray-400">Ticket Type</p>
              <p className="text-white font-semibold">{ticket.ticketType}</p>
            </div>
            {ticket.seatNumber && (
              <div className="text-center">
                <p className="text-gray-400">Seat</p>
                <p className="text-white font-semibold">{ticket.seatNumber}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-gray-400">Attendee</p>
              <p className="text-white font-semibold">{ticket.ownerName}</p>
            </div>
          </div>
        </motion.div>

        {/* Token ID (small, for verification) */}
        <div className="text-center">
          <p className="text-xs text-gray-500 font-mono">
            Token ID: {ticket.tokenId}
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 bg-black/50 space-y-3">
        {/* Demo: Simulate verification */}
        <Button
          onClick={simulateVerification}
          className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-bold text-lg rounded-xl"
        >
          <Volume2 className="h-5 w-5 mr-2" />
          Demo: Simulate Scan
        </Button>
        
        <p className="text-center text-xs text-gray-500">
          Screen brightness maximized for better scanning
        </p>
      </div>
    </div>
  );
}