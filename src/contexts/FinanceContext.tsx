import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/apis";
import { useAuth } from "./AuthContext";
import type {
  Budget,
  Transaction,
  Invoice,
  Expense,
  Category,
  CreateBudgetData,
  UpdateBudgetData,
  CreateTransactionData,
  UpdateTransactionData,
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateExpenseData,
  UpdateExpenseData,
  CreateCategoryData,
  UpdateCategoryData,
  PaginationParams,
} from "@/apis/types";
import { ApiError } from "@/apis/core/errors";

interface FinanceCache {
  budgets: {
    data: Budget[];
    timestamp: number;
  } | null;
  transactions: {
    data: Transaction[];
    timestamp: number;
  } | null;
  invoices: {
    data: Invoice[];
    timestamp: number;
  } | null;
  expenses: {
    data: Expense[];
    timestamp: number;
  } | null;
  categories: {
    data: Category[];
    timestamp: number;
  } | null;
}

interface FinanceContextType {
  // Cache state
  cache: FinanceCache;
  
  // Data state
  budgets: Budget[];
  transactions: Transaction[];
  invoices: Invoice[];
  expenses: Expense[];
  categories: Category[];
  
  // Loading states
  isLoadingBudgets: boolean;
  isLoadingTransactions: boolean;
  isLoadingInvoices: boolean;
  isLoadingExpenses: boolean;
  isLoadingCategories: boolean;
  
  // Error states
  budgetsError: string | null;
  transactionsError: string | null;
  invoicesError: string | null;
  expensesError: string | null;
  categoriesError: string | null;
  
  // Optimized data access methods (replaces inefficient service methods)
  getBudgetsOptimized: (useCache?: boolean) => Promise<Budget[]>;
  getActiveBudgets: () => Budget[];
  getInactiveBudgets: () => Budget[];
  getBudgetsByDepartment: (departmentId: string) => Budget[];
  getBudgetsByPeriod: (period: string) => Budget[];
  getTotalBudgetAmount: () => number;
  getBudgetUtilization: () => { totalBudget: number; totalSpent: number; utilization: number };
  
  getTransactionsOptimized: (useCache?: boolean) => Promise<Transaction[]>;
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  getIncomeTransactions: () => Transaction[];
  getExpenseTransactions: () => Transaction[];
  getTransactionsByDateRange: (startDate: string, endDate: string) => Transaction[];
  getTransactionsByAmountRange: (minAmount: number, maxAmount: number) => Transaction[];
  getTotalTransactionAmount: (type?: Transaction['type']) => number;
  
  getInvoicesOptimized: (useCache?: boolean) => Promise<Invoice[]>;
  getInvoicesByStatus: (status: Invoice['status']) => Invoice[];
  getDraftInvoices: () => Invoice[];
  getSentInvoices: () => Invoice[];
  getPaidInvoices: () => Invoice[];
  getOverdueInvoices: () => Invoice[];
  getInvoicesByClient: (clientId: string) => Invoice[];
  getInvoicesByDateRange: (startDate: string, endDate: string) => Invoice[];
  getTotalInvoiceAmount: (status?: Invoice['status']) => number;
  getOutstandingAmount: () => number;
  
  getExpensesOptimized: (useCache?: boolean) => Promise<Expense[]>;
  getExpensesByStatus: (status: Expense['status']) => Expense[];
  getPendingExpenses: () => Expense[];
  getApprovedExpenses: () => Expense[];
  getRejectedExpenses: () => Expense[];
  getExpensesByCategory: (categoryId: string) => Expense[];
  getExpensesByEmployee: (employeeId: string) => Expense[];
  getExpensesByDateRange: (startDate: string, endDate: string) => Expense[];
  getTotalExpenseAmount: (status?: Expense['status']) => number;
  getExpensesByAmountRange: (minAmount: number, maxAmount: number) => Expense[];
  
