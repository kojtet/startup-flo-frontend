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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Zap,
  ExternalLink,
  Calendar,
  Mail,
  MessageSquare,
  CreditCard,
  FileText,
  Database,
  BarChart3,
  Clock,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  isEnabled: boolean;
  connectedAt?: string;
  lastSync?: string;
  features: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    description: 'Sync with Gmail, Calendar, and Drive',
    icon: <Mail className="h-5 w-5" />,
    category: 'Productivity',
    status: 'connected',
    isEnabled: true,
    connectedAt: '2024-01-15',
    lastSync: '2024-01-20T10:30:00Z',
    features: ['Email sync', 'Calendar integration', 'Document sync'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels',
    icon: <MessageSquare className="h-5 w-5" />,
    category: 'Communication',
    status: 'connected',
    isEnabled: true,
    connectedAt: '2024-01-10',
    lastSync: '2024-01-20T09:15:00Z',
    features: ['Notifications', 'Channel updates', 'Bot commands'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'Finance',
    status: 'disconnected',
    isEnabled: false,
    features: ['Payment processing', 'Subscription management', 'Analytics'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync CRM data and customer information',
    icon: <Users className="h-5 w-5" />,
    category: 'CRM',
    status: 'error',
    isEnabled: false,
    connectedAt: '2024-01-05',
    features: ['Contact sync', 'Deal tracking', 'Email campaigns'],
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync financial data and accounting',
    icon: <BarChart3 className="h-5 w-5" />,
    category: 'Finance',
    status: 'pending',
    isEnabled: false,
    features: ['Expense tracking', 'Invoice sync', 'Financial reports'],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows with 5000+ apps',
    icon: <Zap className="h-5 w-5" />,
    category: 'Automation',
    status: 'disconnected',
    isEnabled: false,
    features: ['Workflow automation', 'Trigger events', 'Data sync'],
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'default';
    case 'error':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
  }
};

const IntegrationsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const categories = ['All', ...Array.from(new Set(integrations.map(i => i.category)))];

  const filteredIntegrations = selectedCategory === 'All' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const handleConnect = async (integration: Integration) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIntegrations(prev => prev.map(i => 
        i.id === integration.id 
          ? { 
              ...i, 
              status: 'connected' as const, 
              isEnabled: true,
              connectedAt: new Date().toISOString().split('T')[0],
              lastSync: new Date().toISOString()
            }
          : i
      ));
      
      toast({
        title: 'Success',
        description: `${integration.name} connected successfully`,
      });
      
      setShowConnectDialog(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to connect ${integration.name}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIntegrations(prev => prev.map(i => 
        i.id === integration.id 
          ? { ...i, status: 'disconnected' as const, isEnabled: false }
          : i
      ));
      
      toast({
        title: 'Success',
        description: `${integration.name} disconnected successfully`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to disconnect ${integration.name}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (integration: Integration) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIntegrations(prev => prev.map(i => 
        i.id === integration.id 
          ? { ...i, isEnabled: !i.isEnabled }
          : i
      ));
      
      toast({
        title: 'Success',
        description: `${integration.name} ${integration.isEnabled ? 'disabled' : 'enabled'}`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to update ${integration.name}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openConnectDialog = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowConnectDialog(true);
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
            <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
            <p className="text-muted-foreground">
              Connect with third-party services to enhance your workflow
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.status === 'connected').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Settings className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.isEnabled).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.status === 'error').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {integration.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(integration.status)}
                    <Badge variant={getStatusColor(integration.status)} className="text-xs">
                      {integration.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Features:</Label>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {integration.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{integration.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {integration.status === 'connected' && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {integration.connectedAt && (
                      <div>Connected: {new Date(integration.connectedAt).toLocaleDateString()}</div>
                    )}
                    {integration.lastSync && (
                      <div>Last sync: {new Date(integration.lastSync).toLocaleString()}</div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  {integration.status === 'connected' ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integration.isEnabled}
                        onCheckedChange={() => handleToggle(integration)}
                        disabled={loading}
                      />
                      <Label className="text-sm">Enabled</Label>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => openConnectDialog(integration)}
                      disabled={loading}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Connect
                    </Button>
                  )}

                  {integration.status === 'connected' && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openConnectDialog(integration)}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(integration)}
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connect Integration Dialog */}
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedIntegration?.status === 'connected' ? 'Configure' : 'Connect'} {selectedIntegration?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedIntegration?.status === 'connected' 
                  ? 'Update your integration settings'
                  : `Connect your ${selectedIntegration?.name} account to enable this integration.`
                }
              </DialogDescription>
            </DialogHeader>
            
            {selectedIntegration && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-muted rounded-lg">
                    {selectedIntegration.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedIntegration.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedIntegration.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Features included:</Label>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedIntegration.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedIntegration.status !== 'connected' && (
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key (if required)</Label>
                    <Input
                      id="api-key"
                      placeholder="Enter your API key"
                      type="password"
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Cancel
              </Button>
              {selectedIntegration?.status === 'connected' ? (
                <Button onClick={() => setShowConnectDialog(false)}>
                  Save Changes
                </Button>
              ) : (
                <Button 
                  onClick={() => selectedIntegration && handleConnect(selectedIntegration)}
                  disabled={loading}
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
};

export default IntegrationsPage; 