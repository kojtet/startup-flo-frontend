import { useState, useEffect, useCallback } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/hooks/use-toast';
import type { FinanceCategory, CreateFinanceCategoryData, UpdateFinanceCategoryData } from '@/apis/types';

export function useCategories() {
  const { 
    categories, 
    isLoadingCategories, 
    categoriesError, 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  } = useFinance();
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FinanceCategory | null>(null);
  const [formData, setFormData] = useState<CreateFinanceCategoryData>({
    name: '',
    type: 'expense',
    description: '',
    color: '#3b82f6'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        type: 'expense',
        description: '',
        color: '#3b82f6'
      });
      toast({
        title: "Success",
        description: "Category created successfully"
      });
      // Refresh categories immediately after creation
      await fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create category",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      const updateData: UpdateFinanceCategoryData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        color: formData.color
      };

      await updateCategory(selectedCategory.id, updateData);
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
      // Refresh categories immediately after update
      await fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(categoryId);
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      // Refresh categories immediately after deletion
      await fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (category: FinanceCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || '',
      color: category.color || '#3b82f6'
    });
    setIsEditDialogOpen(true);
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || category.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return {
    // State
    categories,
    filteredCategories,
    paginatedCategories,
    incomeCategories,
    expenseCategories,
    isLoadingCategories,
    categoriesError,
    searchTerm,
    typeFilter,
    isCreateDialogOpen,
    isEditDialogOpen,
    selectedCategory,
    formData,
    
    // Pagination state
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    
    // Actions
    setSearchTerm,
    setTypeFilter,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setFormData,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    openEditDialog,
    fetchCategories,
    
    // Pagination actions
    goToPage,
    goToNextPage,
    goToPreviousPage
  };
} 