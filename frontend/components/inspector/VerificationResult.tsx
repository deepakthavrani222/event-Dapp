'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User,
  Ticket,
  MapPin,
  Calendar,
  Shield,
  Sparkles,
  ScanLine,
  Clock
} from 'lucide-react';

interface VerificationResultProps {
  result: {
    success: boolean;
    status: string;
    ticket?: {
      id: string;
      tokenId: string;
      ticketType: string;
      seatNumber?: string;
      ownerName: string;
      checkedInAt?: string;
    };
    event?: {
      title: string;
      venue: {
        name: string;
        city: string;
      };
      date: string;
    };
    error?: string;
    usedAt?: string;
    verificationTime?: string;
  };
  onScanNext: () => void;
  onClose: () => void;
}

export function VerificationResult({ result, onScanNext, onClose }: VerificationResultProps) {
  const [showFullScreen, setShowFullScreen] = useState(result.success);

  useEffect(() => {
    if (result.success) {
      // Vibrate phone for haptic feedback on success
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      // Auto-hide fullscreen after 4 seconds
      const timer = setTimeout(() => {
        setShowFullScreen(false);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      // Error vibration pattern
      if ('vibrate' in navigator) {
        navigator.vibrate([500]);
      }
    }
  }, [result.success]);

  // Full-screen bright green WELCOME screen for valid tickets
  if (showFullScreen && result.success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="h-full flex flex-col items-center justify-center p-8 text-center"
        >
          {/* Giant Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mb-8"
          >
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="h-32 w-32 text-green-500" />
            </div>
            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 w-48 h-48 bg-white/30 rounded-full"
            />
          </motion.div>

          {/* WELCOME Message */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-lg">
              WELCOME!
            </h1>
            
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-300" />
              <p className="text-3xl md:text-4xl text-white font-bold">
                {result.ticket?.ownerName}
              </p>
              <Sparkles className="h-8 w-8 text-yellow-300" />
            </div>
          </motion.div>

          {/* Ticket Info */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white/20 backdrop-blur-sm rounded-3xl p-6 max-w-lg"
          >
            <div className="space-y-3 text-white">
              <h2 className="text-2xl font-bold">{result.event?.title}</h2>
              <div className="flex items-center justify-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  <span>{result.ticket?.ticketType}</span>
                </div>
                {result.ticket?.seatNumber && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Seat: {result.ticket.seatNumber}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span>{result.event?.venue.name}, {result.event?.venue.city}</span>
              </div>
            </div>
          </motion.div>

          {/* Verified Badge */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-center gap-2 text-white/90"
          >
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Blockchain Verified</span>
            <CheckCircle className="h-5 w-5" />
          </motion.div>

          {/* Tap to continue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8"
          >
            <Button
              onClick={() => setShowFullScreen(false)}
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 px-8 py-4 text-lg font-semibold rounded-full"
            >
              Tap to Continue
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Invalid ticket - Red error screen
  if (!result.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-8 text-center space-y-6"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center">
            {result.status === 'ALREADY_USED' ? (
              <AlertTriangle className="h-14 w-14 text-yellow-500" />
            ) : (
              <XCircle className="h-14 w-14 text-red-500" />
            )}
          </div>
        </motion.div>

        {/* Error Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">
            {result.status === 'ALREADY_USED' ? 'ALREADY USED' : 'INVALID TICKET'}
          </h2>
          <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-1">
            {result.status}
          </Badge>
        </div>

        {/* Error Details */}
        <div className="bg-white/10 rounded-xl p-4 text-white/90">
          <p className="text-lg">{result.error || 'This ticket cannot be verified'}</p>
          {result.usedAt && (
            <p className="mt-2 text-sm text-white/70">
              Previously used: {new Date(result.usedAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onScanNext}
            className="w-full bg-white text-red-600 hover:bg-white/90 font-bold h-14 text-lg rounded-xl"
          >
            <ScanLine className="h-5 w-5 mr-2" />
            Scan Next Ticket
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10 h-12 rounded-xl"
          >
            Close
          </Button>
        </div>
      </motion.div>
    );
  }

  // Compact success view (after fullscreen dismisses)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-center space-y-4"
    >
      {/* Success Icon */}
      <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>

      {/* Verified Message */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Verified ✓</h2>
        <p className="text-white/80">{result.ticket?.ownerName}</p>
      </div>

      {/* Ticket Details */}
      <div className="bg-white/10 rounded-xl p-4 text-white text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-white/70">Event</span>
          <span className="font-semibold">{result.event?.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Type</span>
          <span className="font-semibold">{result.ticket?.ticketType}</span>
        </div>
        {result.ticket?.seatNumber && (
          <div className="flex justify-between">
            <span className="text-white/70">Seat</span>
            <span className="font-semibold">{result.ticket.seatNumber}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-white/70">Token ID</span>
          <span className="font-mono text-xs">{result.ticket?.tokenId}</span>
        </div>
        {result.verificationTime && (
          <div className="flex justify-between">
            <span className="text-white/70">Verified in</span>
            <span className="font-semibold">{result.verificationTime}</span>
          </div>
        )}
      </div>

      {/* Blockchain Badge */}
      <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
        <Shield className="h-4 w-4" />
        <span>Marked as used on blockchain</span>
      </div>

      {/* Actions */}
      <Button
        onClick={onScanNext}
        className="w-full bg-white text-green-600 hover:bg-white/90 font-bold h-12 rounded-xl"
      >
        <ScanLine className="h-5 w-5 mr-2" />
        Scan Next Ticket
      </Button>
    </motion.div>
  );
}