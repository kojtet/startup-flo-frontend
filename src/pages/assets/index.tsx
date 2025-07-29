import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { assetsSidebarSections } from "@/components/sidebars/AssetsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Asset, AssetCategory, CreateAssetData } from "@/apis/types";
import { Archive, DollarSign, Wrench, TrendingDown, Loader2, Building, AlertTriangle, CheckCircle, Clock, AlertCircle, Plus, RefreshCw } from "lucide-react";

export default function AssetsDashboard() {
  const { user, apiClient } = useAuth() as any;
  const { toast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const generateUniqueAssetTag = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `AST${timestamp}${random}`;
  };

  const [formData, setFormData] = useState<CreateAssetData>({
    name: '',
    category_id: '',
    serial_number: '',
    purchase_date: '',
    purchase_cost: 0,
    status: 'available',
    location: 'Default Location',
    notes: '',
    asset_tag: generateUniqueAssetTag(),
    depreciation_start: ''
  });

  useEffect(() => {
    if (user?.company_id) {
      fetchDashboardData();
    }
  }, [user?.company_id]);

  const fetchDashboardData = async () => {
    if (!user?.company_id) {
      toast({
        title: "Error",
        description: "No company ID available",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Fetch data in parallel for better performance
      const [assetsResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/assets/assets'),
        apiClient.get('/assets/categories'),
      ]);

      setAssets(assetsResponse.data || []);
      setCategories(categoriesResponse.data || []);

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
    if (!user?.company_id) {
      toast({
        title: "Error",
        description: "No company ID available",
        variant: "destructive"
      });
      return;
    }

    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: "Success",
      description: "Dashboard data refreshed"
    });
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      category_id: '',
      serial_number: '',
      purchase_date: '',
      purchase_cost: 0,
      status: 'available',
      location: 'Default Location',
      notes: '',
      asset_tag: generateUniqueAssetTag(),
      depreciation_start: ''
    });
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.company_id) {
      toast({
        title: "Error",
        description: "No company ID available",
        variant: "destructive"
      });
      return;
    }

    try {
      setFormLoading(true);
      
      const assetPayload = {
        ...formData,
        purchase_cost: parseFloat(formData.purchase_cost.toString())
      };

      await apiClient.post('/assets/assets', assetPayload);
      
      // Refresh the assets list
      await fetchDashboardData();
      
      // Close dialog and reset form
      setIsCreateDialogOpen(false);
      resetFormData();
      
      toast({
        title: "Success",
        description: "Asset created successfully"
      });
    } catch (error: any) {
      console.error('Error creating asset:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create asset",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.current_value, 0);
    
    // Calculate assets by status
    const statusCounts = assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate assets by category
    const categoryCounts = assets.reduce((acc, asset) => {
      const categoryName = asset.category?.name || 'Unknown';
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, value: 0 };
      }
      acc[categoryName].count += 1;
      acc[categoryName].value += asset.current_value;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    // Calculate assets by location
    const locationCounts = assets.reduce((acc, asset) => {
      const location = asset.location || 'Unknown';
      if (!acc[location]) {
        acc[location] = { count: 0, value: 0 };
      }
      acc[location].count += 1;
      acc[location].value += asset.current_value;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    return {
      totalAssets,
      totalValue,
      statusCounts,
      categoryCounts,
      locationCounts
    };
  };

  const getStatusBadgeColor = (status: Asset['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-orange-100 text-orange-800';
      case 'disposed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Asset['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'available': return <Archive className="h-4 w-4 text-blue-500" />;
      case 'assigned': return <Building className="h-4 w-4 text-purple-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-yellow-500" />;
      case 'retired': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'disposed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const AssetForm = () => (
    <form onSubmit={handleCreateAsset} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Asset Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="asset_tag">Asset Tag</Label>
          <div className="flex gap-2">
            <Input
              id="asset_tag"
              value={formData.asset_tag}
              onChange={(e) => setFormData(prev => ({ ...prev, asset_tag: e.target.value }))}
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, asset_tag: generateUniqueAssetTag() }))}
              title="Generate unique asset tag"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <Label htmlFor="category_id">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="serial_number">Serial Number</Label>
          <Input
            id="serial_number"
            value={formData.serial_number}
            onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Asset['status'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Under Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="disposed">Disposed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="purchase_cost">Purchase Cost</Label>
          <Input
            id="purchase_cost"
            type="number"
            step="0.01"
            value={formData.purchase_cost}
            onChange={(e) => setFormData(prev => ({ ...prev, purchase_cost: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsCreateDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={formLoading}>
          {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Asset
        </Button>
      </div>
    </form>
  );

  const metrics = calculateMetrics();

  if (!user) {
    return (
      <ExtensibleLayout moduleSidebar={assetsSidebarSections} moduleTitle="Asset Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout 
      moduleSidebar={assetsSidebarSections} 
      moduleTitle="Asset Management"
    >
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
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (open) {
                resetFormData();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Asset</DialogTitle>
                  <DialogDescription>
                    Add a new asset to the register with all necessary details.
                  </DialogDescription>
                </DialogHeader>
                <AssetForm />
              </DialogContent>
            </Dialog>
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
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Current book value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <p className="text-xs text-muted-foreground">Asset categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.statusCounts.active || 0}</div>
                  <p className="text-xs text-muted-foreground">Currently in use</p>
                </CardContent>
              </Card>
            </div>

            {/* Asset Status Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(metrics.statusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status as Asset['status'])}
                          <Badge className={`${getStatusBadgeColor(status as Asset['status'])} border-0`}>
                            {status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{count} assets</span>
                        </div>
                        <div className="text-sm font-semibold">
                          ${assets
                            .filter(a => a.status === status)
                            .reduce((sum, asset) => sum + asset.current_value, 0)
                            .toLocaleString()}
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
                    {Object.entries(metrics.categoryCounts).slice(0, 5).map(([categoryName, data]) => (
                      <div key={categoryName} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">{categoryName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{data.count} assets</div>
                          <div className="text-xs text-gray-500">${data.value.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Assets and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assets.slice(0, 5).map((asset) => (
                      <div key={asset.id} className="flex items-center space-x-3">
                        {getStatusIcon(asset.status)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{asset.name}</p>
                          <p className="text-xs text-gray-500">
                            {asset.asset_tag} - {asset.category?.name} - ${asset.current_value.toLocaleString()}
                          </p>
                        </div>
                        <Badge className={`${getStatusBadgeColor(asset.status)} border-0 text-xs`}>
                          {asset.status}
                        </Badge>
                      </div>
                    ))}
                    {assets.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No assets found. Add your first asset to get started.
                      </div>
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
                      <p className="font-medium">Manage Categories</p>
                      <p className="text-xs text-gray-500">Organize assets</p>
                    </Button>
                    <Button variant="outline" className="p-4 h-auto text-left flex-col items-start">
                      <DollarSign className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="font-medium">View Reports</p>
                      <p className="text-xs text-gray-500">Asset analytics</p>
                    </Button>
                    <Button variant="outline" className="p-4 h-auto text-left flex-col items-start">
                      <TrendingDown className="h-6 w-6 text-orange-600 mb-2" />
                      <p className="font-medium">Export Data</p>
                      <p className="text-xs text-gray-500">Download reports</p>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Asset Locations Overview */}
            {Object.keys(metrics.locationCounts).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Asset Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(metrics.locationCounts).slice(0, 6).map(([location, data]) => (
                      <div key={location} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{location}</h4>
                          <Building className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{data.count} assets</div>
                          <div className="font-semibold">${data.value.toLocaleString()}</div>
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
