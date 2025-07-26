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
import type { AssetCategory, CreateAssetCategoryData, UpdateAssetCategoryData } from '@/apis/types';
import { Tag, Plus, Search, Edit, Trash2, Loader2, MoreHorizontal, Package, Archive } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

export default function AssetCategoriesPage() {
  const { user, apiClient } = useAuth() as any;
  const { toast } = useToast();

  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState<CreateAssetCategoryData>({
    name: '',
    description: '',
    depreciation_rate: 25,
    depreciation_method: 'straight_line',
    useful_life_months: 60
  });

  useEffect(() => {
    if (user?.company_id) {
      fetchCategories();
    }
  }, [user?.company_id]);

  const fetchCategories = async () => {
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
      const response = await apiClient.get('/assets/categories');
      setCategories(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
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
      const response = await apiClient.post('/assets/categories', formData);
      setCategories(prev => [response.data, ...prev]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Category created successfully"
      });
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create category",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

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
      const updateData: UpdateAssetCategoryData = {
        name: formData.name,
        description: formData.description,
        depreciation_rate: formData.depreciation_rate,
        depreciation_method: formData.depreciation_method,
        useful_life_months: formData.useful_life_months
      };

      const response = await apiClient.patch(`/assets/categories/${selectedCategory.id}`, updateData);
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory.id ? response.data : cat
      ));
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    if (!user?.company_id) {
      toast({
        title: "Error",
        description: "No company ID available",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiClient.delete(`/assets/categories/${categoryId}`);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (category: AssetCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      depreciation_rate: 25, // Default value since it's not in AssetCategory
      depreciation_method: category.depreciation_method || 'straight_line',
      useful_life_months: category.useful_life_months || 60
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      depreciation_rate: 25,
      depreciation_method: 'straight_line',
      useful_life_months: 60
    });
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
            <h1 className="text-3xl font-bold">Asset Categories</h1>
            <p className="text-muted-foreground">
              Organize assets into categories for better management
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new asset category to organize your assets.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCategory}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="depreciation_rate">Depreciation Rate (%)</Label>
                      <Input
                        id="depreciation_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.depreciation_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, depreciation_rate: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="useful_life_months">Useful Life (Months)</Label>
                      <Input
                        id="useful_life_months"
                        type="number"
                        value={formData.useful_life_months}
                        onChange={(e) => setFormData(prev => ({ ...prev, useful_life_months: parseInt(e.target.value) || 60 }))}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Category
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Asset categories defined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Categories in use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories with Assets</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.filter(cat => cat.description).length}
              </div>
              <p className="text-xs text-muted-foreground">Categories with descriptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Tag className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{category.name}</h3>
                        {category.description && (
                          <p className="text-gray-600 text-sm">{category.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {category.depreciation_method || 'Not set'}
                          </Badge>
                          {category.useful_life_months && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(category.useful_life_months / 12)} years
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Created {new Date(category.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Category
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category information and settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCategory}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_name">Category Name</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                    id="edit_description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_depreciation_rate">Depreciation Rate (%)</Label>
                    <Input
                      id="edit_depreciation_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.depreciation_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, depreciation_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit_useful_life_months">Useful Life (Months)</Label>
                    <Input
                      id="edit_useful_life_months"
                      type="number"
                      value={formData.useful_life_months}
                      onChange={(e) => setFormData(prev => ({ ...prev, useful_life_months: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 