  getCategoriesOptimized: (useCache?: boolean) => Promise<Category[]>;
  getActiveCategories: () => Category[];
  getInactiveCategories: () => Category[];
  
  // Financial summary methods
  getCashFlow: (startDate?: string, endDate?: string) => { income: number; expenses: number; netFlow: number };
  getMonthlyFinancialSummary: () => { 
    totalBudget: number; 
    totalSpent: number; 
    totalIncome: number; 
    totalExpenses: number; 
    netIncome: number;
    budgetUtilization: number;
  };
  
  // Standard CRUD operations (maintain compatibility)
  fetchBudgets: (params?: any) => Promise<void>;
  fetchTransactions: (params?: any) => Promise<void>;
  fetchInvoices: (params?: any) => Promise<void>;
  fetchExpenses: (params?: any) => Promise<void>;
  fetchCategories: (params?: any) => Promise<void>;
  
  // Budget CRUD
  createBudget: (data: CreateBudgetData) => Promise<Budget>;
  updateBudget: (id: string, data: UpdateBudgetData) => Promise<Budget>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Transaction CRUD
  createTransaction: (data: CreateTransactionData) => Promise<Transaction>;
  updateTransaction: (id: string, data: UpdateTransactionData) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Invoice CRUD
  createInvoice: (data: CreateInvoiceData) => Promise<Invoice>;
  updateInvoice: (id: string, data: UpdateInvoiceData) => Promise<Invoice>;
  sendInvoice: (id: string) => Promise<Invoice>;
  markInvoiceAsPaid: (id: string) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  
  // Expense CRUD
  createExpense: (data: CreateExpenseData) => Promise<Expense>;
  updateExpense: (id: string, data: UpdateExpenseData) => Promise<Expense>;
  approveExpense: (id: string) => Promise<Expense>;
  rejectExpense: (id: string) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  
  // Category CRUD
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  invalidateCache: (type?: keyof FinanceCache) => void;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Cache duration: 5 minutes for financial data (frequently changing)
const CACHE_DURATION = {
  STATIC: 10 * 60 * 1000,   // 10 minutes - categories, budgets
  DYNAMIC: 5 * 60 * 1000,   // 5 minutes - transactions, invoices, expenses
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Cache state
  const [cache, setCache] = useState<FinanceCache>({
    budgets: null,
    transactions: null,
    invoices: null,
    expenses: null,
    categories: null,
  });
  
  // Data state
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Loading states
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  // Error states
  const [budgetsError, setBudgetsError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);
  const [expensesError, setExpensesError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
  
  // Helper function to check if cache is valid
  const isCacheValid = (cacheItem: { timestamp: number } | null, duration: number): boolean => {
    if (!cacheItem) return false;
    return Date.now() - cacheItem.timestamp < duration;
  };
  
  // ================================
  // OPTIMIZED DATA ACCESS METHODS
  // ================================
  
  // Budget methods
  const getBudgetsOptimized = useCallback(async (useCache: boolean = true): Promise<Budget[]> => {
    if (useCache && isCacheValid(cache.budgets, CACHE_DURATION.STATIC)) {
      return cache.budgets!.data;
    }
    
    setIsLoadingBudgets(true);
    setBudgetsError(null);
    try {
      // @ts-ignore
      const data = await api.finance.getBudgets();
      setBudgets(data);
      setCache(prev => ({
        ...prev,
        budgets: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load budgets";
      setBudgetsError(errorMessage);
      throw err;
    } finally {
      setIsLoadingBudgets(false);
    }
  }, [cache.budgets]);
  
  const getActiveBudgets = useCallback((): Budget[] => {
    return budgets.filter(budget => budget.status === 'active');
  }, [budgets]);
  
  const getInactiveBudgets = useCallback((): Budget[] => {
    return budgets.filter(budget => budget.status === 'inactive');
  }, [budgets]);
  
  const getBudgetsByDepartment = useCallback((departmentId: string): Budget[] => {
    return budgets.filter(budget => budget.scope_type === 'department' && budget.scope_ref === departmentId);
  }, [budgets]);
  
  const getBudgetsByPeriod = useCallback((period: string): Budget[] => {
    return budgets.filter(budget => {
      const startDate = new Date(budget.period_start);
      const endDate = new Date(budget.period_end);
      const periodStart = new Date(period);
      return startDate <= periodStart && endDate >= periodStart;
    });
  }, [budgets]);
  
  const getTotalBudgetAmount = useCallback((): number => {
    return budgets.reduce((total, budget) => total + (budget.total_amount || 0), 0);
  }, [budgets]);
  
  const getBudgetUtilization = useCallback((): { totalBudget: number; totalSpent: number; utilization: number } => {
    const totalBudget = getTotalBudgetAmount();
    // Calculate spent from allocations
    const totalSpent = budgets.reduce((total, budget) => {
      const spent = budget.allocations?.reduce((allocTotal, allocation) => 
        allocTotal + (allocation.amount_allocated || 0), 0) || 0;
      return total + spent;
    }, 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    return { totalBudget, totalSpent, utilization };
  }, [budgets, getTotalBudgetAmount]);
  
  // Transaction methods
  const getTransactionsOptimized = useCallback(async (useCache: boolean = true): Promise<Transaction[]> => {
    if (useCache && isCacheValid(cache.transactions, CACHE_DURATION.DYNAMIC)) {
      return cache.transactions!.data;
    }
    
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    try {
      // @ts-ignore
      const data = await api.finance.getTransactions();
      setTransactions(data);
      setCache(prev => ({
        ...prev,
        transactions: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load transactions";
      setTransactionsError(errorMessage);
      throw err;
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [cache.transactions]);
  
  const getTransactionsByType = useCallback((type: Transaction['type']): Transaction[] => {
    return transactions.filter(transaction => transaction.type === type);
  }, [transactions]);
  
  const getIncomeTransactions = useCallback((): Transaction[] => {
    return getTransactionsByType('income');
  }, [getTransactionsByType]);
  
  const getExpenseTransactions = useCallback((): Transaction[] => {
    return getTransactionsByType('expense');
  }, [getTransactionsByType]);
  
  const getTransactionsByDateRange = useCallback((startDate: string, endDate: string): Transaction[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions]);
  
  const getTransactionsByAmountRange = useCallback((minAmount: number, maxAmount: number): Transaction[] => {
    return transactions.filter(transaction => 
      transaction.amount >= minAmount && transaction.amount <= maxAmount
    );
  }, [transactions]);
  
  const getTotalTransactionAmount = useCallback((type?: Transaction['type']): number => {
    const filteredTransactions = type ? getTransactionsByType(type) : transactions;
    return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions, getTransactionsByType]);
  
  // Invoice methods
  const getInvoicesOptimized = useCallback(async (useCache: boolean = true): Promise<Invoice[]> => {
    if (useCache && isCacheValid(cache.invoices, CACHE_DURATION.DYNAMIC)) {
      return cache.invoices!.data;
    }
    
    setIsLoadingInvoices(true);
    setInvoicesError(null);
    try {
      // @ts-ignore
      const data = await api.finance.getInvoices();
      setInvoices(data);
      setCache(prev => ({
        ...prev,
        invoices: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load invoices";
      setInvoicesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingInvoices(false);
    }
  }, [cache.invoices]);
  
  const getInvoicesByStatus = useCallback((status: Invoice['status']): Invoice[] => {
    return invoices.filter(invoice => invoice.status === status);
  }, [invoices]);
  
  const getDraftInvoices = useCallback((): Invoice[] => {
    return getInvoicesByStatus('draft');
  }, [getInvoicesByStatus]);
  
  const getSentInvoices = useCallback((): Invoice[] => {
    return getInvoicesByStatus('sent');
  }, [getInvoicesByStatus]);
  
  const getPaidInvoices = useCallback((): Invoice[] => {
    return getInvoicesByStatus('paid');
  }, [getInvoicesByStatus]);
  
  const getOverdueInvoices = useCallback((): Invoice[] => {
    const now = new Date();
    return invoices.filter(invoice => {
      if (invoice.status === 'paid') return false;
      const dueDate = new Date(invoice.due_date);
      return dueDate < now;
    });
  }, [invoices]);
  
  const getInvoicesByClient = useCallback((clientId: string): Invoice[] => {
    return invoices.filter(invoice => invoice.client_name === clientId);
  }, [invoices]);
  
  const getInvoicesByDateRange = useCallback((startDate: string, endDate: string): Invoice[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.issue_date);
      return invoiceDate >= start && invoiceDate <= end;
    });
  }, [invoices]);
  
  const getTotalInvoiceAmount = useCallback((status?: Invoice['status']): number => {
    const filteredInvoices = status ? getInvoicesByStatus(status) : invoices;
    return filteredInvoices.reduce((total, invoice) => total + invoice.amount, 0);
  }, [invoices, getInvoicesByStatus]);
  
  const getOutstandingAmount = useCallback((): number => {
    const sentInvoices = getSentInvoices();
    const overdueInvoices = getOverdueInvoices();
    const allOutstanding = [...sentInvoices, ...overdueInvoices];
    // Remove duplicates
    const uniqueOutstanding = allOutstanding.filter((invoice, index, self) => 
      index === self.findIndex(i => i.id === invoice.id)
    );
    return uniqueOutstanding.reduce((total, invoice) => total + invoice.amount, 0);
  }, [getSentInvoices, getOverdueInvoices]);
  
  // Expense methods
  const getExpensesOptimized = useCallback(async (useCache: boolean = true): Promise<Expense[]> => {
    if (useCache && isCacheValid(cache.expenses, CACHE_DURATION.DYNAMIC)) {
      return cache.expenses!.data;
    }
    
    setIsLoadingExpenses(true);
    setExpensesError(null);
    try {
      // @ts-ignore
      const data = await api.finance.getExpenses();
      setExpenses(data);
      setCache(prev => ({
        ...prev,
        expenses: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load expenses";
      setExpensesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [cache.expenses]);
  
  const getExpensesByStatus = useCallback((status: Expense['status']): Expense[] => {
    return expenses.filter(expense => expense.status === status);
  }, [expenses]);
  
  const getPendingExpenses = useCallback((): Expense[] => {
    return getExpensesByStatus('pending');
  }, [getExpensesByStatus]);
  
  const getApprovedExpenses = useCallback((): Expense[] => {
    return getExpensesByStatus('approved');
  }, [getExpensesByStatus]);
  
  const getRejectedExpenses = useCallback((): Expense[] => {
    return getExpensesByStatus('rejected');
  }, [getExpensesByStatus]);
  
  const getExpensesByCategory = useCallback((categoryId: string): Expense[] => {
    return expenses.filter(expense => expense.category === categoryId);
  }, [expenses]);
  
  const getExpensesByEmployee = useCallback((employeeId: string): Expense[] => {
    return expenses.filter(expense => expense.submitted_by === employeeId);
  }, [expenses]);
  
  const getExpensesByDateRange = useCallback((startDate: string, endDate: string): Expense[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.submitted_date);
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses]);
  
  const getTotalExpenseAmount = useCallback((status?: Expense['status']): number => {
    const filteredExpenses = status ? getExpensesByStatus(status) : expenses;
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses, getExpensesByStatus]);
  
  const getExpensesByAmountRange = useCallback((minAmount: number, maxAmount: number): Expense[] => {
    return expenses.filter(expense => 
      expense.amount >= minAmount && expense.amount <= maxAmount
    );
  }, [expenses]);
  
  // Categories
  const getCategoriesOptimized = useCallback(async (useCache: boolean = true): Promise<Category[]> => {
    if (useCache && isCacheValid(cache.categories, CACHE_DURATION.STATIC)) {
      return cache.categories!.data;
    }
    
    setIsLoadingCategories(true);
    setCategoriesError(null);
    try {
      // @ts-ignore
      const data = await api.finance.getCategories();
      setCategories(data);
      setCache(prev => ({
        ...prev,
        categories: { data, timestamp: Date.now() }
      }));
      return data;
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to load categories";
      setCategoriesError(errorMessage);
      throw err;
    } finally {
      setIsLoadingCategories(false);
    }
  }, [cache.categories]);
  
  const getActiveCategories = useCallback((): Category[] => {
    return categories.filter(category => category.name && category.name.length > 0);
  }, [categories]);
  
  const getInactiveCategories = useCallback((): Category[] => {
    return categories.filter(category => !category.name || category.name.length === 0);
  }, [categories]);
  
  // Financial summary methods
  const getCashFlow = useCallback((startDate?: string, endDate?: string): { income: number; expenses: number; netFlow: number } => {
    let incomeTransactions = getIncomeTransactions();
    let expenseTransactions = getExpenseTransactions();
    
    if (startDate && endDate) {
      incomeTransactions = getTransactionsByDateRange(startDate, endDate).filter(t => t.type === 'income');
      expenseTransactions = getTransactionsByDateRange(startDate, endDate).filter(t => t.type === 'expense');
    }
    
    const income = incomeTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    const expenses = expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    const netFlow = income - expenses;
    
    return { income, expenses, netFlow };
  }, [getIncomeTransactions, getExpenseTransactions, getTransactionsByDateRange]);
  
  const getMonthlyFinancialSummary = useCallback(() => {
    const { totalBudget, totalSpent, utilization } = getBudgetUtilization();
    const { income, expenses, netFlow } = getCashFlow();
    const totalExpenseAmount = getTotalExpenseAmount('approved');
    
    return {
      totalBudget,
      totalSpent,
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: netFlow,
      budgetUtilization: utilization,
    };
  }, [getBudgetUtilization, getCashFlow, getTotalExpenseAmount]);
  
  // ================================
  // STANDARD CRUD OPERATIONS
  // ================================
  
  const fetchBudgets = useCallback(async (params?: any) => {
    await getBudgetsOptimized(false);
  }, [getBudgetsOptimized]);
  
  const fetchTransactions = useCallback(async (params?: any) => {
    await getTransactionsOptimized(false);
  }, [getTransactionsOptimized]);
  
  const fetchInvoices = useCallback(async (params?: any) => {
    await getInvoicesOptimized(false);
  }, [getInvoicesOptimized]);
  
  const fetchExpenses = useCallback(async (params?: any) => {
    await getExpensesOptimized(false);
  }, [getExpensesOptimized]);
  
  const fetchCategories = useCallback(async (params?: any) => {
    await getCategoriesOptimized(false);
  }, [getCategoriesOptimized]);
  
  // Budget CRUD operations
  const createBudget = useCallback(async (data: CreateBudgetData): Promise<Budget> => {
    try {
      // @ts-ignore
      const newBudget = await api.finance.createBudget(data);
      setCache(prev => ({ ...prev, budgets: null }));
      await getBudgetsOptimized(false);
      return newBudget;
    } catch (err) {
      throw err;
    }
  }, [getBudgetsOptimized]);
  
  const updateBudget = useCallback(async (budgetId: string, data: UpdateBudgetData): Promise<Budget> => {
    try {
      // @ts-ignore
      const updatedBudget = await api.finance.updateBudget(budgetId, data);
      setBudgets(prev => prev.map(budget => budget.id === budgetId ? updatedBudget : budget));
      setCache(prev => prev.budgets ? {
        ...prev,
        budgets: {
          ...prev.budgets,
          data: prev.budgets.data.map(budget => budget.id === budgetId ? updatedBudget : budget)
        }
      } : prev);
      return updatedBudget;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteBudget = useCallback(async (budgetId: string): Promise<void> => {
    try {
      // @ts-ignore
      await api.finance.deleteBudget(budgetId);
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
      setCache(prev => prev.budgets ? {
        ...prev,
        budgets: {
          ...prev.budgets,
          data: prev.budgets.data.filter(budget => budget.id !== budgetId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Transaction CRUD operations
  const createTransaction = useCallback(async (data: CreateTransactionData): Promise<Transaction> => {
    try {
      // @ts-ignore
      const newTransaction = await api.finance.createTransaction(data);
      setCache(prev => ({ ...prev, transactions: null }));
      await getTransactionsOptimized(false);
      return newTransaction;
    } catch (err) {
      throw err;
    }
  }, [getTransactionsOptimized]);
  
  const updateTransaction = useCallback(async (transactionId: string, data: UpdateTransactionData): Promise<Transaction> => {
    try {
      // @ts-ignore
      const updatedTransaction = await api.finance.updateTransaction(transactionId, data);
      setTransactions(prev => prev.map(transaction => transaction.id === transactionId ? updatedTransaction : transaction));
      setCache(prev => prev.transactions ? {
        ...prev,
        transactions: {
          ...prev.transactions,
          data: prev.transactions.data.map(transaction => transaction.id === transactionId ? updatedTransaction : transaction)
        }
      } : prev);
      return updatedTransaction;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteTransaction = useCallback(async (transactionId: string): Promise<void> => {
    try {
      // @ts-ignore
      await api.finance.deleteTransaction(transactionId);
      setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
      setCache(prev => prev.transactions ? {
        ...prev,
        transactions: {
          ...prev.transactions,
          data: prev.transactions.data.filter(transaction => transaction.id !== transactionId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Invoice CRUD operations
  const createInvoice = useCallback(async (data: CreateInvoiceData): Promise<Invoice> => {
    try {
      // @ts-ignore
      const newInvoice = await api.finance.createInvoice(data);
      setCache(prev => ({ ...prev, invoices: null }));
      await getInvoicesOptimized(false);
      return newInvoice;
    } catch (err) {
      throw err;
    }
  }, [getInvoicesOptimized]);
  
  const updateInvoice = useCallback(async (invoiceId: string, data: UpdateInvoiceData): Promise<Invoice> => {
    try {
      // @ts-ignore
      const updatedInvoice = await api.finance.updateInvoice(invoiceId, data);
      setInvoices(prev => prev.map(invoice => invoice.id === invoiceId ? updatedInvoice : invoice));
      setCache(prev => prev.invoices ? {
        ...prev,
        invoices: {
          ...prev.invoices,
          data: prev.invoices.data.map(invoice => invoice.id === invoiceId ? updatedInvoice : invoice)
        }
      } : prev);
      return updatedInvoice;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const sendInvoice = useCallback(async (invoiceId: string): Promise<Invoice> => {
    try {
      // @ts-ignore
      const sentInvoice = await api.finance.updateInvoiceStatus(invoiceId, { status: 'sent' });
      setInvoices(prev => prev.map(invoice => invoice.id === invoiceId ? sentInvoice : invoice));
      setCache(prev => prev.invoices ? {
        ...prev,
        invoices: {
          ...prev.invoices,
          data: prev.invoices.data.map(invoice => invoice.id === invoiceId ? sentInvoice : invoice)
        }
      } : prev);
      return sentInvoice;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const markInvoiceAsPaid = useCallback(async (invoiceId: string): Promise<Invoice> => {
    try {
      // @ts-ignore
      const paidInvoice = await api.finance.updateInvoiceStatus(invoiceId, { status: 'paid' });
      setInvoices(prev => prev.map(invoice => invoice.id === invoiceId ? paidInvoice : invoice));
      setCache(prev => prev.invoices ? {
        ...prev,
        invoices: {
          ...prev.invoices,
          data: prev.invoices.data.map(invoice => invoice.id === invoiceId ? paidInvoice : invoice)
        }
      } : prev);
      return paidInvoice;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteInvoice = useCallback(async (invoiceId: string): Promise<void> => {
    try {
      // @ts-ignore
      await api.finance.deleteInvoice(invoiceId);
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      setCache(prev => prev.invoices ? {
        ...prev,
        invoices: {
          ...prev.invoices,
          data: prev.invoices.data.filter(invoice => invoice.id !== invoiceId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Expense CRUD operations
  const createExpense = useCallback(async (data: CreateExpenseData): Promise<Expense> => {
    try {
      // @ts-ignore
      const newExpense = await api.finance.createExpense(data);
      setCache(prev => ({ ...prev, expenses: null }));
      await getExpensesOptimized(false);
      return newExpense;
    } catch (err) {
      throw err;
    }
  }, [getExpensesOptimized]);
  
  const updateExpense = useCallback(async (expenseId: string, data: UpdateExpenseData): Promise<Expense> => {
    try {
      // @ts-ignore
      const updatedExpense = await api.finance.updateExpense(expenseId, data);
      setExpenses(prev => prev.map(expense => expense.id === expenseId ? updatedExpense : expense));
      setCache(prev => prev.expenses ? {
        ...prev,
        expenses: {
          ...prev.expenses,
          data: prev.expenses.data.map(expense => expense.id === expenseId ? updatedExpense : expense)
        }
      } : prev);
      return updatedExpense;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const approveExpense = useCallback(async (expenseId: string): Promise<Expense> => {
    try {
      // @ts-ignore
      const approvedExpense = await api.finance.approveExpense(expenseId);
      setExpenses(prev => prev.map(expense => expense.id === expenseId ? approvedExpense : expense));
      setCache(prev => prev.expenses ? {
        ...prev,
        expenses: {
          ...prev.expenses,
          data: prev.expenses.data.map(expense => expense.id === expenseId ? approvedExpense : expense)
        }
      } : prev);
      return approvedExpense;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const rejectExpense = useCallback(async (expenseId: string): Promise<Expense> => {
    try {
      // @ts-ignore
      const rejectedExpense = await api.finance.rejectExpense(expenseId);
      setExpenses(prev => prev.map(expense => expense.id === expenseId ? rejectedExpense : expense));
      setCache(prev => prev.expenses ? {
        ...prev,
        expenses: {
          ...prev.expenses,
          data: prev.expenses.data.map(expense => expense.id === expenseId ? rejectedExpense : expense)
        }
      } : prev);
      return rejectedExpense;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteExpense = useCallback(async (expenseId: string): Promise<void> => {
    try {
      // @ts-ignore
      await api.finance.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      setCache(prev => prev.expenses ? {
        ...prev,
        expenses: {
          ...prev.expenses,
          data: prev.expenses.data.filter(expense => expense.id !== expenseId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // Category CRUD operations
  const createCategory = useCallback(async (data: CreateCategoryData): Promise<Category> => {
    try {
      // @ts-ignore
      const newCategory = await api.finance.createCategory(data);
      setCache(prev => ({ ...prev, categories: null }));
      await getCategoriesOptimized(false);
      return newCategory;
    } catch (err) {
      throw err;
    }
  }, [getCategoriesOptimized]);
  
  const updateCategory = useCallback(async (categoryId: string, data: UpdateCategoryData): Promise<Category> => {
    try {
      // @ts-ignore
      const updatedCategory = await api.finance.updateCategory(categoryId, data);
      setCategories(prev => prev.map(category => category.id === categoryId ? updatedCategory : category));
      setCache(prev => prev.categories ? {
        ...prev,
        categories: {
          ...prev.categories,
          data: prev.categories.data.map(category => category.id === categoryId ? updatedCategory : category)
        }
      } : prev);
      return updatedCategory;
    } catch (err) {
      throw err;
    }
  }, []);
  
  const deleteCategory = useCallback(async (categoryId: string): Promise<void> => {
    try {
      // @ts-ignore
      await api.finance.deleteCategory(categoryId);
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      setCache(prev => prev.categories ? {
        ...prev,
        categories: {
          ...prev.categories,
          data: prev.categories.data.filter(category => category.id !== categoryId)
        }
      } : prev);
    } catch (err) {
      throw err;
    }
  }, []);
  
  // ================================
  // CACHE MANAGEMENT
  // ================================
  
  const clearCache = useCallback(() => {
    setCache({
      budgets: null,
      transactions: null,
      invoices: null,
      expenses: null,
      categories: null,
    });
    console.log("Finance cache cleared");
  }, []);
  
  const invalidateCache = useCallback((type?: keyof FinanceCache) => {
    if (type) {
      setCache(prev => ({ ...prev, [type]: null }));
    } else {
      clearCache();
    }
  }, [clearCache]);
  
  const refreshData = useCallback(async () => {
    clearCache();
    await Promise.all([
      getBudgetsOptimized(false),
      getTransactionsOptimized(false),
      getInvoicesOptimized(false),
      getExpensesOptimized(false),
      getCategoriesOptimized(false),
    ]);
  }, [clearCache, getBudgetsOptimized, getTransactionsOptimized, getInvoicesOptimized, getExpensesOptimized, getCategoriesOptimized]);
  
  // Auto-initialize data on auth
  useEffect(() => {
    if (isAuthenticated) {
      // Load static data immediately
      getCategoriesOptimized();
      getBudgetsOptimized();
    } else {
      clearCache();
    }
  }, [isAuthenticated, getBudgetsOptimized, getCategoriesOptimized, clearCache]);
  
  const value: FinanceContextType = {
    // Cache state
    cache,
    
    // Data state
    budgets,
    transactions,
    invoices,
    expenses,
    categories,
    
    // Loading states
    isLoadingBudgets,
    isLoadingTransactions,
    isLoadingInvoices,
    isLoadingExpenses,
    isLoadingCategories,
    
    // Error states
    budgetsError,
    transactionsError,
    invoicesError,
    expensesError,
    categoriesError,
    
    // Optimized data access methods
    getBudgetsOptimized,
    getActiveBudgets,
    getInactiveBudgets,
    getBudgetsByDepartment,
    getBudgetsByPeriod,
    getTotalBudgetAmount,
    getBudgetUtilization,
    
    getTransactionsOptimized,
    getTransactionsByType,
    getIncomeTransactions,
    getExpenseTransactions,
    getTransactionsByDateRange,
    getTransactionsByAmountRange,
    getTotalTransactionAmount,
    
    getInvoicesOptimized,
    getInvoicesByStatus,
    getDraftInvoices,
    getSentInvoices,
    getPaidInvoices,
    getOverdueInvoices,
    getInvoicesByClient,
    getInvoicesByDateRange,
    getTotalInvoiceAmount,
    getOutstandingAmount,
    
    getExpensesOptimized,
    getExpensesByStatus,
    getPendingExpenses,
    getApprovedExpenses,
    getRejectedExpenses,
    getExpensesByCategory,
    getExpensesByEmployee,
    getExpensesByDateRange,
    getTotalExpenseAmount,
    getExpensesByAmountRange,
    
    getCategoriesOptimized,
    getActiveCategories,
    getInactiveCategories,
    
    // Financial summary methods
    getCashFlow,
    getMonthlyFinancialSummary,
    
    // Standard CRUD operations
    fetchBudgets,
    fetchTransactions,
    fetchInvoices,
    fetchExpenses,
    fetchCategories,
    
    createBudget,
    updateBudget,
    deleteBudget,
    
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    createInvoice,
    updateInvoice,
    sendInvoice,
    markInvoiceAsPaid,
    deleteInvoice,
    
    createExpense,
    updateExpense,
    approveExpense,
    rejectExpense,
    deleteExpense,
    
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Cache management
    clearCache,
    invalidateCache,
    refreshData,
  };
  
  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

export default FinanceContext; 