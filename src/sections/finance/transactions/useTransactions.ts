import { useState, useEffect, useCallback } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, CreateTransactionData, UpdateTransactionData } from '@/apis/types';

export function useTransactions() {
  const {
    transactions,
    isLoadingTransactions,
    transactionsError,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById
  } = useFinance();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [budgetAllocationFilter, setBudgetAllocationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filtering
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesAccount = accountFilter === 'all' || transaction.account_id === accountFilter;
    const matchesCategory = categoryFilter === 'all' || transaction.category_id === categoryFilter;
    const matchesBudgetAllocation = budgetAllocationFilter === 'all' || transaction.budget_allocation_id === budgetAllocationFilter;
    return matchesSearch && matchesType && matchesAccount && matchesCategory && matchesBudgetAllocation;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CRUD actions
  const handleCreateTransaction = useCallback(async (data: CreateTransactionData) => {
    try {
      const newTransaction = await createTransaction(data);
      await fetchTransactions();
      toast({ title: 'Success', description: 'Transaction created successfully' });
      return newTransaction;
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create transaction', variant: 'destructive' });
      throw error;
    }
  }, [createTransaction, fetchTransactions, toast]);

  const handleUpdateTransaction = useCallback(async (id: string, data: UpdateTransactionData) => {
    try {
      const updatedTransaction = await updateTransaction(id, data);
      await fetchTransactions();
      toast({ title: 'Success', description: 'Transaction updated successfully' });
      return updatedTransaction;
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update transaction', variant: 'destructive' });
      throw error;
    }
  }, [updateTransaction, fetchTransactions, toast]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    try {
      await deleteTransaction(id);
      await fetchTransactions();
      toast({ title: 'Success', description: 'Transaction deleted successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to delete transaction', variant: 'destructive' });
      throw error;
    }
  }, [deleteTransaction, fetchTransactions, toast]);

  // Stats
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalIncome - totalExpenses;

  return {
    transactions: paginatedTransactions,
    allTransactions: transactions,
    filteredTransactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
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
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    handleCreateTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    getTransactionById,
    totalIncome,
    totalExpenses,
    netAmount,
    refreshTransactions: fetchTransactions
  };
} 