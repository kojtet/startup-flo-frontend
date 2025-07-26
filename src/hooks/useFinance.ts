import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type {
  FinancialAccount,
  CreateFinancialAccountData,
  UpdateFinancialAccountData,
  FinanceCategory,
  CreateFinanceCategoryData,
  UpdateFinanceCategoryData,
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
  Transaction,
  CreateTransactionData,
  UpdateTransactionData
} from '@/apis/types';

export function useFinance() {
  const { user, apiClient } = useAuth() as any;
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
  const [budgetsError, setBudgetsError] = useState<string | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setAccountsError('No company ID available');
      return;
    }

    setIsLoadingAccounts(true);
    setAccountsError(null);

    try {
      const response = await apiClient.get('/finance/accounts', { params });
      console.log('Accounts API response:', response.data);
      // Handle potential nested structure: response.data.accounts or response.data
      setAccounts(response.data.accounts || response.data);
    } catch (error: any) {
      console.error('Failed to fetch accounts:', error);
      setAccountsError(error.response?.data?.message || 'Failed to fetch accounts');
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [user?.company_id, apiClient]);

  const createAccount = useCallback(async (accountData: CreateFinancialAccountData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const accountPayload = {
      name: accountData.name,
      type: accountData.type,
      currency: accountData.currency,
      is_primary: accountData.is_primary,
      balance: accountData.balance,
      description: accountData.description || null
    };

    console.log('Creating account with payload:', accountPayload);
    try {
      const response = await apiClient.post('/finance/accounts', accountPayload);
      return response.data;
    } catch (error: any) {
      console.error('Account creation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }, [user?.company_id, apiClient]);

  const updateAccount = useCallback(async (accountId: string, accountData: UpdateFinancialAccountData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/finance/accounts/${accountId}`, accountData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteAccount = useCallback(async (accountId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/finance/accounts/${accountId}`);
  }, [user?.company_id, apiClient]);

  const getAccountById = useCallback(async (accountId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/finance/accounts/${accountId}`);
    return response.data;
  }, [user?.company_id, apiClient]);

  const fetchCategories = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setCategoriesError('No company ID available');
      return;
    }

    setIsLoadingCategories(true);
    setCategoriesError(null);

    try {
      const response = await apiClient.get('/finance/categories', { params });
      console.log('Categories API response:', response.data);
      // Handle potential nested structure: response.data.categories or response.data
      setCategories(response.data.categories || response.data);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      setCategoriesError(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [user?.company_id, apiClient]);

  const createCategory = useCallback(async (categoryData: CreateFinanceCategoryData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const categoryPayload = {
      name: categoryData.name,
      type: categoryData.type,
      description: categoryData.description || null,
      color: categoryData.color
    };

    console.log('Creating category with payload:', categoryPayload);
    try {
      const response = await apiClient.post('/finance/categories', categoryPayload);
      return response.data;
    } catch (error: any) {
      console.error('Category creation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }, [user?.company_id, apiClient]);

  const updateCategory = useCallback(async (categoryId: string, categoryData: UpdateFinanceCategoryData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.patch(`/finance/categories/${categoryId}`, categoryData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/finance/categories/${categoryId}`);
  }, [user?.company_id, apiClient]);

  const getCategoryById = useCallback(async (categoryId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/finance/categories/${categoryId}`);
    return response.data;
  }, [user?.company_id, apiClient]);

  const fetchBudgets = useCallback(async (params?: any) => {
    if (!user?.company_id) {
      setBudgetsError('No company ID available');
      return;
    }

    setIsLoadingBudgets(true);
    setBudgetsError(null);

    try {
      const response = await apiClient.get('/finance/budgets', { params });
      console.log('Budgets API response:', response.data);
      // Handle potential nested structure: response.data.budgets or response.data
      setBudgets(response.data.budgets || response.data);
    } catch (error: any) {
      console.error('Failed to fetch budgets:', error);
      setBudgetsError(error.response?.data?.message || 'Failed to fetch budgets');
    } finally {
      setIsLoadingBudgets(false);
    }
  }, [user?.company_id, apiClient]);

  const createBudget = useCallback(async (budgetData: CreateBudgetData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const budgetPayload = {
      name: budgetData.name,
      scope_type: budgetData.scope_type,
      scope_ref: budgetData.scope_ref,
      period_start: budgetData.period_start,
      period_end: budgetData.period_end,
      owner_id: budgetData.owner_id,
      total_amount: budgetData.total_amount,
      status: budgetData.status || 'active'
    };

    console.log('Creating budget with payload:', budgetPayload);
    try {
      const response = await apiClient.post('/finance/budgets', budgetPayload);
      return response.data;
    } catch (error: any) {
      console.error('Budget creation error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }, [user?.company_id, apiClient]);

  const updateBudget = useCallback(async (budgetId: string, budgetData: UpdateBudgetData) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.put(`/finance/budgets/${budgetId}`, budgetData);
    return response.data;
  }, [user?.company_id, apiClient]);

  const deleteBudget = useCallback(async (budgetId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    await apiClient.delete(`/finance/budgets/${budgetId}`);
  }, [user?.company_id, apiClient]);

  const getBudgetById = useCallback(async (budgetId: string) => {
    if (!user?.company_id) {
      throw new Error('No company ID available');
    }

    const response = await apiClient.get(`/finance/budgets/${budgetId}`);
    return response.data;
  }, [user?.company_id, apiClient]);

  // Fetch transactions
  const fetchTransactions = useCallback(async (params?: any) => {
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    try {
      const response = await apiClient.get('/finance/transactions', { params });
      setTransactions(response.data.transactions || response.data);
    } catch (error: any) {
      setTransactionsError(error.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [apiClient]);

  // Create transaction
  const createTransaction = useCallback(async (data: CreateTransactionData) => {
    const response = await apiClient.post('/finance/transactions', data);
    return response.data;
  }, [apiClient]);

  // Update transaction
  const updateTransaction = useCallback(async (id: string, data: UpdateTransactionData) => {
    const response = await apiClient.put(`/finance/transactions/${id}`, data);
    return response.data;
  }, [apiClient]);

  // Delete transaction
  const deleteTransaction = useCallback(async (id: string) => {
    await apiClient.delete(`/finance/transactions/${id}`);
  }, [apiClient]);

  // Get transaction by ID
  const getTransactionById = useCallback(async (id: string) => {
    const response = await apiClient.get(`/finance/transactions/${id}`);
    return response.data;
  }, [apiClient]);

  // Load data on mount and when company_id changes
  useEffect(() => {
    if (user?.company_id) {
      fetchAccounts();
      fetchCategories();
      fetchBudgets();
    }
  }, [user?.company_id, fetchAccounts, fetchCategories, fetchBudgets]);

  return {
    // Account functions
    accounts,
    isLoadingAccounts,
    accountsError,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountById,

    // Category functions
    categories,
    isLoadingCategories,
    categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,

    // Budget functions
    budgets,
    isLoadingBudgets,
    budgetsError,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetById,

    // Transactions
    transactions,
    isLoadingTransactions,
    transactionsError,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
  };
} 