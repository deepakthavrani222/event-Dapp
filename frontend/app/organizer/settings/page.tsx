'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, User, Shield, Bell, Key, Smartphone, 
  Mail, Loader2, Check, AlertTriangle,
  LogOut, Trash2, Download, History
} from 'lucide-react';
import { TwoFactorAuth } from '@/components/shared/two-factor-auth';
import { OrganizerBadges, OrganizerBadgeDisplay } from '@/components/shared/organizer-badges';
import { motion } from 'framer-motion';

export default function OrganizerSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'badges'>('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Security state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailSales: true,
    emailRoyalties: true,
    emailUpdates: true,
    pushSales: true,
    pushRoyalties: false,
  });

  // Mock organizer stats for badges
  const organizerStats = {
    completedEvents: 5,
    totalTicketsSold: 1250,
    totalRevenue: 125000,
    avgRating: 4.6,
    totalRoyalties: 8500,
    isVerified: true,
    isFeatured: false,
    hasPriorityApproval: false,
  };

  // Mock activity log
  const activityLog = [
    { action: 'Login', device: 'Chrome on Windows', location: 'Mumbai, IN', time: '2 hours ago' },
    { action: 'Password changed', device: 'Chrome on Windows', location: 'Mumbai, IN', time: '3 days ago' },
    { action: 'Login', device: 'Safari on iPhone', location: 'Delhi, IN', time: '5 days ago' },
    { action: '2FA enabled', device: 'Chrome on Windows', location: 'Mumbai, IN', time: '1 week ago' },
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.name || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (confirm('This will log you out from all devices. Continue?')) {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        logout();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('All your events, earnings, and data will be permanently deleted. Type "DELETE" to confirm.')) {
        // In production, would require typing "DELETE"
        alert('Account deletion request submitted. You will receive a confirmation email.');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-white hover:bg-white/10">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account and preferences</p>
          </div>
          <OrganizerBadgeDisplay 
            isVerified={organizerStats.isVerified}
            isFeatured={organizerStats.isFeatured}
            hasPriorityApproval={organizerStats.hasPriorityApproval}
          />
        </div>

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2"
          >
            <Check className="h-5 w-5 text-green-400" />
            <span className="text-green-300">Settings saved successfully!</span>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'badges', label: 'Badges & Perks', icon: Key },
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Phone</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Wallet Address</Label>
                    <Input
                      value={user?.walletAddress || ''}
                      readOnly
                      className="bg-white/5 border-white/20 text-gray-400 font-mono text-sm"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={loading} className="gradient-purple-cyan border-0">
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-500/30 bg-red-500/10">
              <CardHeader>
                <CardTitle className="text-red-300">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Log out all devices</p>
                    <p className="text-sm text-gray-400">Sign out from all sessions</p>
                  </div>
                  <Button variant="outline" onClick={handleLogoutAllDevices} className="border-red-500/50 text-red-400">
                    <LogOut className="h-4 w-4 mr-2" /> Log Out All
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Delete account</p>
                    <p className="text-sm text-gray-400">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* 2FA */}
            <TwoFactorAuth 
              isEnabled={is2FAEnabled}
              onEnable={() => setIs2FAEnabled(true)}
              onDisable={() => setIs2FAEnabled(false)}
            />

            {/* Password */}
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Key className="h-5 w-5 text-purple-400" />
                  Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="border-white/20">
                  Change Password
                </Button>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <History className="h-5 w-5 text-cyan-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Review your account activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLog.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{activity.action}</p>
                        <p className="text-xs text-gray-400">{activity.device} • {activity.location}</p>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 border-white/20">
                  <Download className="h-4 w-4 mr-2" /> Download Full Log
                </Button>
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card className="border-yellow-500/30 bg-yellow-500/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-300">Security Tips</p>
                    <ul className="text-sm text-yellow-300/70 mt-2 space-y-1">
                      <li>• Enable 2FA for maximum protection</li>
                      <li>• Never share your recovery codes</li>
                      <li>• Use a unique password for TicketChain</li>
                      <li>• Review activity log regularly</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Mail className="h-5 w-5 text-blue-400" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailSales', label: 'Ticket sales', desc: 'Get notified when someone buys a ticket' },
                  { key: 'emailRoyalties', label: 'Royalty earnings', desc: 'Get notified when you earn royalties' },
                  { key: 'emailUpdates', label: 'Platform updates', desc: 'News and feature announcements' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-gray-900/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Smartphone className="h-5 w-5 text-green-400" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'pushSales', label: 'Ticket sales', desc: 'Real-time alerts for sales' },
                  { key: 'pushRoyalties', label: 'Royalty earnings', desc: 'Real-time alerts for royalties' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <OrganizerBadges stats={organizerStats} />
        )}
      </div>
    </div>
  );
}
