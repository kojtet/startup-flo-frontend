import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, Target, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useBudgets } from './useBudgets';
import { BudgetForm } from './BudgetForm';
import { BudgetCard } from './BudgetCard';
import { BudgetFilters } from './BudgetFilters';
import { BudgetPagination } from './BudgetPagination';
import { useAuth } from '@/contexts/AuthContext';
import type { Budget, CreateBudgetData, UpdateBudgetData } from '@/apis/types';

export function BudgetsSection() {
  const { user } = useAuth();
  const {
    budgets,
    filteredBudgets,
    budgetStats,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    scopeTypeFilter,
    setScopeTypeFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    handleCreateBudget,
    handleUpdateBudget,
    handleDeleteBudget
  } = useBudgets();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (budget?: Budget) => {
    setEditingBudget(budget || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (data: CreateBudgetData | UpdateBudgetData) => {
    setIsSubmitting(true);
    try {
      if (editingBudget) {
        await handleUpdateBudget(editingBudget.id, data as UpdateBudgetData);
      } else {
        // Always set the owner_id to the current user's ID
        const budgetData = {
          ...data,
          owner_id: user?.id || ''
        };
        await handleCreateBudget(budgetData as CreateBudgetData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    handleOpenForm(budget);
  };

  const handleDelete = async (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        await handleDeleteBudget(budgetId);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setScopeTypeFilter('all');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetStats.totalBudgets}</div>
            <p className="text-xs text-muted-foreground">
              All budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${budgetStats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined budget value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{budgetStats.activeBudgets}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{budgetStats.completedBudgets}</div>
            <p className="text-xs text-muted-foreground">
              Finished budgets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <BudgetFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          scopeTypeFilter={scopeTypeFilter}
          onScopeTypeFilterChange={setScopeTypeFilter}
          onClearFilters={handleClearFilters}
        />
        
        <Button onClick={() => handleOpenForm()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      {/* Budgets List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading budgets...</span>
          </div>
        ) : budgets.length > 0 ? (
          <>
            <div className="grid gap-4">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isLoading={isSubmitting}
                />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <BudgetPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isLoading={isSubmitting}
                totalItems={filteredBudgets.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No budgets found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get started by creating your first budget.
            </p>
            <Button onClick={() => handleOpenForm()} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </div>
        )}
      </div>

      {/* Budget Form Modal */}
      <BudgetForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        budget={editingBudget}
        isLoading={isSubmitting}
      />
    </div>
  );
} 