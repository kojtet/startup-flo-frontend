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
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  Crown,
  Zap,
  Users,
  Database,
  Calendar,
  Download,
  Settings,
  CheckCircle,
  Star,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: [
      { name: 'Up to 10 users', included: true },
      { name: 'Basic reporting', included: true },
      { name: '5GB storage', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    isPopular: true,
    isCurrent: true,
    features: [
      { name: 'Up to 50 users', included: true },
      { name: 'Advanced reporting', included: true },
      { name: '50GB storage', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'API access', included: true },
      { name: 'Custom integrations', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    features: [
      { name: 'Unlimited users', included: true },
      { name: 'Enterprise reporting', included: true },
      { name: 'Unlimited storage', included: true },
      { name: '24/7 phone support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'API access', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
  },
];

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const currentPlan = PLANS.find(plan => plan.isCurrent) || PLANS[1];
  const usageData = {
    users: { current: 23, limit: 50 },
    storage: { current: 32, limit: 50 }, // GB
    api_calls: { current: 15420, limit: 50000 },
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success',
        description: 'Plan upgrade initiated. You will be redirected to complete payment.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to initiate plan upgrade',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async (planId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Plan change will take effect at the next billing cycle.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to change plan',
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
        name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User',
        email: user?.email || '',
        role: user?.role || 'Employee',
        avatarUrl: user?.avatar_url
      }}
    >
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
            <p className="text-muted-foreground">
              Manage your subscription plan and billing information
            </p>
          </div>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle>Current Plan</CardTitle>
              </div>
              <Badge variant="default">{currentPlan.name}</Badge>
            </div>
            <CardDescription>
              Your current subscription details and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <h3 className="font-medium">{currentPlan.name} Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Billed monthly • Next billing: February 20, 2024
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${currentPlan.price}</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Users</Label>
                  <span className="text-sm text-muted-foreground">
                    {usageData.users.current} / {usageData.users.limit}
                  </span>
                </div>
                <Progress 
                  value={(usageData.users.current / usageData.users.limit) * 100} 
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Storage</Label>
                  <span className="text-sm text-muted-foreground">
                    {usageData.storage.current}GB / {usageData.storage.limit}GB
                  </span>
                </div>
                <Progress 
                  value={(usageData.storage.current / usageData.storage.limit) * 100} 
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">API Calls</Label>
                  <span className="text-sm text-muted-foreground">
                    {usageData.api_calls.current.toLocaleString()} / {usageData.api_calls.limit.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={(usageData.api_calls.current / usageData.api_calls.limit) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative p-6 border rounded-lg ${
                    plan.isPopular ? 'border-primary shadow-md' : 'border-border'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge variant="default" className="px-3 py-1">
                        <Star className="mr-1 h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="flex items-baseline space-x-1">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval}</span>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle 
                            className={`h-4 w-4 ${
                              feature.included ? 'text-green-500' : 'text-muted-foreground'
                            }`} 
                          />
                          <span className={!feature.included ? 'text-muted-foreground line-through' : ''}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4">
                      {plan.isCurrent ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : plan.price > currentPlan.price ? (
                        <Button 
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? 'Processing...' : 'Upgrade'}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={() => handleDowngrade(plan.id)}
                          disabled={loading}
                          className="w-full"
                        >
                          {loading ? 'Processing...' : 'Downgrade'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Billing History</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-3 w-3" />
                Download All
              </Button>
            </div>
            <CardDescription>
              View and download your billing history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: '2024-01-20', amount: '$79.00', status: 'Paid', plan: 'Professional' },
                { date: '2023-12-20', amount: '$79.00', status: 'Paid', plan: 'Professional' },
                { date: '2023-11-20', amount: '$29.00', status: 'Paid', plan: 'Starter' },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{invoice.plan} Plan</div>
                    <div className="text-sm text-muted-foreground">{invoice.date}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-green-600">
                      {invoice.status}
                    </Badge>
                    <span className="font-medium">{invoice.amount}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Payment Method</CardTitle>
            </div>
            <CardDescription>
              Manage your payment methods and billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted rounded">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">•••• •••• •••• 4242</div>
                  <div className="text-sm text-muted-foreground">Expires 12/25</div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-3 w-3" />
                Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
};

export default SubscriptionPage; 