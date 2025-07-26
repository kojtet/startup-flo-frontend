import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { assetsSidebarSections } from '@/components/sidebars/AssetsSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Asset, CreateAssetData, UpdateAssetData, AssetCategory } from '@/apis/types';
import { 
  Archive, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Loader2, 
  MoreHorizontal,
  QrCode,
  Eye,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AssetRegisterPage() {
  const { user, apiClient } = useAuth() as any;
  const { toast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState<CreateAssetData>({
    name: '',
    category_id: '',
    serial_number: '',
    purchase_date: '',
    purchase_cost: 0,
    status: 'in_stock',
    location: '',
    notes: '',
    asset_tag: '',
    depreciation_start: ''
  });

  useEffect(() => {
    if (user?.company_id) {
      fetchData();
    }
  }, [user?.company_id, statusFilter, categoryFilter]);

  // Reset to first page when search or filters change
  useEffect(() => {
    // This effect will run when search or filters change
    // In a real implementation, you might want to reset pagination here
  }, [searchTerm, statusFilter, categoryFilter]);

  const fetchData = async () => {
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
      
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category_id = categoryFilter;
      
      const [assetsResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/assets/assets', { params }),
        apiClient.get('/assets/categories')
      ]);

      setAssets(assetsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch asset data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      const response = await apiClient.post('/assets/assets', formData);
      setAssets(prev => [response.data, ...prev]);
      setIsCreateDialogOpen(false);
      resetForm();
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

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

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
      const updateData: UpdateAssetData = {
        asset_tag: formData.asset_tag,
        name: formData.name,
        category_id: formData.category_id,
        status: formData.status,
        purchase_date: formData.purchase_date,
        purchase_cost: formData.purchase_cost,
        serial_number: formData.serial_number,
        notes: formData.notes
      };

      const response = await apiClient.patch(`/assets/assets/${selectedAsset.id}`, updateData);
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id ? response.data : asset
      ));
      setIsEditDialogOpen(false);
      setSelectedAsset(null);
      toast({
        title: "Success",
        description: "Asset updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating asset:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update asset",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    if (!user?.company_id) {
      toast({
        title: "Error",
        description: "No company ID available",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiClient.delete(`/assets/assets/${assetId}`);
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      toast({
        title: "Success",
        description: "Asset deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete asset",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      category_id: asset.category_id,
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date,
      purchase_cost: asset.purchase_cost,
      status: asset.status,
      location: asset.location || '',
      notes: asset.notes || '',
      asset_tag: asset.asset_tag,
      depreciation_start: asset.depreciation_start || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      serial_number: '',
      purchase_date: '',
      purchase_cost: 0,
      status: 'in_stock',
      location: '',
      notes: '',
      asset_tag: '',
      depreciation_start: ''
    });
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



  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || asset.category_id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sorting logic
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aValue = a[sortKey] ?? "";
    let bValue = b[sortKey] ?? "";
    
    // If sorting by name, asset_tag, serial_number, or notes, compare as strings
    if (["name", "asset_tag", "serial_number", "notes"].includes(sortKey)) {
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    }
    
    // If sorting by purchase_cost or current_value, compare as numbers
    if (["purchase_cost", "current_value"].includes(sortKey)) {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    // If sorting by created_at, purchase_date, or depreciation_start, compare as dates
    if (["created_at", "purchase_date", "depreciation_start"].includes(sortKey) && aValue && bValue) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      return sortDirection === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    }
    
    // Default fallback
    return 0;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'in_stock', label: 'In Stock' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'retired', label: 'Retired' }
  ];

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
    <ExtensibleLayout moduleSidebar={assetsSidebarSections} moduleTitle="Asset Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Asset Register</h1>
            <p className="text-muted-foreground">
              Manage and track all company assets
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                <form onSubmit={handleCreateAsset}>
                  <div className="space-y-4">
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
                        <Input
                          id="asset_tag"
                          value={formData.asset_tag}
                          onChange={(e) => setFormData(prev => ({ ...prev, asset_tag: e.target.value }))}
                          required
                        />
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
                            {statusOptions.filter(opt => opt.value !== 'all').map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
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
                  </div>
                  
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={formLoading}>
                      {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Asset
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assets by name, tag, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Sort Dropdown */}
            <Select value={sortKey} onValueChange={setSortKey}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Sort by Created Date</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="asset_tag">Sort by Asset Tag</SelectItem>
                <SelectItem value="purchase_cost">Sort by Purchase Cost</SelectItem>
                <SelectItem value="current_value">Sort by Current Value</SelectItem>
                <SelectItem value="purchase_date">Sort by Purchase Date</SelectItem>
                <SelectItem value="status">Sort by Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="w-10 flex items-center justify-center"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              aria-label={sortDirection === "asc" ? "Sort ascending" : "Sort descending"}
            >
              {sortDirection === "asc" ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Assets Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{asset.name}</h3>
                          <p className="text-sm text-gray-500">#{asset.asset_tag}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={`${getStatusBadgeColor(asset.status)} border-0`}>
                            {asset.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span>{asset.category?.name || 'No Category'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>${asset.purchase_cost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(asset.purchase_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{asset.location || 'No Location'}</span>
                        </div>
                      </div>
                      
                      {asset.notes && (
                        <p className="text-sm text-gray-600 mt-3">{asset.notes}</p>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(asset)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate QR Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Asset
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Asset</DialogTitle>
              <DialogDescription>
                Update asset information and details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateAsset}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_name">Asset Name</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_asset_tag">Asset Tag</Label>
                  <Input
                    id="edit_asset_tag"
                    value={formData.asset_tag}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_tag: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_category_id">Category</Label>
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
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Asset['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.filter(opt => opt.value !== 'all').map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Asset
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 