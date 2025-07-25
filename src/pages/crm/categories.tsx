import { useState } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { crmSidebarSections } from "@/components/sidebars/CRMSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Edit, Trash2, Loader2, Palette } from "lucide-react";
import { useCRM } from "@/hooks/useCRM";
import { useToast } from "@/hooks/use-toast";
import type { Category, CreateCategoryData, UpdateCategoryData } from "@/apis/types";

export default function LeadCategories() {
  const { toast } = useToast();
  const { 
    categories, 
    isLoadingCategories, 
    categoriesError, 
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  } = useCRM();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
    color: "#3B82F6"
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await createCategory(formData);
      await fetchCategories();
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "", color: "#3B82F6" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      setFormLoading(true);
      await updateCategory(editingCategory.id, formData);
      await fetchCategories();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", color: "#3B82F6" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      await fetchCategories();
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateDialogOpen = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (open) {
      setFormData({ name: "", description: "", color: "#3B82F6" });
    }
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
      setFormData({ name: "", description: "", color: "#3B82F6" });
    }
  };

  if (isLoadingCategories) {
    return (
      <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading categories...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  if (categoriesError) {
    return (
      <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading categories: {categoriesError}</p>
            <Button onClick={fetchCategories}>Retry</Button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={crmSidebarSections} moduleTitle="Customer Relationship Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="h-8 w-8" />
              Lead Categories
            </h1>
            <p className="text-gray-600 mt-2">Organize your leads with custom categories</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => handleCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Category
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => openEditDialog(category)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
                  <Badge variant="outline" className="text-xs">
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.color}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 text-center mb-4">
                Get started by creating your first lead category.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Name *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label htmlFor="edit_color">Color *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit_color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 