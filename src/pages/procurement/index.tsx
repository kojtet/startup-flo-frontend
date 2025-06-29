import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { useAuth } from '@/contexts/AuthContext';
import { procurementSidebarSections } from '@/components/sidebars/ProcurementSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import api from '@/apis';
import {
  ShoppingCart,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Calendar,
  BarChart3,
  Loader2
} from 'lucide-react';

interface DashboardMetrics {
  totalVendors: number;
  activeContracts: number;
  pendingRFQs: number;
  monthlySpend: number;
  expiringSoon: number;
  purchaseOrders: {
    total: number;
    pending: number;
    approved: number;
    delivered: number;
  };
}

export default function ProcurementDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Mock dashboard data
        const mockMetrics: DashboardMetrics = {
          totalVendors: 25,
          activeContracts: 12,
          pendingRFQs: 8,
          monthlySpend: 285000,
          expiringSoon: 3,
          purchaseOrders: {
            total: 45,
            pending: 12,
            approved: 20,
            delivered: 13
          }
        };

        setMetrics(mockMetrics);
        
        toast({
          title: "Success",
          description: "Dashboard data loaded successfully",
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <ExtensibleLayout
        moduleSidebar={procurementSidebarSections}
        moduleTitle="Procurement"
        user={user}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout
      moduleSidebar={procurementSidebarSections}
      moduleTitle="Procurement"
      user={user}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your procurement activities and vendor relationships
          </p>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                      <p className="text-2xl font-bold">{metrics.totalVendors}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                      <p className="text-2xl font-bold">{metrics.activeContracts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Purchase Orders</p>
                      <p className="text-2xl font-bold">{metrics.purchaseOrders.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly Spend</p>
                      <p className="text-2xl font-bold">${metrics.monthlySpend.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {(metrics.expiringSoon > 0 || metrics.pendingRFQs > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.expiringSoon > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Contracts Expiring Soon</h4>
                          <p className="text-sm text-yellow-600">
                            {metrics.expiringSoon} contract{metrics.expiringSoon !== 1 ? 's' : ''} expiring within 30 days
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                          View Contracts
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {metrics.pendingRFQs > 0 && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-blue-800">Pending RFQs</h4>
                          <p className="text-sm text-blue-600">
                            {metrics.pendingRFQs} RFQ{metrics.pendingRFQs !== 1 ? 's' : ''} awaiting response
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                          View RFQs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Dashboard Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Recent Purchase Orders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">PO-2024-001</p>
                            <p className="text-sm text-muted-foreground">Office Equipment</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">PO-2024-002</p>
                            <p className="text-sm text-muted-foreground">IT Hardware</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">PO-2024-003</p>
                            <p className="text-sm text-muted-foreground">Office Supplies</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Top Vendors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">TechCorp Solutions</span>
                          <span className="text-sm text-muted-foreground">$125,000</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Office Supplies Inc</span>
                          <span className="text-sm text-muted-foreground">$48,500</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Furniture World</span>
                          <span className="text-sm text-muted-foreground">$35,200</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Clean Pro Services</span>
                          <span className="text-sm text-muted-foreground">$24,000</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Contract Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Active Contracts</span>
                          <Badge className="bg-green-100 text-green-800">{metrics.activeContracts}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Expiring Soon</span>
                          <Badge className="bg-yellow-100 text-yellow-800">{metrics.expiringSoon}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pending Renewal</span>
                          <Badge className="bg-blue-100 text-blue-800">2</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Under Review</span>
                          <Badge className="bg-gray-100 text-gray-800">1</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="purchase-orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase Order Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{metrics.purchaseOrders.pending}</p>
                        <p className="text-sm text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{metrics.purchaseOrders.approved}</p>
                        <p className="text-sm text-muted-foreground">Approved</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{metrics.purchaseOrders.delivered}</p>
                        <p className="text-sm text-muted-foreground">Delivered</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-gray-600">{metrics.purchaseOrders.total}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="vendors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">TechCorp Solutions</h4>
                          <p className="text-sm text-muted-foreground">Technology • Active since 2023</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">98.5%</p>
                          <p className="text-sm text-muted-foreground">On-time delivery</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Office Supplies Inc</h4>
                          <p className="text-sm text-muted-foreground">Supplies • Active since 2022</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">95.2%</p>
                          <p className="text-sm text-muted-foreground">On-time delivery</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Furniture World</h4>
                          <p className="text-sm text-muted-foreground">Furniture • Active since 2024</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">92.8%</p>
                          <p className="text-sm text-muted-foreground">On-time delivery</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Spend by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Technology</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full w-3/4" />
                            </div>
                            <span className="text-sm font-medium">$125,000</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Office Supplies</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full w-1/2" />
                            </div>
                            <span className="text-sm font-medium">$48,500</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Furniture</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-purple-600 h-2 rounded-full w-1/3" />
                            </div>
                            <span className="text-sm font-medium">$35,200</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Services</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div className="bg-orange-600 h-2 rounded-full w-1/4" />
                            </div>
                            <span className="text-sm font-medium">$24,000</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Monthly Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">January 2024</span>
                          <span className="text-sm font-medium">$285,000</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">December 2023</span>
                          <span className="text-sm font-medium">$312,500</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">November 2023</span>
                          <span className="text-sm font-medium">$198,750</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">October 2023</span>
                          <span className="text-sm font-medium">$267,300</span>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Average</span>
                            <span className="text-sm font-bold">$265,888</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </ExtensibleLayout>
  );
}