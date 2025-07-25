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
import { api } from '@/apis';
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
  const { user } = useAuth();
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
    depreciation_rate: 0,
    depreciation_method: 'straight_line',
    useful_life_months: 60
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.assets.getAssetCategories();
      setCategories(response || []);
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
    try {
      setFormLoading(true);
      const newCategory = await api.assets.createAssetCategory(formData);
      setCategories(prev => [newCategory, ...prev]);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Category created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      setFormLoading(true);
      const updateData: UpdateAssetCategoryData = {
        name: formData.name,
        description: formData.description,
        depreciation_rate: formData.depreciation_rate
      };

      const updatedCategory = await api.assets.updateAssetCategory(selectedCategory.id, updateData);
      setCategories(prev => prev.map(cat => 
        cat.id === selectedCategory.id ? updatedCategory : cat
      ));
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.assets.deleteAssetCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (category: AssetCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      depreciation_rate: 0, // Default value since it's not in AssetCategory
      depreciation_method: category.depreciation_method || 'straight_line',
      useful_life_months: category.useful_life_months || 60
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      depreciation_rate: 0,
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
      <ExtensibleLayout moduleSidebar={assetsSidebarSections} moduleTitle="Asset Management" user={{
        name: '',
        email: '',
        role: '',
        avatarUrl: '',
        companyId: ''
      }}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={assetsSidebarSections} moduleTitle="Asset Management" user={{
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url || '',
      companyId: user.company_id || ''
    }}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
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
                </CardHeader>
                <CardContent>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Depreciation Method:</span>
                      <Badge variant="secondary">{category.depreciation_method || 'Not set'}</Badge>
                    </div>
                    
                    {category.useful_life_months && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Useful Life:</span>
                        <span>{Math.round(category.useful_life_months / 12)} years</span>
                      </div>
                    )}
                    
                    {category.salvage_percentage && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Salvage Value:</span>
                        <span>{category.salvage_percentage}%</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span>{new Date(category.created_at).toLocaleDateString()}</span>
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