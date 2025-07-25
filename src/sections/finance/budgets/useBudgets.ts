import { useState, useEffect, useCallback } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/hooks/use-toast';
import type { Budget, CreateBudgetData, UpdateBudgetData } from '@/apis/types';

export function useBudgets() {
  const {
    budgets,
    isLoadingBudgets,
    budgetsError,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetById
  } = useFinance();
  
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeTypeFilter, setScopeTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch budgets on mount
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // Filter budgets based on search and filters
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    const matchesScopeType = scopeTypeFilter === 'all' || budget.scope_type === scopeTypeFilter;
    return matchesSearch && matchesStatus && matchesScopeType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);
  const paginatedBudgets = filteredBudgets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Create budget
  const handleCreateBudget = useCallback(async (budgetData: CreateBudgetData) => {
    try {
      const newBudget = await createBudget(budgetData);
      await fetchBudgets(); // Refresh the list
      toast({
        title: "Success",
        description: "Budget created successfully"
      });
      return newBudget;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create budget",
        variant: "destructive"
      });
      throw error;
    }
  }, [createBudget, fetchBudgets, toast]);

  // Update budget
  const handleUpdateBudget = useCallback(async (budgetId: string, budgetData: UpdateBudgetData) => {
    try {
      const updatedBudget = await updateBudget(budgetId, budgetData);
      await fetchBudgets(); // Refresh the list
      toast({
        title: "Success",
        description: "Budget updated successfully"
      });
      return updatedBudget;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update budget",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateBudget, fetchBudgets, toast]);

  // Delete budget
  const handleDeleteBudget = useCallback(async (budgetId: string) => {
    try {
      await deleteBudget(budgetId);
      await fetchBudgets(); // Refresh the list
      toast({
        title: "Success",
        description: "Budget deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete budget",
        variant: "destructive"
      });
      throw error;
    }
  }, [deleteBudget, fetchBudgets, toast]);

  // Get budget by ID
  const handleGetBudgetById = useCallback(async (budgetId: string) => {
    try {
      return await getBudgetById(budgetId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch budget details",
        variant: "destructive"
      });
      throw error;
    }
  }, [getBudgetById, toast]);

  // Calculate budget statistics
  const budgetStats = {
    totalBudgets: budgets.length,
    totalAmount: budgets.reduce((sum, budget) => sum + budget.total_amount, 0),
    activeBudgets: budgets.filter(b => b.status === 'active').length,
    completedBudgets: budgets.filter(b => b.status === 'completed').length,
    averageBudget: budgets.length > 0 ? budgets.reduce((sum, budget) => sum + budget.total_amount, 0) / budgets.length : 0
  };

  return {
    // Data
    budgets: paginatedBudgets,
    allBudgets: budgets,
    filteredBudgets,
    budgetStats,
    
    // Loading and error states
    isLoading: isLoadingBudgets,
    error: budgetsError,
    
    // Filters and search
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    scopeTypeFilter,
    setScopeTypeFilter,
    
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    
    // Actions
    handleCreateBudget,
    handleUpdateBudget,
    handleDeleteBudget,
    handleGetBudgetById,
    refreshBudgets: fetchBudgets
  };
} 