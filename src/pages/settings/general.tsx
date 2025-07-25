/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, react/no-unescaped-entities, prefer-const */


import React, { useState } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { settingsSidebarSections } from '@/components/sidebars/SettingsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Building,
  Settings,
  Phone,
  Mail,
  Clock,
  DollarSign,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GeneralSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [companySettings, setCompanySettings] = useState({
    name: 'Acme Corporation',
    industry: 'Technology',
    website: 'https://acme.com',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Suite 100',
    city: 'San Francisco',
    state: 'California',
  });

  const [preferences, setPreferences] = useState({
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    email_notifications: true,
    two_factor_auth: false,
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExtensibleLayout 
      moduleSidebar={settingsSidebarSections}
      moduleTitle="Settings"
      user={{
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User',
        email: user?.email || '',
        role: user?.role || 'Employee',
        avatarUrl: user?.avatarUrl
      }}
    >
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
            <p className="text-muted-foreground">
              Configure your company settings and preferences
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle>Company Information</CardTitle>
              </div>
              <CardDescription>
                Update your company details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={companySettings.industry} 
                    onValueChange={(value) => setCompanySettings(prev => ({ ...prev, industry: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email"
                      className="pl-10"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone"
                      className="pl-10"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address"
                  value={`${companySettings.address}\n${companySettings.city}, ${companySettings.state}`}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    setCompanySettings(prev => ({ 
                      ...prev, 
                      address: lines[0] || '',
                      city: lines[1]?.split(',')[0] || '',
                      state: lines[1]?.split(',')[1]?.trim() || ''
                    }));
                  }}
                />
              </div>
              
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* System Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>System Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure system defaults and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Select 
                      value={preferences.timezone} 
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Select 
                      value={preferences.currency} 
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </div>
                </div>
                <Switch 
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, email_notifications: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <Switch 
                  checked={preferences.two_factor_auth}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, two_factor_auth: checked }))}
                />
              </div>

              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExtensibleLayout>
  );
};

export default GeneralSettingsPage; 