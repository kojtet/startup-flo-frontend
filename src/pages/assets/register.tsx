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
import { useHR } from '@/hooks/useHR';
import type { Asset, CreateAssetData, UpdateAssetData, AssetCategory, Employee, AssignAssetData, UnassignAssetData } from '@/apis/types';
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
  ChevronDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User
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
  const { employees, fetchEmployees } = useHR();

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignFormData, setAssignFormData] = useState<AssignAssetData>({
    employee_id: '',
    assigned_date: new Date().toISOString().split('T')[0],
    return_date: '',
    notes: ''
  });
  const [isUnassignDialogOpen, setIsUnassignDialogOpen] = useState(false);
  const [unassignFormData, setUnassignFormData] = useState<UnassignAssetData & { return_condition: string }>({
    return_date: new Date().toISOString().split('T')[0],
    return_condition: 'good',
    notes: ''
  });
  const [isDisposeDialogOpen, setIsDisposeDialogOpen] = useState(false);
  const [disposeFormData, setDisposeFormData] = useState({
    disposal_date: new Date().toISOString().split('T')[0],
    disposal_reason: '',
    disposal_value: 0
  });

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
      fetchData();
      fetchEmployees();
    }
  }, [user?.company_id, statusFilter, categoryFilter]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
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
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to create asset";
      toast({
        title: "Error",
        description: errorMessage,
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

  const handleDisposeAsset = async (e: React.FormEvent) => {
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
      await apiClient.post(`/assets/assets/${selectedAsset.id}/dispose`, disposeFormData);
      
      // Update the asset status to disposed
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id ? { ...asset, status: 'disposed' } : asset
      ));
      
      setIsDisposeDialogOpen(false);
      setSelectedAsset(null);
      setDisposeFormData({
        disposal_date: new Date().toISOString().split('T')[0],
        disposal_reason: '',
        disposal_value: 0
      });
      
      toast({
        title: "Success",
        description: "Asset disposed successfully"
      });
    } catch (error: any) {
      console.error('Error disposing asset:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to dispose asset",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssignAsset = async (e: React.FormEvent) => {
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
      const response = await apiClient.post(`/assets/assignments/${selectedAsset.id}`, assignFormData);
      
      // Update the asset status to assigned
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id ? { ...asset, status: 'assigned' } : asset
      ));
      
      setIsAssignDialogOpen(false);
      setSelectedAsset(null);
      setAssignFormData({
        employee_id: '',
        assigned_date: new Date().toISOString().split('T')[0],
        return_date: '',
        notes: ''
      });
      
      toast({
        title: "Success",
        description: "Asset assigned successfully"
      });
    } catch (error: any) {
      console.error('Error assigning asset:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign asset",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUnassignAsset = async (e: React.FormEvent) => {
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
      const response = await apiClient.post(`/assets/assignments/${selectedAsset.id}/unassign`, unassignFormData);
      
      // Update the asset status to available
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id ? { ...asset, status: 'available' } : asset
      ));
      
      setIsUnassignDialogOpen(false);
      setSelectedAsset(null);
      setUnassignFormData({
        return_date: new Date().toISOString().split('T')[0],
        return_condition: 'good',
        notes: ''
      });
      
      toast({
        title: "Success",
        description: "Asset unassigned successfully"
      });
    } catch (error: any) {
      console.error('Error unassigning asset:', error);
      
      // Handle the specific case where no active assignment is found
      if (error.response?.data?.message?.includes('No active assignment found')) {
        // Update the asset status to available since it's not actually assigned
        setAssets(prev => prev.map(asset => 
          asset.id === selectedAsset.id ? { ...asset, status: 'available' } : asset
        ));
        
        setIsUnassignDialogOpen(false);
        setSelectedAsset(null);
        
        toast({
          title: "Info",
          description: "Asset status updated to available (no active assignment found)"
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to unassign asset",
          variant: "destructive"
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const openAssignDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssignFormData({
      employee_id: '',
      assigned_date: new Date().toISOString().split('T')[0],
      return_date: '',
      notes: ''
    });
    setIsAssignDialogOpen(true);
  };

  const openUnassignDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setUnassignFormData({
      return_date: new Date().toISOString().split('T')[0],
      return_condition: 'good',
      notes: ''
    });
    setIsUnassignDialogOpen(true);
  };

  const openDisposeDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setDisposeFormData({
      disposal_date: new Date().toISOString().split('T')[0],
      disposal_reason: '',
      disposal_value: 0
    });
    setIsDisposeDialogOpen(true);
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
      location: asset.location || 'Default Location',
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
      status: 'available',
      location: 'Default Location',
      notes: '',
      asset_tag: generateUniqueAssetTag(),
      depreciation_start: ''
    });
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

  // Pagination logic
  const totalItems = sortedAssets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssets = sortedAssets.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'maintenance', label: 'Under Maintenance' },
    { value: 'retired', label: 'Retired' },
    { value: 'disposed', label: 'Disposed' }
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
                            {statusOptions.filter(opt => opt.value !== 'all').map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
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
          <div className="space-y-6">
            <div className="grid gap-6">
              {paginatedAssets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-base font-semibold">{asset.name}</h3>
                          <p className="text-xs text-gray-500">#{asset.asset_tag}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <Tag className="h-3 w-3 text-gray-400" />
                          <span>{asset.category?.name || 'No Category'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span>${asset.purchase_cost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{new Date(asset.purchase_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span>{asset.location || 'No Location'}</span>
                        </div>
                      </div>
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
                        {asset.status === 'available' ? (
                          <DropdownMenuItem onClick={() => openAssignDialog(asset)}>
                            <User className="mr-2 h-4 w-4" />
                            Assign Asset
                          </DropdownMenuItem>
                        ) : asset.status === 'assigned' ? (
                          <DropdownMenuItem onClick={() => openUnassignDialog(asset)}>
                            <User className="mr-2 h-4 w-4" />
                            Unassign Asset
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDisposeDialog(asset)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Dispose Asset
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="items-per-page" className="text-sm">Items per page:</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} assets (Page {currentPage} of {totalPages})
                </span>
              </div>
              
                              <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="w-8 h-8"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
            </div>
          )}
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

        {/* Assign Asset Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign Asset</DialogTitle>
              <DialogDescription>
                Assign this asset to an employee with assignment details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignAsset}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee_id">Employee</Label>
                  <Select
                    value={assignFormData.employee_id}
                    onValueChange={(value) => setAssignFormData(prev => ({ ...prev, employee_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assigned_date">Assignment Date</Label>
                    <Input
                      id="assigned_date"
                      type="date"
                      value={assignFormData.assigned_date}
                      onChange={(e) => setAssignFormData(prev => ({ ...prev, assigned_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="return_date">Expected Return Date</Label>
                    <Input
                      id="return_date"
                      type="date"
                      value={assignFormData.return_date}
                      onChange={(e) => setAssignFormData(prev => ({ ...prev, return_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="assign_notes">Notes</Label>
                  <Textarea
                    id="assign_notes"
                    value={assignFormData.notes}
                    onChange={(e) => setAssignFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Optional notes about the assignment..."
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assign Asset
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Unassign Asset Dialog */}
        <Dialog open={isUnassignDialogOpen} onOpenChange={setIsUnassignDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Unassign Asset</DialogTitle>
              <DialogDescription>
                Return this asset and update its status.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUnassignAsset}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unassign_return_date">Return Date</Label>
                    <Input
                      id="unassign_return_date"
                      type="date"
                      value={unassignFormData.return_date}
                      onChange={(e) => setUnassignFormData(prev => ({ ...prev, return_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="return_condition">Return Condition</Label>
                    <Select
                      value={unassignFormData.return_condition}
                      onValueChange={(value) => setUnassignFormData(prev => ({ ...prev, return_condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="unusable">Unusable</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="unassign_notes">Notes</Label>
                  <Textarea
                    id="unassign_notes"
                    value={unassignFormData.notes}
                    onChange={(e) => setUnassignFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Optional notes about the return..."
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsUnassignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Unassign Asset
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dispose Asset Dialog */}
        <Dialog open={isDisposeDialogOpen} onOpenChange={setIsDisposeDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dispose Asset</DialogTitle>
              <DialogDescription>
                Dispose of this asset and record disposal details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDisposeAsset}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disposal_date">Disposal Date</Label>
                    <Input
                      id="disposal_date"
                      type="date"
                      value={disposeFormData.disposal_date}
                      onChange={(e) => setDisposeFormData(prev => ({ ...prev, disposal_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="disposal_value">Disposal Value</Label>
                    <Input
                      id="disposal_value"
                      type="number"
                      step="0.01"
                      value={disposeFormData.disposal_value}
                      onChange={(e) => setDisposeFormData(prev => ({ ...prev, disposal_value: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="disposal_reason">Disposal Reason</Label>
                  <Textarea
                    id="disposal_reason"
                    value={disposeFormData.disposal_reason}
                    onChange={(e) => setDisposeFormData(prev => ({ ...prev, disposal_reason: e.target.value }))}
                    rows={3}
                    placeholder="e.g., End of useful life, Damaged beyond repair, Obsolete technology..."
                    required
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDisposeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="bg-red-600 hover:bg-red-700">
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Dispose Asset
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 