'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Link as LinkIcon, DollarSign, Users, Copy, Check } from 'lucide-react';
import { CreateReferralDialog } from '@/components/promoter/CreateReferralDialog';

export default function PromoterDashboardPage() {
  const [earnings, setEarnings] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [earningsRes, referralsRes] = await Promise.all([
        apiClient.request('/api/promoter/earnings'),
        apiClient.request('/api/promoter/referrals'),
      ]);

      if (earningsRes.success) {
        setEarnings(earningsRes);
      }
      if (referralsRes.success) {
        setReferrals(referralsRes.referrals || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateReferralLink = (code: string) => {
    return `${window.location.origin}/buyer?ref=${code}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const summary = earnings?.summary || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Promoter Dashboard</h1>
          <p className="text-muted-foreground">
            Track your referrals and earnings
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <LinkIcon className="h-4 w-4 mr-2" />
          Create Referral Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(summary.totalEarnings || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {summary.totalReferrals || 0} referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.activeReferralCodes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Referral codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalReferrals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successful purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(summary.averageCommission || 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per referral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Codes */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Referral Codes</CardTitle>
          <CardDescription>
            Share these codes to earn commission on ticket sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No referral codes yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Code
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-lg font-bold bg-muted px-3 py-1 rounded">
                        {ref.code}
                      </code>
                      <Badge variant={ref.isActive ? 'default' : 'secondary'}>
                        {ref.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {ref.commissionRate}% commission
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{ref.usageCount || 0} uses</span>
                      <span>₹{(ref.totalEarnings || 0).toLocaleString()} earned</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyReferralCode(ref.code)}
                    >
                      {copiedCode === ref.code ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyReferralCode(generateReferralLink(ref.code))}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings by Event */}
      {earnings?.earningsByEvent && earnings.earningsByEvent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Earnings by Event</CardTitle>
            <CardDescription>
              Commission breakdown per event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earnings.earningsByEvent.map((event: any) => (
                <div key={event.eventId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.eventTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.referrals} referrals
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₹{event.earnings.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showCreateDialog && (
        <CreateReferralDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            setShowCreateDialog(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
