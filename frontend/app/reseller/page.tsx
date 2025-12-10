'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

export default function ResellerDashboard() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsRes, salesRes, metricsRes] = await Promise.all([
        apiClient.request('/api/reseller/listings'),
        apiClient.request('/api/reseller/sales'),
        apiClient.request('/api/reseller/metrics'),
      ]);

      if (listingsRes.success) {
        setListings(listingsRes.listings || []);
      }
      if (salesRes.success) {
        setSales(salesRes.sales || []);
      }
      if (metricsRes.success) {
        setMetrics(metricsRes.metrics);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reseller Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your ticket listings and track sales
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          List Ticket
        </Button>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Listings"
            value={metrics.activeListings || 0}
            icon={Package}
            color="text-blue-500"
          />
          <StatCard
            title="Total Sales"
            value={metrics.totalSales || 0}
            icon={ShoppingCart}
            color="text-green-500"
          />
          <StatCard
            title="Revenue"
            value={`₹${(metrics.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="text-purple-500"
          />
          <StatCard
            title="Success Rate"
            value={`${metrics.successRate || 0}%`}
            icon={TrendingUp}
            color="text-orange-500"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="listings">
            My Listings ({listings.length})
          </TabsTrigger>
          <TabsTrigger value="sales">
            Sales History ({sales.length})
          </TabsTrigger>
        </TabsList>

        {/* Listings Tab */}
        <TabsContent value="listings" className="space-y-4">
          {listings.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No listings yet</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            </Card>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{listing.event?.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {listing.event?.venue?.name} • {new Date(listing.event?.startDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      listing.status === 'ACTIVE' ? 'default' :
                      listing.status === 'SOLD' ? 'secondary' : 'outline'
                    }>
                      {listing.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Original Price: ₹{listing.originalPrice?.toLocaleString()}
                      </div>
                      <div className="text-lg font-bold">
                        Listed Price: ₹{listing.price?.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Token ID: {listing.tokenId}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {listing.status === 'ACTIVE' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          {sales.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No sales yet</p>
            </Card>
          ) : (
            sales.map((sale) => (
              <Card key={sale.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{sale.event?.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Sold to {sale.buyer?.name} • {new Date(sale.soldAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">SOLD</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Original Price: ₹{sale.originalPrice?.toLocaleString()}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        Sold Price: ₹{sale.soldPrice?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Profit: ₹{((sale.soldPrice || 0) - (sale.originalPrice || 0)).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Platform Fee</div>
                      <div className="font-semibold">₹{sale.platformFee?.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}