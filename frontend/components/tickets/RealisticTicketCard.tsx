'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  Gift, 
  DollarSign, 
  Download, 
  Calendar,
  MapPin,
  Crown,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from '@/lib/context/ThemeContext';

interface TicketData {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  venue: string;
  city: string;
  date: string;
  seatNumber?: string;
  ticketType: string;
  price: number;
  qrCode: string;
  status: 'upcoming' | 'past' | 'used';
  transferable: boolean;
  resellable: boolean;
  isGolden?: boolean;
  perks?: string[];
}

interface RealisticTicketCardProps {
  ticket: TicketData;
  onShowQR: () => void;
  onGift: () => void;
  onResell: () => void;
  onDownload: () => void;
  ownerName?: string;
}

export function RealisticTicketCard({ 
  ticket, 
  onShowQR, 
  onGift, 
  onResell, 
  onDownload,
}: RealisticTicketCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isGolden = ticket.isGolden || ticket.ticketType.toLowerCase().includes('golden') || ticket.ticketType.toLowerCase().includes('vip');

  const getCountdown = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event.getTime() - now.getTime();
    if (diff <= 0) return 'Passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  // Golden/VIP Ticket
  if (isGolden) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-400 to-orange-400 rounded-xl overflow-hidden shadow-lg">
          <div className="flex h-[120px]">
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Crown className="h-3.5 w-3.5 text-black" />
                  <span className="text-[10px] font-bold text-black/70 uppercase">Golden VIP</span>
                </div>
                <h3 className="text-sm font-bold text-black leading-tight line-clamp-2">{ticket.eventTitle}</h3>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-black/70">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(ticket.date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-black/70">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{ticket.venue}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-black/60">{ticket.seatNumber || 'VIP Access'}</span>
                <span className="font-bold text-black text-sm">₹{ticket.price.toLocaleString()}</span>
              </div>
            </div>
            <div className="relative w-5 flex items-center">
              <div className="absolute top-0 left-1/2 w-4 h-4 bg-background rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="h-full border-l-2 border-dashed border-black/20" />
              <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-background rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="w-[100px] p-3 flex flex-col items-center justify-center bg-black/10">
              <p className="text-[9px] text-black/60 font-semibold mb-1">SCAN TO ENTER</p>
              <div className="bg-white p-1.5 rounded-lg shadow-inner">
                <QrCode className="w-14 h-14 text-black" />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 mt-2">
          <Button onClick={onShowQR} size="sm" className="flex-1 h-8 text-xs bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
            <QrCode className="h-3.5 w-3.5 mr-1" />Show QR
          </Button>
          {ticket.transferable && (
            <Button onClick={onGift} size="sm" variant="outline" className={`h-8 px-3 ${
              isDark 
                ? 'border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10' 
                : 'border-yellow-600 text-yellow-700 hover:bg-yellow-50'
            }`}>
              <Gift className="h-3.5 w-3.5" />
            </Button>
          )}
          {ticket.resellable && (
            <Button onClick={onResell} size="sm" variant="outline" className={`h-8 px-3 ${
              isDark 
                ? 'border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10' 
                : 'border-yellow-600 text-yellow-700 hover:bg-yellow-50'
            }`}>
              <DollarSign className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button onClick={onDownload} size="sm" variant="outline" className={`h-8 px-3 ${
            isDark 
              ? 'border-white/20 text-white hover:bg-white/10' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Regular Ticket
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <div className={`rounded-xl overflow-hidden shadow-lg ${
        isDark 
          ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500" />
        <div className="flex h-[120px]">
          <div className="w-[100px] relative flex-shrink-0">
            <img src={ticket.eventImage} alt={ticket.eventTitle} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-transparent to-gray-900/80' : 'bg-gradient-to-r from-transparent to-white/60'}`} />
            {ticket.status === 'upcoming' && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-green-500 text-white border-0 text-[9px] px-1.5 py-0.5 font-semibold">
                  {getCountdown(ticket.date)}
                </Badge>
              </div>
            )}
            {ticket.status === 'past' && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-gray-500 text-white border-0 text-[9px] px-1.5 py-0.5">Past</Badge>
              </div>
            )}
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Badge className={`text-[9px] px-1.5 py-0 ${
                  isDark 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                    : 'bg-purple-100 text-purple-700 border-purple-200'
                }`}>
                  <CheckCircle className="h-2.5 w-2.5 mr-0.5" />NFT
                </Badge>
                <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{ticket.ticketType}</span>
              </div>
              <h3 className={`text-sm font-bold leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.eventTitle}</h3>
              <div className={`flex items-center gap-1.5 mt-1.5 text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className={`h-3 w-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <span>{format(new Date(ticket.date), 'MMM dd, yyyy • h:mm a')}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <MapPin className={`h-3 w-3 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span className="truncate">{ticket.venue}, {ticket.city}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{ticket.seatNumber || 'General'}</span>
              <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{ticket.price.toLocaleString()}</span>
            </div>
          </div>
          <div className="relative w-4 flex items-center">
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-background rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className={`h-full border-l-2 border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-background rounded-full -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className={`w-[90px] p-2 flex flex-col items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-[8px] font-semibold mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>SCAN TO ENTER</p>
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
              <QrCode className="w-12 h-12 text-gray-900" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-1.5 mt-2">
        <Button onClick={onShowQR} size="sm" className="flex-1 h-8 text-xs gradient-purple-cyan border-0 text-white font-semibold">
          <QrCode className="h-3.5 w-3.5 mr-1" />Show QR
        </Button>
        {ticket.transferable && (
          <Button onClick={onGift} size="sm" variant="outline" className={`h-8 px-3 ${
            isDark 
              ? 'border-white/20 text-white hover:bg-white/10' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}>
            <Gift className="h-3.5 w-3.5" />
          </Button>
        )}
        {ticket.resellable && (
          <Button onClick={onResell} size="sm" variant="outline" className={`h-8 px-3 ${
            isDark 
              ? 'border-white/20 text-white hover:bg-white/10' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}>
            <DollarSign className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button onClick={onDownload} size="sm" variant="outline" className={`h-8 px-3 ${
          isDark 
            ? 'border-white/20 text-white hover:bg-white/10' 
            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
        }`}>
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
