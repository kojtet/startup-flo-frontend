import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useTransactions } from './useTransactions';
import { TransactionForm } from './TransactionForm';
import { TransactionCard } from './TransactionCard';
import { TransactionFilters } from './TransactionFilters';
import { TransactionPagination } from './TransactionPagination';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, CreateTransactionData, UpdateTransactionData } from '@/apis/types';

export function TransactionsSection() {
  const { toast } = useToast();
  const { 
    accounts, 
    categories, 
    budgets,
    isLoadingAccounts,
    isLoadingCategories,
    isLoadingBudgets
  } = useFinance();

  const {
    // State
    filteredTransactions,
    currentPage,
    totalPages,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    accountFilter,
    setAccountFilter,
    categoryFilter,
    setCategoryFilter,
    budgetAllocationFilter,
    setBudgetAllocationFilter,
    setCurrentPage,
    handleCreateTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    refreshTransactions
  } = useTransactions();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Handle data loading errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load transaction data. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleCreate = async (data: CreateTransactionData) => {
    try {
      await handleCreateTransaction(data);
      toast({
        title: "Success",
        description: "Transaction created successfully.",
      });
      setIsFormOpen(false);
      refreshTransactions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (data: UpdateTransactionData) => {
    if (!editingTransaction) return;
    try {
      await handleUpdateTransaction(editingTransaction.id, data);
      toast({
        title: "Success",
        description: "Transaction updated successfully.",
      });
      setEditingTransaction(null);
      refreshTransactions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (transactionId: string) => {
    try {
      await handleDeleteTransaction(transactionId);
      toast({
        title: "Success",
        description: "Transaction deleted successfully.",
      });
      refreshTransactions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleFormSubmit = async (data: CreateTransactionData | UpdateTransactionData) => {
    if (editingTransaction) {
      await handleUpdate(data as UpdateTransactionData);
    } else {
      await handleCreate(data as CreateTransactionData);
    }
  };

  // Get related data for transaction cards
  const getAccountById = (id: string) => accounts.find(acc => acc.id === id);
  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);

  const allBudgetAllocations = budgets.flatMap(b => b.allocations ?? []).filter(a => a.id && a.id !== '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaction Ledger</h1>
          <p className="text-muted-foreground">
            Manage and track all financial transactions
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        accountFilter={accountFilter}
        onAccountFilterChange={setAccountFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        budgetAllocationFilter={budgetAllocationFilter}
        onBudgetAllocationFilterChange={setBudgetAllocationFilter}
        accounts={accounts}
        categories={categories}
        budgetAllocations={allBudgetAllocations}
        onClearFilters={() => {}}
      />

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm">Try adjusting your filters or search terms.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEditTransaction}
              onDelete={handleDelete}
              account={getAccountById(transaction.account_id)}
              category={getCategoryById(transaction.category_id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <TransactionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isLoading={isLoading}
          totalItems={filteredTransactions.length}
          itemsPerPage={10}
        />
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        isLoading={isLoading}
        accounts={accounts}
        categories={categories}
        budgetAllocations={allBudgetAllocations}
        isLoadingAccounts={isLoadingAccounts}
        isLoadingCategories={isLoadingCategories}
        isLoadingBudgets={isLoadingBudgets}
      />
    </div>
  );
} 