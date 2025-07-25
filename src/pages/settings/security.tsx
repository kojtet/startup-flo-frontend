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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Save,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Clock,
  UserX,
  AlertTriangle,
  Globe,
  Monitor,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SecuritySettings {
  password_policy_enabled: boolean;
  min_password_length: string;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
  two_factor_enabled: boolean;
  session_timeout: string;
  max_login_attempts: string;
  lockout_duration: string;
  password_expiry_days: string;
  require_password_change: boolean;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  data_encryption: boolean;
  audit_logging: boolean;
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ip_address: string;
  login_time: string;
  last_activity: string;
  is_current: boolean;
  browser: string;
}

const SAMPLE_SESSIONS: LoginSession[] = [
  {
    id: '1',
    device: 'MacBook Pro',
    location: 'San Francisco, CA',
    ip_address: '192.168.1.100',
    login_time: '2024-01-20T09:00:00Z',
    last_activity: '2024-01-20T15:30:00Z',
    is_current: true,
    browser: 'Chrome 120',
  },
  {
    id: '2',
    device: 'iPhone 15',
    location: 'San Francisco, CA',
    ip_address: '192.168.1.101',
    login_time: '2024-01-19T08:30:00Z',
    last_activity: '2024-01-19T22:15:00Z',
    is_current: false,
    browser: 'Safari Mobile',
  },
  {
    id: '3',
    device: 'Windows PC',
    location: 'New York, NY',
    ip_address: '203.0.113.45',
    login_time: '2024-01-18T14:20:00Z',
    last_activity: '2024-01-18T18:45:00Z',
    is_current: false,
    browser: 'Edge 120',
  },
];

const SecurityPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sessions, setSessions] = useState<LoginSession[]>(SAMPLE_SESSIONS);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    password_policy_enabled: true,
    min_password_length: '8',
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_symbols: false,
    two_factor_enabled: false,
    session_timeout: '24',
    max_login_attempts: '5',
    lockout_duration: '15',
    password_expiry_days: '90',
    require_password_change: false,
    login_notifications: true,
    suspicious_activity_alerts: true,
    data_encryption: true,
    audit_logging: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Security settings saved successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save security settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: 'Success',
        description: 'Session revoked successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSessions(prev => prev.filter(session => session.is_current));
      
      toast({
        title: 'Success',
        description: 'All other sessions revoked successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to revoke sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <ExtensibleLayout 
      moduleSidebar={settingsSidebarSections}
      moduleTitle="Settings"
      user={{
        name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User',
        email: user?.email || '',
        role: user?.role || 'Employee',
        avatarUrl: user?.avatar_url
      }}
    >
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
            <p className="text-muted-foreground">
              Manage your account security and privacy settings
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Password Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Password & Authentication</CardTitle>
              </div>
              <CardDescription>
                Manage your password and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Change Password</Label>
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleChangePassword} disabled={loading} className="w-fit">
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Two-Factor Authentication */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <div className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <Switch 
                    checked={securitySettings.two_factor_enabled}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, two_factor_enabled: checked }))}
                  />
                </div>
                
                {!securitySettings.two_factor_enabled && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Two-factor authentication is recommended for enhanced security
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Policies */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security Policies</CardTitle>
              </div>
              <CardDescription>
                Configure security policies and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Policy</Label>
                  <div className="text-sm text-muted-foreground">
                    Enforce strong password requirements
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.password_policy_enabled}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, password_policy_enabled: checked }))}
                />
              </div>
              
              {securitySettings.password_policy_enabled && (
                <div className="ml-6 space-y-4 border-l-2 border-muted pl-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-length">Minimum Length</Label>
                      <Select 
                        value={securitySettings.min_password_length} 
                        onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, min_password_length: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 characters</SelectItem>
                          <SelectItem value="8">8 characters</SelectItem>
                          <SelectItem value="10">10 characters</SelectItem>
                          <SelectItem value="12">12 characters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-expiry">Password Expiry</Label>
                      <Select 
                        value={securitySettings.password_expiry_days} 
                        onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, password_expiry_days: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="60">60 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={securitySettings.require_uppercase}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, require_uppercase: checked }))}
                      />
                      <Label className="text-sm">Require uppercase letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={securitySettings.require_lowercase}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, require_lowercase: checked }))}
                      />
                      <Label className="text-sm">Require lowercase letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={securitySettings.require_numbers}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, require_numbers: checked }))}
                      />
                      <Label className="text-sm">Require numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={securitySettings.require_symbols}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, require_symbols: checked }))}
                      />
                      <Label className="text-sm">Require symbols</Label>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <Select 
                    value={securitySettings.session_timeout} 
                    onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, session_timeout: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Max Login Attempts</Label>
                  <Select 
                    value={securitySettings.max_login_attempts} 
                    onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, max_login_attempts: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockout-duration">Lockout Duration</Label>
                  <Select 
                    value={securitySettings.lockout_duration} 
                    onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, lockout_duration: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Security Settings'}
              </Button>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>Active Sessions</CardTitle>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserX className="mr-2 h-3 w-3" />
                      Revoke All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will sign you out from all devices except this one. You&apos;ll need to sign in again on other devices.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRevokeAllSessions}>
                        Revoke All Sessions
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <CardDescription>
                Manage your active login sessions across all devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getDeviceIcon(session.device)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{session.device}</h4>
                          {session.is_current && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center space-x-4">
                            <span>{session.browser}</span>
                            <span>•</span>
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>Last active: {new Date(session.last_activity).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!session.is_current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={loading}
                      >
                        <UserX className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <CardTitle>Security Alerts</CardTitle>
              </div>
              <CardDescription>
                Configure security monitoring and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified of new login attempts
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.login_notifications}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, login_notifications: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Suspicious Activity Alerts</Label>
                  <div className="text-sm text-muted-foreground">
                    Get alerts for unusual account activity
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.suspicious_activity_alerts}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, suspicious_activity_alerts: checked }))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <div className="text-sm text-muted-foreground">
                    Keep detailed logs of security events
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.audit_logging}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, audit_logging: checked }))}
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Saving...' : 'Save Alert Settings'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExtensibleLayout>
  );
};

export default SecurityPage; 
