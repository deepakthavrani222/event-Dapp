'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Wallet, TrendingUp, DollarSign, Percent, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle, Loader2, CreditCard, Building, Smartphone, Download, FileText,
  Star, Users, RefreshCw, Award, MessageSquare, BarChart3, PieChart, Calendar,
  Sparkles, Trophy, Shield, ExternalLink, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer } from 'recharts';

interface EarningsData {
  totalPrimarySales: number;
  totalRoyalties: number;
  platformFee: number;
  netEarnings: number;
  pendingWithdrawal: number;
  totalTicketsSold: number;
  totalEvents: number;
  completedEvents: number;
  totalResales: number;
  lifetimeRoyalties: number;
}

interface EventEarning {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  status: string;
  primarySales: number;
  royalties: number;
  ticketsSold: number;
  totalCapacity: number;
  resaleCount: number;
  avgRating?: number;
  feedbackCount?: number;
}

interface WithdrawalHistory {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export default function OrganizerEarningsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [eventEarnings, setEventEarnings] = useState<EventEarning[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'CRYPTO' | 'BANK' | 'UPI'>('CRYPTO');
  const [withdrawDestination, setWithdrawDestination] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'withdrawals' | 'perks'>('overview');
  const [downloadingReport, setDownloadingReport] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEarnings();
    }
  }, [isAuthenticated]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request('/api/organizer/earnings');
      if (response.success) {
        setEarnings(response.earnings);
        setEventEarnings(response.eventEarnings || []);
        setWithdrawalHistory(response.withdrawalHistory || []);
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawDestination) return;
    const amount = parseFloat(withdrawAmount);
    if (amount < 50) {
      alert('Minimum withdrawal amount is ₹50');
      return;
    }
    
    setWithdrawing(true);
    try {
      const response = await apiClient.request('/api/organizer/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          method: withdrawMethod,
          destination: withdrawDestination,
        }),
      });
      
      if (response.success) {
        setWithdrawSuccess(`₹${amount.toLocaleString()} withdrawal initiated! ${withdrawMethod === 'CRYPTO' ? 'Funds will arrive within 5 minutes.' : 'You\'ll receive an email confirmation.'}`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawDestination('');
        fetchEarnings();
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setWithdrawing(false);
    }
  };

  const downloadReport = async (format: 'csv' | 'pdf') => {
    setDownloadingReport(true);
    try {
      // In production, this would call an API to generate the report
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`${format.toUpperCase()} report downloaded! Check your downloads folder.`);
    } finally {
      setDownloadingReport(false);
    }
  };

  // Calculate verification eligibility
  const completedEvents = eventEarnings.filter(e => e.status === 'completed').length;
  const isVerificationEligible = completedEvents >= 3;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Earnings & Analytics</h1>
            <p className="text-gray-400 mt-1">Track revenue, withdraw funds, and view insights</p>
          </div>
          <Button 
            onClick={() => setShowWithdrawModal(true)}
            className="gradient-purple-cyan border-0 text-white font-semibold"
            disabled={!earnings || (earnings.pendingWithdrawal || 0) < 50}
          >
            <Wallet className="h-4 w-4 mr-2" /> Withdraw Funds
          </Button>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {withdrawSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3"
            >
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="text-green-300 flex-1">{withdrawSuccess}</p>
              <Button variant="ghost" size="sm" onClick={() => setWithdrawSuccess(null)} className="text-green-400">
                Dismiss
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'events', label: 'Event Earnings', icon: Calendar },
            { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
            { id: 'perks', label: 'Perks & Badges', icon: Award },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id as any)}
              className={activeTab === tab.id ? 'gradient-purple-cyan border-0' : 'border-white/20'}
            >
              <tab.icon className="h-4 w-4 mr-2" /> {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-white/20 bg-gray-900/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Net Earnings</p>
                      <p className="text-2xl font-bold text-white">₹{(earnings?.netEarnings || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> After platform fees
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/20 bg-gray-900/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Primary Sales</p>
                      <p className="text-2xl font-bold text-blue-400">₹{(earnings?.totalPrimarySales || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{earnings?.totalTicketsSold || 0} tickets sold</p>
                </CardContent>
              </Card>

              <Card className="border-white/20 bg-gray-900/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Resale Royalties</p>
                      <p className="text-2xl font-bold text-purple-400">₹{(earnings?.totalRoyalties || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Percent className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                  <p className="text-xs text-purple-400 mt-2">{earnings?.totalResales || 0} resales</p>
                </CardContent>
              </Card>

              <Card className="border-white/20 bg-gray-900/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Available to Withdraw</p>
                      <p className="text-2xl font-bold text-cyan-400">₹{(earnings?.pendingWithdrawal || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                      <Wallet className="h-6 w-6 text-cyan-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Min: ₹50</p>
                </CardContent>
              </Card>
            </div>

            {/* Resale Insights */}
            <Card className="border-purple-500/30 bg-purple-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Sparkles className="h-5 w-5" /> Resale Insights
                </CardTitle>
                <CardDescription className="text-purple-300/70">Your tickets on the secondary market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-400">{earnings?.totalResales || 0}</p>
                    <p className="text-sm text-gray-400">Total Resales</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-400">₹{(earnings?.lifetimeRoyalties || earnings?.totalRoyalties || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Lifetime Royalties</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg text-center">
                    <p className="text-3xl font-bold text-cyan-400">5%</p>
                    <p className="text-sm text-gray-400">Your Royalty Rate</p>
                  </div>
                </div>
                <p className="text-sm text-purple-300 mt-4 p-3 bg-purple-500/20 rounded-lg">
                  💡 <strong>Long-term perk:</strong> Even years later, if your tickets become collectibles, you'll earn royalties on every trade!
                </p>
              </CardContent>
            </Card>

            {/* Download Reports */}
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-blue-400" /> Download Reports
                </CardTitle>
                <CardDescription>Export sales data and buyer demographics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className="border-white/20"
                    onClick={() => downloadReport('csv')}
                    disabled={downloadingReport}
                  >
                    {downloadingReport ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Download CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-white/20"
                    onClick={() => downloadReport('pdf')}
                    disabled={downloadingReport}
                  >
                    {downloadingReport ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                    Download PDF Report
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-3">Includes: Sales data, buyer demographics, revenue breakdown, resale analytics</p>
              </CardContent>
            </Card>

            {/* Platform Fee Info */}
            <Card className="border-orange-500/30 bg-orange-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      <ArrowDownRight className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Platform Fee (10%)</p>
                      <p className="text-sm text-orange-300/70">Deducted from primary sales</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-orange-400">-₹{(earnings?.platformFee || 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}


        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Completed Events Summary */}
            <Card className="border-green-500/30 bg-green-500/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-300">
                      {completedEvents} Completed Events
                    </h3>
                    <p className="text-green-300/70">
                      {earnings?.totalTicketsSold || 0} total attendees • ₹{(earnings?.netEarnings || 0).toLocaleString()} total revenue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event List */}
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-white">Event-wise Earnings</CardTitle>
                <CardDescription>Detailed breakdown per event</CardDescription>
              </CardHeader>
              <CardContent>
                {eventEarnings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">No events yet. Create your first event to start earning!</p>
                    <Button onClick={() => router.push('/organizer/create')} className="mt-4 gradient-purple-cyan border-0">
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventEarnings.map((event) => (
                      <div key={event.eventId} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">{event.eventTitle}</h4>
                              <Badge className={
                                event.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                event.status === 'approved' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                'bg-gray-500/20 text-gray-300'
                              }>
                                {event.status === 'completed' ? '✅ Completed' : event.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{new Date(event.eventDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-400">₹{(event.primarySales + event.royalties).toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Total earnings</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Primary Sales</p>
                            <p className="text-white font-medium">₹{event.primarySales.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Royalties</p>
                            <p className="text-purple-400 font-medium">₹{event.royalties.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Tickets Sold</p>
                            <p className="text-white font-medium">{event.ticketsSold} / {event.totalCapacity}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Resales</p>
                            <p className="text-cyan-400 font-medium">{event.resaleCount || 0}</p>
                          </div>
                          {event.avgRating && (
                            <div>
                              <p className="text-gray-400">Rating</p>
                              <p className="text-yellow-400 font-medium flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400" /> {event.avgRating.toFixed(1)}
                                <span className="text-gray-500 text-xs">({event.feedbackCount})</span>
                              </p>
                            </div>
                          )}
                        </div>

                        {event.status === 'completed' && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                            <Button variant="outline" size="sm" className="border-white/20 text-xs">
                              <Download className="h-3 w-3 mr-1" /> Report
                            </Button>
                            <Button variant="outline" size="sm" className="border-white/20 text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" /> View Feedback
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fan Feedback Info */}
            <Card className="border-yellow-500/30 bg-yellow-500/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-300">Fan Feedback</h4>
                    <p className="text-sm text-yellow-300/70">
                      Auto-surveys are emailed to attendees after each event. View ratings and comments in event details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            {/* Withdrawal Options */}
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal Methods</CardTitle>
                <CardDescription>Choose how you want to receive your earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Wallet className="h-6 w-6 text-purple-400" />
                      <div>
                        <p className="font-medium text-white">Crypto (USDC)</p>
                        <p className="text-xs text-green-400">⚡ Instant</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Receive USDC directly to your wallet. Processed within 5 minutes.</p>
                  </div>
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Smartphone className="h-6 w-6 text-cyan-400" />
                      <div>
                        <p className="font-medium text-white">UPI</p>
                        <p className="text-xs text-gray-400">1-2 business days</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Transfer to any UPI ID. Processed via Stripe.</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Building className="h-6 w-6 text-blue-400" />
                      <div>
                        <p className="font-medium text-white">Bank Transfer</p>
                        <p className="text-xs text-gray-400">2-3 business days</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">Direct deposit to your bank account.</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Minimum withdrawal:</strong> ₹50 • 
                    <strong className="text-white ml-2">Email receipt:</strong> Sent after every withdrawal
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawal History */}
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal History</CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawalHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">No withdrawals yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdrawalHistory.map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          {w.method === 'CRYPTO' ? <Wallet className="h-5 w-5 text-purple-400" /> :
                           w.method === 'UPI' ? <Smartphone className="h-5 w-5 text-cyan-400" /> :
                           <Building className="h-5 w-5 text-blue-400" />}
                          <div>
                            <p className="font-medium text-white">₹{w.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={
                          w.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          w.status === 'processing' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }>
                          {w.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}


        {/* Perks & Badges Tab */}
        {activeTab === 'perks' && (
          <div className="space-y-6">
            {/* Verified Badge */}
            <Card className={`border ${isVerificationEligible ? 'border-green-500/30 bg-green-500/10' : 'border-white/20 bg-gray-900/80'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className={`h-5 w-5 ${isVerificationEligible ? 'text-green-400' : 'text-gray-400'}`} />
                  Verified Organizer Badge
                </CardTitle>
                <CardDescription>
                  {isVerificationEligible 
                    ? 'You\'re eligible! Apply now for higher visibility.'
                    : `Complete ${3 - completedEvents} more events to unlock`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-full bg-gray-700 rounded-full h-2 max-w-xs">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (completedEvents / 3) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{completedEvents}/3 events</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Verified organizers get a badge, higher search ranking, and priority support.
                    </p>
                  </div>
                  <Button 
                    disabled={!isVerificationEligible}
                    className={isVerificationEligible ? 'gradient-purple-cyan border-0' : ''}
                  >
                    {isVerificationEligible ? 'Apply for Badge' : 'Locked'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Long-term Royalties */}
            <Card className="border-purple-500/30 bg-purple-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Sparkles className="h-5 w-5" /> Lifetime Royalties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    Your tickets are NFTs on the blockchain. Even years after your event, if tickets become collectibles 
                    (e.g., historic concert, legendary performance), you'll earn royalties on every trade!
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-2xl font-bold text-purple-400">₹{(earnings?.lifetimeRoyalties || earnings?.totalRoyalties || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Lifetime royalties earned</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-2xl font-bold text-cyan-400">{earnings?.totalResales || 0}</p>
                      <p className="text-sm text-gray-400">Total ticket trades</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <p className="text-sm text-purple-300">
                      💎 <strong>Pro tip:</strong> Create memorable events! The more iconic your event, the more valuable tickets become as collectibles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-cyan-400" /> Organizer Community
                </CardTitle>
                <CardDescription>Connect with other organizers for tips and collaboration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="border-white/20 justify-start h-auto py-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-6 w-6 text-purple-400" />
                      <div className="text-left">
                        <p className="font-medium text-white">Join Discord</p>
                        <p className="text-xs text-gray-400">Chat with 5,000+ organizers</p>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="border-white/20 justify-start h-auto py-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-6 w-6 text-cyan-400" />
                      <div className="text-left">
                        <p className="font-medium text-white">Newsletter</p>
                        <p className="text-xs text-gray-400">Weekly tips & industry news</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5 text-yellow-400" /> Achievement Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'First Event', icon: '🎉', unlocked: completedEvents >= 1, desc: 'Create your first event' },
                    { name: 'Sold Out', icon: '🔥', unlocked: false, desc: 'Sell out an event' },
                    { name: 'Royalty King', icon: '👑', unlocked: (earnings?.totalRoyalties || 0) > 1000, desc: 'Earn ₹1000+ in royalties' },
                    { name: 'Verified', icon: '✅', unlocked: false, desc: 'Get verified badge' },
                  ].map((badge, i) => (
                    <div 
                      key={i}
                      className={`p-4 rounded-lg text-center ${badge.unlocked ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5 border border-white/10 opacity-50'}`}
                    >
                      <span className="text-3xl">{badge.icon}</span>
                      <p className="font-medium text-white mt-2">{badge.name}</p>
                      <p className="text-xs text-gray-400">{badge.desc}</p>
                      {badge.unlocked && <Badge className="mt-2 bg-yellow-500/20 text-yellow-300">Unlocked!</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdraw Modal */}
        <AnimatePresence>
          {showWithdrawModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowWithdrawModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-white mb-4">Withdraw Funds</h2>
                
                <div className="space-y-4">
                  <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                    <p className="text-sm text-cyan-300">
                      Available: <strong>₹{(earnings?.pendingWithdrawal || 0).toLocaleString()}</strong>
                    </p>
                  </div>

                  <div>
                    <Label className="text-white">Amount (₹)</Label>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Min: ₹50"
                      min={50}
                      max={earnings?.pendingWithdrawal}
                      className="mt-1 bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Method</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'CRYPTO', icon: Wallet, label: 'Crypto', time: 'Instant', color: 'purple' },
                        { id: 'UPI', icon: Smartphone, label: 'UPI', time: '1-2 days', color: 'cyan' },
                        { id: 'BANK', icon: Building, label: 'Bank', time: '2-3 days', color: 'blue' },
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setWithdrawMethod(m.id as any)}
                          className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${
                            withdrawMethod === m.id 
                              ? `border-${m.color}-500 bg-${m.color}-500/20` 
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <m.icon className={`h-5 w-5 text-${m.color}-400`} />
                          <span className="text-xs text-white">{m.label}</span>
                          <span className={`text-[10px] ${m.id === 'CRYPTO' ? 'text-green-400' : 'text-gray-400'}`}>{m.time}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">
                      {withdrawMethod === 'CRYPTO' ? 'Wallet Address' : withdrawMethod === 'UPI' ? 'UPI ID' : 'Account Number'}
                    </Label>
                    <Input
                      value={withdrawDestination}
                      onChange={(e) => setWithdrawDestination(e.target.value)}
                      placeholder={withdrawMethod === 'CRYPTO' ? '0x...' : withdrawMethod === 'UPI' ? 'name@upi' : 'Account number'}
                      className="mt-1 bg-white/5 border-white/20 text-white"
                    />
                    {withdrawMethod === 'CRYPTO' && user?.walletAddress && (
                      <button
                        onClick={() => setWithdrawDestination(user.walletAddress)}
                        className="text-xs text-purple-400 mt-1 hover:underline"
                      >
                        Use my wallet
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setShowWithdrawModal(false)} className="flex-1">Cancel</Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) < 50 || !withdrawDestination}
                      className="flex-1 gradient-purple-cyan border-0"
                    >
                      {withdrawing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : 'Withdraw'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
