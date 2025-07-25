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
    transactions, 
    accounts, 
    categories, 
    budgetAllocations,
    isLoading: isDataLoading,
    error: dataError,
    refetch: refetchData
  } = useFinance();

  const {
    // State
    filteredTransactions,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    isSubmitting,
    
    // Filters
    searchTerm,
    typeFilter,
    accountFilter,
    categoryFilter,
    budgetAllocationFilter,
    
    // Actions
    setSearchTerm,
    setTypeFilter,
    setAccountFilter,
    setCategoryFilter,
    setBudgetAllocationFilter,
    setCurrentPage,
    clearFilters,
    
    // CRUD operations
    createTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions();

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Handle data loading errors
  useEffect(() => {
    if (dataError) {
      toast({
        title: "Error",
        description: "Failed to load transaction data. Please try again.",
        variant: "destructive",
      });
    }
  }, [dataError, toast]);

  const handleCreateTransaction = async (data: CreateTransactionData) => {
    try {
      await createTransaction(data);
      toast({
        title: "Success",
        description: "Transaction created successfully.",
      });
      setIsFormOpen(false);
      refetchData(); // Refresh data to get updated lists
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTransaction = async (data: UpdateTransactionData) => {
    if (!editingTransaction) return;
    
    try {
      await updateTransaction(editingTransaction.id, data);
      toast({
        title: "Success",
        description: "Transaction updated successfully.",
      });
      setEditingTransaction(null);
      refetchData(); // Refresh data to get updated lists
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      toast({
        title: "Success",
        description: "Transaction deleted successfully.",
      });
      refetchData(); // Refresh data to get updated lists
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
      await handleUpdateTransaction(data as UpdateTransactionData);
    } else {
      await handleCreateTransaction(data as CreateTransactionData);
    }
  };

  // Get related data for transaction cards
  const getAccountById = (id: string) => accounts.find(acc => acc.id === id);
  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);

  if (isDataLoading) {
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
        <Button onClick={() => setIsFormOpen(true)} disabled={isSubmitting}>
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
        onClearFilters={clearFilters}
        accounts={accounts}
        categories={categories}
        budgetAllocations={budgetAllocations}
      />

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading transactions...</span>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || typeFilter !== 'all' || accountFilter !== 'all' || 
             categoryFilter !== 'all' || budgetAllocationFilter !== 'all' ? (
              <>
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm">Try adjusting your filters or search terms.</p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No transactions yet</p>
                <p className="text-sm">Get started by creating your first transaction.</p>
                <Button 
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              isLoading={isSubmitting}
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
          totalItems={totalItems}
          itemsPerPage={10}
        />
      )}

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        transaction={editingTransaction}
        isLoading={isSubmitting}
        accounts={accounts}
        categories={categories}
        budgetAllocations={budgetAllocations}
      />
    </div>
  );
} 