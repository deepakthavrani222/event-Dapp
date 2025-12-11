'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  DollarSign, 
  Shield, 
  Users, 
  Download, 
  Search,
  History,
  Plus,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle,
  Crown,
  Zap,
  Bell,
  Database,
  FileText,
  Filter,
  Calendar,
  Eye,
  Loader2,
  UserPlus,
  Mail,
  Wallet,
  Star
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { FeaturedArtistsManager } from './FeaturedArtistsManager';

interface PlatformSetting {
  id: string;
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isPublic: boolean;
  lastModifiedBy: any;
  lastModifiedAt: string;
  version: number;
}

interface AdminUser {
  id: string;
  user: any;
  email: string;
  walletAddress?: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  addedBy: any;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  category: string;
  entityType: string;
  entityId?: string;
  user: any;
  userEmail: string;
  userRole: string;
  details: any;
  severity: string;
  timestamp: string;
}

interface DataExport {
  id: string;
  type: string;
  format: string;
  status: string;
  fileName: string;
  fileSize?: number;
  recordCount?: number;
  requestedAt: string;
  completedAt?: string;
  fileUrl?: string;
  errorMessage?: string;
}

export function AdminSettingsDashboard() {
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [settings, setSettings] = useState<{ [category: string]: PlatformSetting[] }>({});
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [newSetting, setNewSetting] = useState({
    category: 'general',
    key: '',
    value: '',
    dataType: 'string' as const,
    description: '',
    isPublic: false
  });

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    walletAddress: '',
    role: 'admin',
    permissions: []
  });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilters, setAuditFilters] = useState({
    category: '',
    action: '',
    severity: '',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Data exports state
  const [exports, setExports] = useState<DataExport[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchSettings(),
        fetchAdminUsers(),
        fetchAuditLogs(),
        fetchExports()
      ]);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await apiClient.getAdminSettings();
      if (response.success) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await apiClient.getAdminUsers();
      if (response.success) {
        setAdminUsers(response.adminUsers);
      }
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await apiClient.getAuditLogs(auditFilters);
      if (response.success) {
        setAuditLogs(response.auditLogs);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const fetchExports = async () => {
    try {
      const response = await apiClient.getDataExports();
      if (response.success) {
        setExports(response.exports);
      }
    } catch (error) {
      console.error('Failed to fetch exports:', error);
    }
  };

  const handleSaveSetting = async (settingId: string, newValue: any) => {
    try {
      const setting = Object.values(settings).flat().find(s => s.id === settingId);
      if (!setting) return;

      const response = await apiClient.updateAdminSetting({
        category: setting.key.split('.')[0],
        key: setting.key,
        value: newValue,
        dataType: setting.dataType,
        description: setting.description,
        isPublic: setting.isPublic
      });

      if (response.success) {
        await fetchSettings();
        setEditingSetting(null);
        alert('Setting updated successfully!');
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
      alert('Failed to save setting');
    }
  };

  const handleAddAdmin = async () => {
    try {
      const response = await apiClient.addAdminUser(newAdmin);
      if (response.success) {
        await fetchAdminUsers();
        setShowAddAdmin(false);
        setNewAdmin({ email: '', walletAddress: '', role: 'admin', permissions: [] });
        alert('Admin user added successfully!');
      }
    } catch (error) {
      console.error('Failed to add admin:', error);
      alert('Failed to add admin user');
    }
  };

  const handleExportData = async (type: string, format: string = 'csv') => {
    setExportLoading(true);
    try {
      const response = await apiClient.requestDataExport({ type, format });
      if (response.success) {
        await fetchExports();
        alert(`Export request created! File: ${response.fileName}`);
      }
    } catch (error) {
      console.error('Failed to request export:', error);
      alert('Failed to request data export');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500/10 to-purple-500/10 border-b border-white/10">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Platform Administration
              </h1>
              <p className="text-gray-400">
                God-mode controls for platform customization and management
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/20">
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-white/20">
              <Star className="h-4 w-4 mr-2" />
              Featured Artists
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 mr-2" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="exports" className="data-[state=active]:bg-white/20">
              <Download className="h-4 w-4 mr-2" />
              Data Export
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-white/20">
              <History className="h-4 w-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Platform Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Settings */}
              <Card className="glass-card border-green-500/30 bg-green-500/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.financial?.map((setting) => (
                    <SettingItem
                      key={setting.id}
                      setting={setting}
                      isEditing={editingSetting === setting.id}
                      onEdit={() => setEditingSetting(setting.id)}
                      onSave={(value) => handleSaveSetting(setting.id, value)}
                      onCancel={() => setEditingSetting(null)}
                    />
                  ))}
                  
                  {/* Quick Settings */}
                  <div className="space-y-3 pt-4 border-t border-white/20">
                    <h4 className="font-semibold text-white">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleSaveSetting('platform.fee', 10)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Set Platform Fee: 10%
                      </Button>
                      <Button
                        onClick={() => handleSaveSetting('artist.royalty.default', 15)}
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Set Artist Royalty: 15%
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Toggles */}
              <Card className="glass-card border-purple-500/30 bg-purple-500/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Feature Toggles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.features?.map((setting) => (
                    <FeatureToggle
                      key={setting.id}
                      setting={setting}
                      onToggle={(enabled) => handleSaveSetting(setting.id, enabled)}
                    />
                  ))}
                  
                  {/* Quick Toggles */}
                  <div className="space-y-3 pt-4 border-t border-white/20">
                    <h4 className="font-semibold text-white">Quick Toggles</h4>
                    <div className="space-y-2">
                      <FeatureToggleQuick
                        label="Soulbound Tickets"
                        description="Enable non-transferable NFT tickets"
                        icon={Crown}
                        onToggle={(enabled) => handleSaveSetting('features.soulbound_tickets', enabled)}
                      />
                      <FeatureToggleQuick
                        label="Golden Tickets"
                        description="Allow artists to create premium NFT tickets"
                        icon={Crown}
                        onToggle={(enabled) => handleSaveSetting('features.golden_tickets', enabled)}
                      />
                      <FeatureToggleQuick
                        label="Fan Messaging"
                        description="Enable direct artist-to-fan messaging"
                        icon={Bell}
                        onToggle={(enabled) => handleSaveSetting('features.fan_messaging', enabled)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Featured Artists Tab */}
          <TabsContent value="featured" className="space-y-6">
            <FeaturedArtistsManager />
          </TabsContent>

          {/* Admin Users Tab */}
          <TabsContent value="admins" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Admin Users</h2>
              <Button
                onClick={() => setShowAddAdmin(true)}
                className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </div>

            {/* Add Admin Modal */}
            {showAddAdmin && (
              <Card className="glass-card border-purple-500/30 bg-purple-500/10">
                <CardHeader>
                  <CardTitle className="text-white">Add New Admin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Email *</Label>
                      <Input
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="admin@example.com"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Wallet Address</Label>
                      <Input
                        value={newAdmin.walletAddress}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, walletAddress: e.target.value }))}
                        placeholder="0x..."
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Role</Label>
                    <select
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="support">Support</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowAddAdmin(false)}
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddAdmin}
                      className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white"
                    >
                      Add Admin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Users List */}
            <div className="grid grid-cols-1 gap-4">
              {adminUsers.map((admin) => (
                <Card key={admin.id} className="glass-card border-white/20 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{admin.user?.name || admin.email}</h3>
                          <p className="text-gray-400 text-sm">{admin.email}</p>
                          {admin.walletAddress && (
                            <p className="text-gray-500 text-xs font-mono">
                              {admin.walletAddress.slice(0, 6)}...{admin.walletAddress.slice(-4)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`${
                          admin.role === 'super_admin' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          admin.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {admin.role.replace('_', ' ')}
                        </Badge>
                        <p className="text-gray-400 text-xs mt-1">
                          {admin.loginCount} logins
                        </p>
                        {admin.lastLoginAt && (
                          <p className="text-gray-500 text-xs">
                            Last: {new Date(admin.lastLoginAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data Export Tab */}
          <TabsContent value="exports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { type: 'users', label: 'Users', icon: Users, description: 'All user accounts and profiles' },
                { type: 'events', label: 'Events', icon: Calendar, description: 'All events and their details' },
                { type: 'transactions', label: 'Transactions', icon: DollarSign, description: 'All ticket purchases and payments' },
                { type: 'artists', label: 'Artists', icon: Crown, description: 'All artist profiles and verification data' }
              ].map((exportType) => (
                <Card key={exportType.type} className="glass-card border-white/20 bg-white/5">
                  <CardContent className="p-6 text-center">
                    <exportType.icon className="h-8 w-8 mx-auto text-purple-400 mb-3" />
                    <h3 className="font-semibold text-white mb-2">{exportType.label}</h3>
                    <p className="text-gray-400 text-sm mb-4">{exportType.description}</p>
                    <Button
                      onClick={() => handleExportData(exportType.type)}
                      disabled={exportLoading}
                      size="sm"
                      className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white"
                    >
                      {exportLoading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Export CSV
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Export History */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">Export History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exports.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">{exp.fileName}</h4>
                        <p className="text-gray-400 text-sm">
                          {exp.type} • {exp.format.toUpperCase()} • {exp.recordCount?.toLocaleString()} records
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${
                          exp.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          exp.status === 'processing' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                          exp.status === 'failed' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                          {exp.status}
                        </Badge>
                        {exp.fileUrl && exp.status === 'completed' && (
                          <Button
                            onClick={() => window.open(exp.fileUrl, '_blank')}
                            size="sm"
                            variant="outline"
                            className="ml-2 border-white/20 text-white hover:bg-white/10"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <AuditLogsSection
              auditLogs={auditLogs}
              filters={auditFilters}
              onFiltersChange={setAuditFilters}
              onRefresh={fetchAuditLogs}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components
function SettingItem({ setting, isEditing, onEdit, onSave, onCancel }: {
  setting: PlatformSetting;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: any) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(setting.value);

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex-1">
        <h4 className="font-semibold text-white">{setting.key}</h4>
        <p className="text-gray-400 text-sm">{setting.description}</p>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-24 bg-white/10 border-white/20 text-white"
            />
            <Button onClick={() => onSave(value)} size="sm" className="gradient-green">
              <Check className="h-3 w-3" />
            </Button>
            <Button onClick={onCancel} size="sm" variant="outline" className="border-white/20">
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <>
            <span className="text-white font-mono">{setting.value}</span>
            <Button onClick={onEdit} size="sm" variant="outline" className="border-white/20">
              <Edit className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function FeatureToggle({ setting, onToggle }: {
  setting: PlatformSetting;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div>
        <h4 className="font-semibold text-white">{setting.key}</h4>
        <p className="text-gray-400 text-sm">{setting.description}</p>
      </div>
      <Switch
        checked={setting.value}
        onCheckedChange={onToggle}
      />
    </div>
  );
}

function FeatureToggleQuick({ label, description, icon: Icon, onToggle }: {
  label: string;
  description: string;
  icon: any;
  onToggle: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(false);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    onToggle(checked);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-purple-400" />
        <div>
          <h4 className="font-semibold text-white text-sm">{label}</h4>
          <p className="text-gray-400 text-xs">{description}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={handleToggle} />
    </div>
  );
}

function AuditLogsSection({ auditLogs, filters, onFiltersChange, onRefresh }: {
  auditLogs: AuditLog[];
  filters: any;
  onFiltersChange: (filters: any) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="glass-card border-white/20 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search actions, users, entities..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="bg-white/10 border-white/20 text-white"
            />
            <select
              value={filters.category}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
              className="p-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="">All Categories</option>
              <option value="user">User</option>
              <option value="event">Event</option>
              <option value="transaction">Transaction</option>
              <option value="artist">Artist</option>
              <option value="admin">Admin</option>
              <option value="settings">Settings</option>
            </select>
            <select
              value={filters.severity}
              onChange={(e) => onFiltersChange({ ...filters, severity: e.target.value })}
              className="p-2 bg-white/10 border border-white/20 rounded text-white"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <Button onClick={onRefresh} className="gradient-purple-cyan hover:opacity-90 border-0 text-white">
            <Search className="h-4 w-4 mr-2" />
            Search Logs
          </Button>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <div className="space-y-3">
        {auditLogs.map((log) => (
          <Card key={log.id} className="glass-card border-white/20 bg-white/5">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${
                      log.severity === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      log.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                      log.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}>
                      {log.severity}
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      {log.category}
                    </Badge>
                    <h3 className="font-semibold text-white">{log.action}</h3>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">
                    {log.userEmail} ({log.userRole}) • {log.entityType}
                    {log.entityId && ` • ID: ${log.entityId}`}
                  </p>
                  
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="text-xs text-gray-400">
                      <summary className="cursor-pointer hover:text-white">View Details</summary>
                      <pre className="mt-2 p-2 bg-black/20 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                
                <div className="text-right text-sm text-gray-400">
                  <p>{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}