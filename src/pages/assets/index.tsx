import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { assetsSidebarSections } from "@/components/sidebars/AssetsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/apis";
import type { Asset, AssetSummaryReport, AssetMaintenance } from "@/apis/types";
import { Archive, DollarSign, Wrench, TrendingDown, Loader2, Users, Building, AlertTriangle, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function AssetsDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetSummary, setAssetSummary] = useState<AssetSummaryReport | null>(null);
  const [recentMaintenance, setRecentMaintenance] = useState<AssetMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data in parallel for better performance
      const [assetsResponse, summaryResponse] = await Promise.all([
        api.assets.getAssets({ limit: 100 }),
        api.assets.getAssetSummary(),
      ]);

      setAssets(assetsResponse || []);
      setAssetSummary(summaryResponse);

      // Get recent maintenance for activity feed
      if (assetsResponse && assetsResponse.length > 0) {
        const maintenancePromises = assetsResponse.slice(0, 5).map(asset => 
          api.assets.getAssetMaintenance(asset.id).catch(() => [])
        );
        const maintenanceResults = await Promise.all(maintenancePromises);
        const allMaintenance = maintenanceResults.flat().sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentMaintenance(allMaintenance.slice(0, 5));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Dashboard data refreshed"
    });
  };

  const calculateMetrics = () => {
    if (!assetSummary) {
      return {
        totalAssets: assets.length,
        totalValue: 0,
        maintenanceDue: 0,
        monthlyDepreciation: 0
      };
    }

    const maintenanceDue = recentMaintenance.filter(m => 
      m.status === 'scheduled' && new Date(m.scheduled_date) <= new Date()
    ).length;

    return {
      totalAssets: assetSummary.total_assets,
      totalValue: assetSummary.total_value,
      maintenanceDue,
      monthlyDepreciation: 12450 // Mock data for now
    };
  };

  const getStatusBadgeColor = (status: Asset['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'in_stock': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatusIcon = (status: AssetMaintenance['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'scheduled': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const metrics = calculateMetrics();

  if (!user) {
    return (
      <ExtensibleLayout moduleSidebar={assetsSidebarSections} moduleTitle="Asset Management" user={null}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={assetsSidebarSections} moduleTitle="Asset Management" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assets Dashboard</h1>
            <p className="text-gray-600 mt-2">Track and manage your company assets and inventory</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Archive className="mr-2 h-4 w-4" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalAssets.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {assets.filter(a => new Date(a.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} added this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Asset Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Current book value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.maintenanceDue}</div>
                  <p className="text-xs text-muted-foreground">Assets need attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Depreciation</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.monthlyDepreciation.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Asset Status Overview */}
            {assetSummary && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Status Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assetSummary.by_status.map((statusData, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusBadgeColor(statusData.status)} border-0`}>
                              {statusData.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium">{statusData.count} assets</span>
                          </div>
                          <div className="text-sm font-semibold">
                            ${statusData.value.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Asset Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assetSummary.by_category.slice(0, 5).map((categoryData, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium">{categoryData.category_name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{categoryData.count} assets</div>
                            <div className="text-xs text-gray-500">${categoryData.value.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activities and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Asset Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentMaintenance.length > 0 ? (
                      recentMaintenance.map((maintenance, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          {getMaintenanceStatusIcon(maintenance.status)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{maintenance.title}</p>
                            <p className="text-xs text-gray-500">
                              {maintenance.asset?.name} - {new Date(maintenance.scheduled_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${getStatusBadgeColor('active')} border-0 text-xs`}>
                            {maintenance.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">New laptop assigned</p>
                            <p className="text-xs text-gray-500">MacBook Pro to John Doe</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Maintenance scheduled</p>
                            <p className="text-xs text-gray-500">Server rack cleaning</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Asset retired</p>
                            <p className="text-xs text-gray-500">Old printer disposed</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="p-4 h-auto text-left flex-col items-start">
                      <Archive className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="font-medium">Add Asset</p>
                      <p className="text-xs text-gray-500">Register new asset</p>
                    </Button>
                    <Button variant="outline" className="p-4 h-auto text-left flex-col items-start">
                      <Wrench className="h-6 w-6 text-green-600 mb-2" />
                      <p className="font-medium">Schedule Maintenance</p>
                      <p className="text-xs text-gray-500">Plan upkeep</p>
                    </Button>
                    <Button variant="outline" className="p-4 h-auto text-left flex-col items-start">
                      <DollarSign className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="font-medium">View Depreciation</p>
                      <p className="text-xs text-gray-500">Asset value tracking</p>
                    </Button>
                    <Button variant="outline" className="p-4 h-auto text-left flex-col items-start">
                      <TrendingDown className="h-6 w-6 text-orange-600 mb-2" />
                      <p className="font-medium">Generate Report</p>
                      <p className="text-xs text-gray-500">Asset analytics</p>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Asset Locations Overview */}
            {assetSummary && assetSummary.by_location && assetSummary.by_location.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Asset Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assetSummary.by_location.slice(0, 6).map((locationData, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{locationData.location_name}</h4>
                          <Building className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{locationData.count} assets</div>
                          <div className="font-semibold">${locationData.value.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </ExtensibleLayout>
  );
}
