import { ApiClient, type ApiConfigOverride } from "../core/client";
import { FINANCE_ENDPOINTS } from "../endpoints/finance";
import { handleApiError } from "../core/errors";
import type {
  FinanceOverview,
  Invoice,
  CreateInvoiceData,
  UpdateInvoiceData,
  UpdateInvoiceStatusData,
  RecordPaymentData,
  InvoicesResponse,
  InvoiceResponse,
  Expense,
  CreateExpenseData,
  UpdateExpenseData,
  UpdateExpenseStatusData,
  ExpensesResponse,
  ExpenseResponse,
  Payment,
  CreatePaymentData,
  UpdatePaymentData,
  PaymentsResponse,
  PaymentResponse,
  BudgetCategory,
  CreateBudgetCategoryData,
  UpdateBudgetCategoryData,
  BudgetCategoriesResponse,
  BudgetCategoryResponse,
  Budget,
  CreateBudgetData,
  UpdateBudgetData,
  BudgetsResponse,
  BudgetResponse,
  BudgetTransaction,
  BudgetTransactionsResponse,
  BudgetSnapshot,
  BudgetSnapshotsResponse,
  BudgetSummary,
  BudgetSummaryResponse,
  CreateAllocationData,
  UpdateAllocationData,
  AllocationSummary,
  AllocationSummaryResponse,
  BudgetAllocationsResponse,
  AllocationResponse,
  FinancialAccount,
  CreateFinancialAccountData,
  UpdateFinancialAccountData,
  FinancialAccountsResponse,
  FinancialAccountResponse,
  Category,
  CreateCategoryData,
  UpdateCategoryData,
  CategoriesResponse,
  CategoryResponse,
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionsResponse,
  TransactionResponse,
  FinancialReport,
  RevenueReport,
  ExpenseReport,
  ProfitLossReport,
  CashFlowReport,
  ReportsResponse,
  TaxRecord,
  TaxCalculation,
} from "../types";

export class FinanceService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // ================================
  // FINANCE OVERVIEW
  // ================================

  /**
   * Get finance overview
   * GET /finance/overview
   * Response: FinanceOverview
   */
  async getFinanceOverview(config?: ApiConfigOverride): Promise<FinanceOverview> {
    try {
      const response = await this.apiClient.get<FinanceOverview>(FINANCE_ENDPOINTS.OVERVIEW, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // INVOICE MANAGEMENT
  // ================================

  /**
   * Get all invoices
   * 
   * @param params - Query parameters for filtering invoices
   * @param config - API configuration override
   * @returns Promise resolving to array of invoices
   * 
   * @example
   * ```typescript
   * // Get all invoices
   * const invoices = await financeService.getInvoices();
   * 
   * // Get invoices with filtering
   * const draftInvoices = await financeService.getInvoices({
   *   status: 'draft',
   *   client_name: 'Acme Corp'
   * });
   * ```
   * 
   * HTTP: GET /finance/invoices
   */
  async getInvoices(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    client_name?: string;
    date_from?: string;
    date_to?: string;
  }, config?: ApiConfigOverride): Promise<Invoice[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.client_name) queryParams.append('client_name', params.client_name);
      if (params?.date_from) queryParams.append('date_from', params.date_from);
      if (params?.date_to) queryParams.append('date_to', params.date_to);

      const queryString = queryParams.toString();
      const url = queryString ? `${FINANCE_ENDPOINTS.INVOICES_LIST}?${queryString}` : FINANCE_ENDPOINTS.INVOICES_LIST;
      
      const response = await this.apiClient.get<Invoice[]>(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new invoice
   * POST /finance/invoices
   * Body: {
   *   "client_name": "Acme Corp",
   *   "client_email": "billing@acme.com",
   *   "client_address": "123 Business St, City, State",
   *   "amount": 5000,
   *   "tax_amount": 500,
   *   "currency": "USD",
   *   "due_date": "2024-04-15",
   *   "description": "Web development services",
   *   "line_items": [
   *     {
   *       "description": "Frontend Development",
   *       "quantity": 1,
   *       "unit_price": 3000,
   *       "total": 3000
   *     }
   *   ]
   * }
   * Response: Invoice
   */
  async createInvoice(data: CreateInvoiceData, config?: ApiConfigOverride): Promise<Invoice> {
    try {
      const response = await this.apiClient.post<Invoice>(FINANCE_ENDPOINTS.INVOICES_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single invoice by ID
   * GET /finance/invoices/:id
   * Response: { invoice: Invoice }
   */
  async getInvoiceById(invoiceId: string, config?: ApiConfigOverride): Promise<Invoice> {
    try {
      const response = await this.apiClient.get<InvoiceResponse>(FINANCE_ENDPOINTS.INVOICE_DETAIL(invoiceId), config);
      return response.data.invoice;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update invoice
   * PATCH /finance/invoices/:id
   * Body: {
   *   "client_name"?: "Updated Corp",
   *   "amount"?: 6000,
   *   "status"?: "sent",
   *   "due_date"?: "2024-04-20"
   * }
   * Response: Invoice
   */
  async updateInvoice(invoiceId: string, data: UpdateInvoiceData, config?: ApiConfigOverride): Promise<Invoice> {
    try {
      const response = await this.apiClient.patch<Invoice>(FINANCE_ENDPOINTS.INVOICE_DETAIL(invoiceId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete invoice
   * DELETE /finance/invoices/:id
   * Response: void
   */
  async deleteInvoice(invoiceId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(FINANCE_ENDPOINTS.INVOICE_DETAIL(invoiceId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update invoice status
   * PATCH /finance/invoices/:id/status
   * Body: {
   *   "status": "paid"
   * }
   * Response: Invoice
   */
  async updateInvoiceStatus(invoiceId: string, data: UpdateInvoiceStatusData, config?: ApiConfigOverride): Promise<Invoice> {
    try {
      const response = await this.apiClient.patch<Invoice>(FINANCE_ENDPOINTS.INVOICE_STATUS(invoiceId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Send invoice to client
   * POST /finance/invoices/:id/send
   * Body: {}
   * Response: Invoice
   */
  async sendInvoice(invoiceId: string, config?: ApiConfigOverride): Promise<Invoice> {
    try {
      const response = await this.apiClient.post<Invoice>(FINANCE_ENDPOINTS.INVOICE_SEND(invoiceId), {}, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Record payment for invoice
   * POST /finance/invoices/:id/payment
   * Body: {
   *   "amount": 5500,
   *   "payment_date": "2024-03-20",
   *   "payment_method": "bank_transfer",
   *   "reference": "TXN123456"
   * }
   * Response: Invoice
   */
  async recordInvoicePayment(invoiceId: string, data: RecordPaymentData, config?: ApiConfigOverride): Promise<Invoice> {
    try {
      const response = await this.apiClient.post<Invoice>(FINANCE_ENDPOINTS.INVOICE_PAYMENT(invoiceId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // EXPENSE MANAGEMENT
  // ================================

  /**
   * Get all expenses
   * GET /finance/expenses
   * Response: { expenses: Expense[] }
   */
  async getExpenses(params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    category?: string;
    submitted_by?: string;
    date_from?: string;
    date_to?: string;
  }, config?: ApiConfigOverride): Promise<Expense[]> {
    try {
      const response = await this.apiClient.get<ExpensesResponse>(FINANCE_ENDPOINTS.EXPENSES_LIST, { ...config, params });
      return response.data.expenses;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new expense
   * POST /finance/expenses
   * Body: {
   *   "title": "Office Supplies",
   *   "description": "Monthly office supply purchase",
   *   "amount": 250,
   *   "currency": "USD",
   *   "category": "Office Supplies",
   *   "expense_date": "2024-03-15",
   *   "receipt_url": "https://example.com/receipt.pdf",
   *   "merchant": "Office Depot",
   *   "payment_method": "credit_card",
   *   "reimbursable": true
   * }
   * Response: Expense
   */
  async createExpense(data: CreateExpenseData, config?: ApiConfigOverride): Promise<Expense> {
    try {
      const response = await this.apiClient.post<Expense>(FINANCE_ENDPOINTS.EXPENSES_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single expense by ID
   * GET /finance/expenses/:id
   * Response: { expense: Expense }
   */
  async getExpenseById(expenseId: string, config?: ApiConfigOverride): Promise<Expense> {
    try {
      const response = await this.apiClient.get<ExpenseResponse>(FINANCE_ENDPOINTS.EXPENSE_DETAIL(expenseId), config);
      return response.data.expense;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update expense
   * PATCH /finance/expenses/:id
   * Body: {
   *   "title"?: "Updated Office Supplies",
   *   "amount"?: 300,
   *   "status"?: "submitted"
   * }
   * Response: Expense
   */
  async updateExpense(expenseId: string, data: UpdateExpenseData, config?: ApiConfigOverride): Promise<Expense> {
    try {
      const response = await this.apiClient.patch<Expense>(FINANCE_ENDPOINTS.EXPENSE_DETAIL(expenseId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete expense
   * DELETE /finance/expenses/:id
   * Response: void
   */
  async deleteExpense(expenseId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(FINANCE_ENDPOINTS.EXPENSE_DETAIL(expenseId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update expense status
   * PATCH /finance/expenses/:id/status
   * Body: {
   *   "status": "approved",
   *   "notes": "Approved for reimbursement"
   * }
   * Response: Expense
   */
  async updateExpenseStatus(expenseId: string, data: UpdateExpenseStatusData, config?: ApiConfigOverride): Promise<Expense> {
    try {
      const response = await this.apiClient.patch<Expense>(FINANCE_ENDPOINTS.EXPENSE_STATUS(expenseId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Approve expense
   * POST /finance/expenses/:id/approve
   * Body: {}
   * Response: Expense
   */
  async approveExpense(expenseId: string, config?: ApiConfigOverride): Promise<Expense> {
    try {
      const response = await this.apiClient.post<Expense>(FINANCE_ENDPOINTS.EXPENSE_APPROVE(expenseId), {}, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Reject expense
   * POST /finance/expenses/:id/reject
   * Body: {}
   * Response: Expense
   */
  async rejectExpense(expenseId: string, config?: ApiConfigOverride): Promise<Expense> {
    try {
      const response = await this.apiClient.post<Expense>(FINANCE_ENDPOINTS.EXPENSE_REJECT(expenseId), {}, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // PAYMENT MANAGEMENT
  // ================================

  /**
   * Get all payments
   * GET /finance/payments
   * Response: { payments: Payment[] }
   */
  async getPayments(params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
  }, config?: ApiConfigOverride): Promise<Payment[]> {
    try {
      const response = await this.apiClient.get<PaymentsResponse>(FINANCE_ENDPOINTS.PAYMENTS_LIST, { ...config, params });
      return response.data.payments;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new payment
   * POST /finance/payments
   * Body: {
   *   "type": "income",
   *   "amount": 5000,
   *   "currency": "USD",
   *   "description": "Client payment for invoice #123",
   *   "payment_method": "bank_transfer",
   *   "reference": "TXN789",
   *   "payment_date": "2024-03-20",
   *   "invoice_id": "invoice-id"
   * }
   * Response: Payment
   */
  async createPayment(data: CreatePaymentData, config?: ApiConfigOverride): Promise<Payment> {
    try {
      const response = await this.apiClient.post<Payment>(FINANCE_ENDPOINTS.PAYMENTS_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single payment by ID
   * GET /finance/payments/:id
   * Response: { payment: Payment }
   */
  async getPaymentById(paymentId: string, config?: ApiConfigOverride): Promise<Payment> {
    try {
      const response = await this.apiClient.get<PaymentResponse>(FINANCE_ENDPOINTS.PAYMENT_DETAIL(paymentId), config);
      return response.data.payment;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update payment
   * PATCH /finance/payments/:id
   * Body: {
   *   "status"?: "completed",
   *   "reference"?: "updated-reference"
   * }
   * Response: Payment
   */
  async updatePayment(paymentId: string, data: UpdatePaymentData, config?: ApiConfigOverride): Promise<Payment> {
    try {
      const response = await this.apiClient.patch<Payment>(FINANCE_ENDPOINTS.PAYMENT_DETAIL(paymentId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete payment
   * DELETE /finance/payments/:id
   * Response: void
   */
  async deletePayment(paymentId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(FINANCE_ENDPOINTS.PAYMENT_DETAIL(paymentId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // BUDGET CATEGORY MANAGEMENT
  // ================================

  /**
   * Get all budget categories
   * GET /finance/budget-categories
   * Response: BudgetCategory[]
   */
  async getBudgetCategories(params?: { 
    page?: number; 
    limit?: number; 
  }, config?: ApiConfigOverride): Promise<BudgetCategory[]> {
    try {
      const response = await this.apiClient.get<BudgetCategory[]>(FINANCE_ENDPOINTS.BUDGET_CATEGORIES_LIST, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new budget category
   * POST /finance/budget-categories
   * Body: {
   *   "name": "Digital Marketing",
   *   "description": "Online advertising and marketing expenses"
   * }
   * Response: BudgetCategory
   */
  async createBudgetCategory(data: CreateBudgetCategoryData, config?: ApiConfigOverride): Promise<BudgetCategory> {
    try {
      const response = await this.apiClient.post<BudgetCategory>(FINANCE_ENDPOINTS.BUDGET_CATEGORIES_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single budget category by ID
   * GET /finance/budget-categories/:id
   * Response: BudgetCategory
   */
  async getBudgetCategoryById(categoryId: string, config?: ApiConfigOverride): Promise<BudgetCategory> {
    try {
      const response = await this.apiClient.get<BudgetCategory>(FINANCE_ENDPOINTS.BUDGET_CATEGORY_DETAIL(categoryId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update budget category
   * PUT /finance/budget-categories/:id
   * Body: {
   *   "name"?: "Updated Digital Marketing",
   *   "description"?: "Updated description"
   * }
   * Response: BudgetCategory
   */
  async updateBudgetCategory(categoryId: string, data: UpdateBudgetCategoryData, config?: ApiConfigOverride): Promise<BudgetCategory> {
    try {
      const response = await this.apiClient.put<BudgetCategory>(FINANCE_ENDPOINTS.BUDGET_CATEGORY_DETAIL(categoryId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete budget category
   * DELETE /finance/budget-categories/:id
   * Response: void
   */
  async deleteBudgetCategory(categoryId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(FINANCE_ENDPOINTS.BUDGET_CATEGORY_DETAIL(categoryId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // BUDGET MANAGEMENT
  // ================================

  /**
   * Get all budgets
   * GET /finance/budgets
   * Response: Budget[]
   */
  async getBudgets(params?: { 
    page?: number; 
    limit?: number; 
    status?: "active" | "inactive" | "completed" | "cancelled";
    scope_type?: "department" | "project" | "company" | "user";
    owner_id?: string;
  }, config?: ApiConfigOverride): Promise<Budget[]> {
    try {
      const response = await this.apiClient.get<Budget[]>(FINANCE_ENDPOINTS.BUDGETS_LIST, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new budget
   * POST /finance/budgets
   * Body: {
   *   "name": "Q2 2024 Marketing Budget",
   *   "scope_type": "department",
   *   "scope_ref": "department-id",
   *   "period_start": "2024-04-01",
   *   "period_end": "2024-06-30",
   *   "owner_id": "user-id",
   *   "total_amount": 50000,
   *   "status": "active"
   * }
   * Response: Budget
   */
  async createBudget(data: CreateBudgetData, config?: ApiConfigOverride): Promise<Budget> {
    try {
      const response = await this.apiClient.post<Budget>(FINANCE_ENDPOINTS.BUDGETS_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single budget by ID
   * GET /finance/budgets/:id
   * Response: Budget
   */
  async getBudgetById(budgetId: string, config?: ApiConfigOverride): Promise<Budget> {
    try {
      const response = await this.apiClient.get<Budget>(FINANCE_ENDPOINTS.BUDGET_DETAIL(budgetId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update budget
   * PUT /finance/budgets/:id
   * Body: {
   *   "name"?: "Updated Marketing Budget",
   *   "total_amount"?: 60000,
   *   "status"?: "active"
   * }
   * Response: Budget
   */
  async updateBudget(budgetId: string, data: UpdateBudgetData, config?: ApiConfigOverride): Promise<Budget> {
    try {
      const response = await this.apiClient.put<Budget>(FINANCE_ENDPOINTS.BUDGET_DETAIL(budgetId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete budget
   * DELETE /finance/budgets/:id
   * Response: void
   */
  async deleteBudget(budgetId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(FINANCE_ENDPOINTS.BUDGET_DETAIL(budgetId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Close budget
   * POST /finance/budgets/:id/close
   * Body: {}
   * Response: Budget
   */
  async closeBudget(budgetId: string, config?: ApiConfigOverride): Promise<Budget> {
    try {
      const response = await this.apiClient.post<Budget>(FINANCE_ENDPOINTS.BUDGET_CLOSE(budgetId), {}, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Archive budget
   * POST /finance/budgets/:id/archive
   * Body: {}
   * Response: Budget
   */
  async archiveBudget(budgetId: string, config?: ApiConfigOverride): Promise<Budget> {
    try {
      const response = await this.apiClient.post<Budget>(FINANCE_ENDPOINTS.BUDGET_ARCHIVE(budgetId), {}, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get budget summary
   * GET /finance/budgets/:id/summary
   * Response: { summary: BudgetSummary }
   */
  async getBudgetSummary(budgetId: string, config?: ApiConfigOverride): Promise<BudgetSummary> {
    try {
      const response = await this.apiClient.get<BudgetSummaryResponse>(FINANCE_ENDPOINTS.BUDGET_SUMMARY(budgetId), config);
      return response.data.summary;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get budget transactions
   * GET /finance/budgets/:id/transactions
   * Response: { transactions: BudgetTransaction[] }
   */
  async getBudgetTransactions(budgetId: string, params?: { 
    page?: number; 
    limit?: number; 
    type?: string;
    category_id?: string;
    date_from?: string;
    date_to?: string;
  }, config?: ApiConfigOverride): Promise<BudgetTransaction[]> {
    try {
      const response = await this.apiClient.get<BudgetTransactionsResponse>(FINANCE_ENDPOINTS.BUDGET_TRANSACTIONS(budgetId), { ...config, params });
      return response.data.transactions;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get budget snapshots
   * GET /finance/budgets/:id/snapshots
   * Query: ?start_date=2024-04-01&end_date=2024-06-30
   * Response: { snapshots: BudgetSnapshot[] }
   */
  async getBudgetSnapshots(budgetId: string, params?: { 
    start_date?: string; 
    end_date?: string;
    page?: number;
    limit?: number;
  }, config?: ApiConfigOverride): Promise<BudgetSnapshot[]> {
    try {
      const response = await this.apiClient.get<BudgetSnapshotsResponse>(FINANCE_ENDPOINTS.BUDGET_SNAPSHOTS(budgetId), { ...config, params });
      return response.data.snapshots;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // BUDGET ALLOCATION MANAGEMENT
  // ================================

  /**
   * Get budget allocations
   * GET /finance/budgets/:id/allocations
   * Response: BudgetAllocation[]
   */
  async getBudgetAllocations(budgetId: string, params?: { 
    page?: number; 
    limit?: number; 
    category_id?: string;
  }, config?: ApiConfigOverride): Promise<BudgetAllocation[]> {
    try {
      const response = await this.apiClient.get<BudgetAllocation[]>(FINANCE_ENDPOINTS.BUDGET_ALLOCATIONS(budgetId), { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create budget allocation
   * POST /finance/budgets/:id/allocations
   * Body: {
   *   "category_id": "6ce4f444-2ed7-4851-877b-eb624e0c2aba",
   *   "amount_allocated": 15000.00
   * }
   * Response: BudgetAllocation
   */
  async createBudgetAllocation(budgetId: string, data: CreateAllocationData, config?: ApiConfigOverride): Promise<BudgetAllocation> {
    try {
      const response = await this.apiClient.post<BudgetAllocation>(FINANCE_ENDPOINTS.BUDGET_ALLOCATIONS(budgetId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single allocation by ID
   * GET /finance/budgets/allocations/:id
   * Response: BudgetAllocation
   */
  async getAllocationById(allocationId: string, config?: ApiConfigOverride): Promise<BudgetAllocation> {
    try {
      const response = await this.apiClient.get<BudgetAllocation>(FINANCE_ENDPOINTS.BUDGET_ALLOCATION_DETAIL(allocationId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update allocation
   * PUT /finance/budgets/allocations/:id
   * Body: {
   *   "category_id"?: "updated-category-id",
   *   "amount_allocated"?: 20000.00
   * }
   * Response: BudgetAllocation
   */
  async updateAllocation(allocationId: string, data: UpdateAllocationData, config?: ApiConfigOverride): Promise<BudgetAllocation> {
    try {
      const response = await this.apiClient.put<BudgetAllocation>(FINANCE_ENDPOINTS.BUDGET_ALLOCATION_DETAIL(allocationId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete allocation
   * DELETE /finance/budgets/allocations/:id
   * Response: void
   */
  async deleteAllocation(allocationId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(FINANCE_ENDPOINTS.BUDGET_ALLOCATION_DETAIL(allocationId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get allocation summary
   * GET /finance/allocations/:id/summary
   * Response: { summary: AllocationSummary }
   */
  async getAllocationSummary(allocationId: string, config?: ApiConfigOverride): Promise<AllocationSummary> {
    try {
      const response = await this.apiClient.get<AllocationSummaryResponse>(FINANCE_ENDPOINTS.ALLOCATION_SUMMARY(allocationId), config);
      return response.data.summary;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // ACCOUNT MANAGEMENT
  // ================================

  /**
   * Get all accounts
   * GET /finance/accounts
   * Response: Account[]
   */
  async getAccounts(params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    is_primary?: boolean;
    currency?: string;
  }, config?: ApiConfigOverride): Promise<FinancialAccount[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.is_primary !== undefined) queryParams.append('is_primary', params.is_primary.toString());
      if (params?.currency) queryParams.append('currency', params.currency);

      const queryString = queryParams.toString();
      const url = queryString ? `${FINANCE_ENDPOINTS.ACCOUNTS_LIST}?${queryString}` : FINANCE_ENDPOINTS.ACCOUNTS_LIST;
      
      const response = await this.apiClient.get<FinancialAccountsResponse>(url, config);
      return response.data.accounts;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new account
   * POST /finance/accounts
   * Body: {
   *   "name": "Main Bank Account",
   *   "type": "bank",
   *   "currency": "USD",
   *   "is_primary": true,
   *   "balance": 10000.00,
   *   "description": "Primary business checking account"
   * }
   * Response: Account
   */
  async createAccount(data: CreateFinancialAccountData, config?: ApiConfigOverride): Promise<FinancialAccount> {
    try {
      const response = await this.apiClient.post<FinancialAccountResponse>(FINANCE_ENDPOINTS.ACCOUNTS_LIST, data, config);
      return response.data.account;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single account by ID
   * GET /finance/accounts/:id
   * Response: Account
   */
  async getAccountById(accountId: string, config?: ApiConfigOverride): Promise<FinancialAccount> {
    try {
      const response = await this.apiClient.get<FinancialAccountResponse>(FINANCE_ENDPOINTS.ACCOUNT_DETAIL(accountId), config);
      return response.data.account;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update account
   * PUT /finance/accounts/:id
   * Body: {
   *   "name"?: "Updated Bank Account",
   *   "balance"?: 15000,
   *   "is_primary"?: false
   * }
   * Response: Account
   */
  async updateAccount(accountId: string, data: UpdateFinancialAccountData, config?: ApiConfigOverride): Promise<FinancialAccount> {
    try {
      const response = await this.apiClient.patch<FinancialAccountResponse>(FINANCE_ENDPOINTS.ACCOUNT_DETAIL(accountId), data, config);
      return response.data.account;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete account
   * DELETE /finance/accounts/:id
   * Response: void
   */
  async deleteAccount(accountId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(FINANCE_ENDPOINTS.ACCOUNT_DETAIL(accountId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // CATEGORY MANAGEMENT
  // ================================

  /**
   * Get all categories
   * GET /finance/categories
   * Response: Category[]
   */
  async getCategories(params?: { 
    page?: number; 
    limit?: number; 
    type?: "income" | "expense";
  }, config?: ApiConfigOverride): Promise<Category[]> {
    try {
      const response = await this.apiClient.get<Category[]>(FINANCE_ENDPOINTS.CATEGORIES_LIST, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new category
   * POST /finance/categories
   * Body: {
   *   "name": "Office Supplies",
   *   "type": "expense",
   *   "description": "Office supplies and stationery",
   *   "color": "#FF5733"
   * }
   * Response: Category
   */
  async createCategory(data: CreateCategoryData, config?: ApiConfigOverride): Promise<Category> {
    try {
      const response = await this.apiClient.post<Category>(FINANCE_ENDPOINTS.CATEGORIES_LIST, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get single category by ID
   * GET /finance/categories/:id
   * Response: Category
   */
  async getCategoryById(categoryId: string, config?: ApiConfigOverride): Promise<Category> {
    try {
      const response = await this.apiClient.get<Category>(FINANCE_ENDPOINTS.CATEGORY_DETAIL(categoryId), config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update category
   * PUT /finance/categories/:id
   * Body: {
   *   "name"?: "Updated Office Supplies",
   *   "description"?: "Updated description",
   *   "color"?: "#00FF00"
   * }
   * Response: Category
   */
  async updateCategory(categoryId: string, data: UpdateCategoryData, config?: ApiConfigOverride): Promise<Category> {
    try {
      const response = await this.apiClient.put<Category>(FINANCE_ENDPOINTS.CATEGORY_DETAIL(categoryId), data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete category
   * DELETE /finance/categories/:id
   * Response: void
   */
  async deleteCategory(categoryId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(FINANCE_ENDPOINTS.CATEGORY_DETAIL(categoryId), config);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // REPORTS
  // ================================

  /**
   * Get financial reports
   * GET /finance/reports
   * Response: { reports: FinancialReport[] }
   */
  async getReports(params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    period_start?: string;
    period_end?: string;
  }, config?: ApiConfigOverride): Promise<FinancialReport[]> {
    try {
      const response = await this.apiClient.get<ReportsResponse>(FINANCE_ENDPOINTS.REPORTS, { ...config, params });
      return response.data.reports;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get revenue report
   * GET /finance/reports/revenue
   * Response: RevenueReport
   */
  async getRevenueReport(params?: { 
    period_start?: string; 
    period_end?: string; 
  }, config?: ApiConfigOverride): Promise<RevenueReport> {
    try {
      const response = await this.apiClient.get<RevenueReport>(FINANCE_ENDPOINTS.REPORTS_REVENUE, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get expense report
   * GET /finance/reports/expenses
   * Response: ExpenseReport
   */
  async getExpenseReport(params?: { 
    period_start?: string; 
    period_end?: string; 
  }, config?: ApiConfigOverride): Promise<ExpenseReport> {
    try {
      const response = await this.apiClient.get<ExpenseReport>(FINANCE_ENDPOINTS.REPORTS_EXPENSES, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get profit & loss report
   * GET /finance/reports/profit-loss
   * Response: ProfitLossReport
   */
  async getProfitLossReport(params?: { 
    period_start?: string; 
    period_end?: string; 
  }, config?: ApiConfigOverride): Promise<ProfitLossReport> {
    try {
      const response = await this.apiClient.get<ProfitLossReport>(FINANCE_ENDPOINTS.REPORTS_PROFIT_LOSS, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get cash flow report
   * GET /finance/reports/cash-flow
   * Response: CashFlowReport
   */
  async getCashFlowReport(params?: { 
    period_start?: string; 
    period_end?: string; 
  }, config?: ApiConfigOverride): Promise<CashFlowReport> {
    try {
      const response = await this.apiClient.get<CashFlowReport>(FINANCE_ENDPOINTS.REPORTS_CASH_FLOW, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // TAX MANAGEMENT
  // ================================

  /**
   * Get tax records
   * GET /finance/tax-records
   * Response: TaxRecord[]
   */
  async getTaxRecords(params?: { 
    page?: number; 
    limit?: number; 
    type?: string; 
    period_start?: string;
    period_end?: string;
  }, config?: ApiConfigOverride): Promise<TaxRecord[]> {
    try {
      const response = await this.apiClient.get<TaxRecord[]>(FINANCE_ENDPOINTS.TAX_RECORDS, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get tax calculations
   * GET /finance/tax-calculations
   * Response: TaxCalculation
   */
  async getTaxCalculations(params?: { 
    period_start?: string; 
    period_end?: string; 
  }, config?: ApiConfigOverride): Promise<TaxCalculation> {
    try {
      const response = await this.apiClient.get<TaxCalculation>(FINANCE_ENDPOINTS.TAX_CALCULATIONS, { ...config, params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  // Invoice utility methods
  async getInvoicesByStatus(status: Invoice['status'], config?: ApiConfigOverride): Promise<Invoice[]> {
    return this.getInvoices({ status }, config);
  }

  async getInvoicesByClient(clientName: string, config?: ApiConfigOverride): Promise<Invoice[]> {
    return this.getInvoices({ client_name: clientName }, config);
  }

  async getOverdueInvoices(config?: ApiConfigOverride): Promise<Invoice[]> {
    const invoices = await this.getInvoices({}, config);
    const now = new Date();
    return invoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date);
      return dueDate < now && invoice.status !== 'paid';
    });
  }

  async getDraftInvoices(config?: ApiConfigOverride): Promise<Invoice[]> {
    return this.getInvoicesByStatus('draft', config);
  }

  async getPaidInvoices(config?: ApiConfigOverride): Promise<Invoice[]> {
    return this.getInvoicesByStatus('paid', config);
  }

  async markInvoiceAsPaid(invoiceId: string, config?: ApiConfigOverride): Promise<Invoice> {
    return this.updateInvoiceStatus(invoiceId, { status: 'paid' }, config);
  }

  async markInvoiceAsOverdue(invoiceId: string, config?: ApiConfigOverride): Promise<Invoice> {
    return this.updateInvoiceStatus(invoiceId, { status: 'overdue' }, config);
  }

  // Expense utility methods
  async getExpensesByStatus(status: Expense['status'], config?: ApiConfigOverride): Promise<Expense[]> {
    return this.getExpenses({ status }, config);
  }

  async getExpensesByCategory(category: string, config?: ApiConfigOverride): Promise<Expense[]> {
    return this.getExpenses({ category }, config);
  }

  async getExpensesByUser(userId: string, config?: ApiConfigOverride): Promise<Expense[]> {
    return this.getExpenses({ submitted_by: userId }, config);
  }

  async getPendingExpenses(config?: ApiConfigOverride): Promise<Expense[]> {
    return this.getExpensesByStatus('submitted', config);
  }

  async getApprovedExpenses(config?: ApiConfigOverride): Promise<Expense[]> {
    return this.getExpensesByStatus('approved', config);
  }

  async getRejectedExpenses(config?: ApiConfigOverride): Promise<Expense[]> {
    return this.getExpensesByStatus('rejected', config);
  }

  async getReimbursableExpenses(config?: ApiConfigOverride): Promise<Expense[]> {
    const expenses = await this.getExpenses({}, config);
    return expenses.filter(expense => expense.reimbursable);
  }

  async submitExpense(expenseId: string, config?: ApiConfigOverride): Promise<Expense> {
    return this.updateExpenseStatus(expenseId, { status: 'submitted' }, config);
  }

  // Payment utility methods
  async getPaymentsByType(type: Payment['type'], config?: ApiConfigOverride): Promise<Payment[]> {
    return this.getPayments({ type }, config);
  }

  async getIncomePayments(config?: ApiConfigOverride): Promise<Payment[]> {
    return this.getPaymentsByType('income', config);
  }

  async getExpensePayments(config?: ApiConfigOverride): Promise<Payment[]> {
    return this.getPaymentsByType('expense', config);
  }

  async getPendingPayments(config?: ApiConfigOverride): Promise<Payment[]> {
    return this.getPayments({ status: 'pending' }, config);
  }

  async getCompletedPayments(config?: ApiConfigOverride): Promise<Payment[]> {
    return this.getPayments({ status: 'completed' }, config);
  }

  async markPaymentAsCompleted(paymentId: string, config?: ApiConfigOverride): Promise<Payment> {
    return this.updatePayment(paymentId, { status: 'completed' }, config);
  }

  // Budget Category utility methods
  async getBudgetCategoryByName(name: string, config?: ApiConfigOverride): Promise<BudgetCategory | null> {
    const categories = await this.getBudgetCategories({}, config);
    return categories.find(category => category.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async createBudgetCategoryIfNotExists(name: string, description?: string, config?: ApiConfigOverride): Promise<BudgetCategory> {
    const existing = await this.getBudgetCategoryByName(name, config);
    if (existing) {
      return existing;
    }
    return this.createBudgetCategory({ name, description }, config);
  }

  // Budget utility methods
  async getBudgetsByStatus(status: Budget['status'], config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgets({ status }, config);
  }

  async getActiveBudgets(config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgetsByStatus('active', config);
  }

  async getInactiveBudgets(config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgetsByStatus('inactive', config);
  }

  async getCompletedBudgets(config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgetsByStatus('completed', config);
  }

  async getBudgetsByScopeType(scopeType: Budget['scope_type'], config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgets({ scope_type: scopeType }, config);
  }

  async getDepartmentBudgets(config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgetsByScopeType('department', config);
  }

  async getProjectBudgets(config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgetsByScopeType('project', config);
  }

  async getCompanyBudgets(config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgetsByScopeType('company', config);
  }

  async getUserBudgets(config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgetsByScopeType('user', config);
  }

  async getBudgetsByOwner(ownerId: string, config?: ApiConfigOverride): Promise<Budget[]> {
    return this.getBudgets({ owner_id: ownerId }, config);
  }

  // Budget convenience methods
  async createDepartmentBudget(name: string, departmentId: string, ownerId: string, periodStart: string, periodEnd: string, totalAmount: number = 0, config?: ApiConfigOverride): Promise<Budget> {
    const budgetData: CreateBudgetData = {
      name,
      scope_type: 'department',
      scope_ref: departmentId,
      period_start: periodStart,
      period_end: periodEnd,
      owner_id: ownerId,
      total_amount: totalAmount,
      status: 'active'
    };
    return this.createBudget(budgetData, config);
  }

  async createProjectBudget(name: string, projectId: string, ownerId: string, periodStart: string, periodEnd: string, totalAmount: number = 0, config?: ApiConfigOverride): Promise<Budget> {
    const budgetData: CreateBudgetData = {
      name,
      scope_type: 'project',
      scope_ref: projectId,
      period_start: periodStart,
      period_end: periodEnd,
      owner_id: ownerId,
      total_amount: totalAmount,
      status: 'active'
    };
    return this.createBudget(budgetData, config);
  }

  async createCompanyBudget(name: string, ownerId: string, periodStart: string, periodEnd: string, totalAmount: number = 0, config?: ApiConfigOverride): Promise<Budget> {
    const budgetData: CreateBudgetData = {
      name,
      scope_type: 'company',
      period_start: periodStart,
      period_end: periodEnd,
      owner_id: ownerId,
      total_amount: totalAmount,
      status: 'active'
    };
    return this.createBudget(budgetData, config);
  }

  async updateBudgetStatus(budgetId: string, status: Budget['status'], config?: ApiConfigOverride): Promise<Budget> {
    return this.updateBudget(budgetId, { status }, config);
  }

  async activateBudget(budgetId: string, config?: ApiConfigOverride): Promise<Budget> {
    return this.updateBudgetStatus(budgetId, 'active', config);
  }

  async deactivateBudget(budgetId: string, config?: ApiConfigOverride): Promise<Budget> {
    return this.updateBudgetStatus(budgetId, 'inactive', config);
  }

  async completeBudget(budgetId: string, config?: ApiConfigOverride): Promise<Budget> {
    return this.updateBudgetStatus(budgetId, 'completed', config);
  }

  // Budget lifecycle convenience methods
  async closeAndArchiveBudget(budgetId: string, config?: ApiConfigOverride): Promise<Budget> {
    await this.closeBudget(budgetId, config);
    return this.archiveBudget(budgetId, config);
  }

  // Budget transaction utility methods
  async getBudgetTransactionsByType(budgetId: string, type: BudgetTransaction['type'], config?: ApiConfigOverride): Promise<BudgetTransaction[]> {
    return this.getBudgetTransactions(budgetId, { type }, config);
  }

  async getBudgetExpenseTransactions(budgetId: string, config?: ApiConfigOverride): Promise<BudgetTransaction[]> {
    return this.getBudgetTransactionsByType(budgetId, 'expense', config);
  }

  async getBudgetAllocationTransactions(budgetId: string, config?: ApiConfigOverride): Promise<BudgetTransaction[]> {
    return this.getBudgetTransactionsByType(budgetId, 'allocation', config);
  }

  async getBudgetTransactionsByCategory(budgetId: string, categoryId: string, config?: ApiConfigOverride): Promise<BudgetTransaction[]> {
    return this.getBudgetTransactions(budgetId, { category_id: categoryId }, config);
  }

  async getBudgetTransactionsForPeriod(budgetId: string, startDate: string, endDate: string, config?: ApiConfigOverride): Promise<BudgetTransaction[]> {
    return this.getBudgetTransactions(budgetId, { 
      date_from: startDate, 
      date_to: endDate 
    }, config);
  }

  // Budget snapshot utility methods
  async getBudgetSnapshotsForPeriod(budgetId: string, startDate: string, endDate: string, config?: ApiConfigOverride): Promise<BudgetSnapshot[]> {
    return this.getBudgetSnapshots(budgetId, { 
      start_date: startDate, 
      end_date: endDate 
    }, config);
  }

  async getLatestBudgetSnapshot(budgetId: string, config?: ApiConfigOverride): Promise<BudgetSnapshot | null> {
    const snapshots = await this.getBudgetSnapshots(budgetId, { limit: 1 }, config);
    return snapshots.length > 0 ? snapshots[0] : null;
  }

  async getBudgetCurrentMonthSnapshots(budgetId: string, config?: ApiConfigOverride): Promise<BudgetSnapshot[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getBudgetSnapshotsForPeriod(
      budgetId,
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0],
      config
    );
  }

  // Budget summary convenience methods
  async getBudgetUtilizationFromSummary(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const summary = await this.getBudgetSummary(budgetId, config);
    return summary.utilization_percentage;
  }

  async getBudgetRemainingFromSummary(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const summary = await this.getBudgetSummary(budgetId, config);
    return summary.total_remaining;
  }

  async getBudgetDaysRemaining(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const summary = await this.getBudgetSummary(budgetId, config);
    return summary.days_remaining;
  }

  async getBudgetSpendingTrend(budgetId: string, config?: ApiConfigOverride): Promise<BudgetSummary['spending_trend']> {
    const summary = await this.getBudgetSummary(budgetId, config);
    return summary.spending_trend;
  }

  async getBudgetCategorySummary(budgetId: string, config?: ApiConfigOverride): Promise<BudgetSummary['category_summary']> {
    const summary = await this.getBudgetSummary(budgetId, config);
    return summary.category_summary;
  }

  // Budget analytics from transactions
  async getTotalBudgetTransactionAmount(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const transactions = await this.getBudgetTransactions(budgetId, {}, config);
    return transactions.reduce((total, transaction) => {
      // Add positive amounts for expenses, subtract for refunds/adjustments
      return transaction.type === 'expense' ? total + transaction.amount : total;
    }, 0);
  }

  async getBudgetTransactionCount(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const transactions = await this.getBudgetTransactions(budgetId, {}, config);
    return transactions.length;
  }

  // ================================
  // BUDGET ALLOCATION UTILITY METHODS
  // ================================

  // Allocation filtering methods
  async getAllocationsByCategory(budgetId: string, categoryId: string, config?: ApiConfigOverride): Promise<BudgetAllocation[]> {
    return this.getBudgetAllocations(budgetId, { category_id: categoryId }, config);
  }

  async getAllocationByCategory(budgetId: string, categoryId: string, config?: ApiConfigOverride): Promise<BudgetAllocation | null> {
    const allocations = await this.getAllocationsByCategory(budgetId, categoryId, config);
    return allocations.length > 0 ? allocations[0] : null;
  }

  // Allocation convenience methods
  async createOrUpdateAllocation(budgetId: string, categoryId: string, amount: number, config?: ApiConfigOverride): Promise<BudgetAllocation> {
    const existingAllocation = await this.getAllocationByCategory(budgetId, categoryId, config);
    
    if (existingAllocation) {
      return this.updateAllocation(existingAllocation.id, { amount_allocated: amount }, config);
    } else {
      return this.createBudgetAllocation(budgetId, { category_id: categoryId, amount_allocated: amount }, config);
    }
  }

  async increaseAllocation(allocationId: string, additionalAmount: number, config?: ApiConfigOverride): Promise<BudgetAllocation> {
    const allocation = await this.getAllocationById(allocationId, config);
    const newAmount = allocation.amount_allocated + additionalAmount;
    return this.updateAllocation(allocationId, { amount_allocated: newAmount }, config);
  }

  async decreaseAllocation(allocationId: string, reductionAmount: number, config?: ApiConfigOverride): Promise<BudgetAllocation> {
    const allocation = await this.getAllocationById(allocationId, config);
    const newAmount = Math.max(0, allocation.amount_allocated - reductionAmount);
    return this.updateAllocation(allocationId, { amount_allocated: newAmount }, config);
  }

  async transferAllocation(fromAllocationId: string, toAllocationId: string, amount: number, config?: ApiConfigOverride): Promise<{ from: BudgetAllocation; to: BudgetAllocation }> {
    const [fromAllocation, toAllocation] = await Promise.all([
      this.getAllocationById(fromAllocationId, config),
      this.getAllocationById(toAllocationId, config)
    ]);

    if (fromAllocation.amount_allocated < amount) {
      throw new Error('Insufficient allocation amount for transfer');
    }

    const [updatedFrom, updatedTo] = await Promise.all([
      this.updateAllocation(fromAllocationId, { 
        amount_allocated: fromAllocation.amount_allocated - amount 
      }, config),
      this.updateAllocation(toAllocationId, { 
        amount_allocated: toAllocation.amount_allocated + amount 
      }, config)
    ]);

    return { from: updatedFrom, to: updatedTo };
  }

  // Allocation analytics
  async getTotalBudgetAllocatedByBudget(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const allocations = await this.getBudgetAllocations(budgetId, {}, config);
    return allocations.reduce((total, allocation) => total + allocation.amount_allocated, 0);
  }

  async getAllocationCount(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const allocations = await this.getBudgetAllocations(budgetId, {}, config);
    return allocations.length;
  }

  async getLargestAllocation(budgetId: string, config?: ApiConfigOverride): Promise<BudgetAllocation | null> {
    const allocations = await this.getBudgetAllocations(budgetId, {}, config);
    if (allocations.length === 0) return null;
    
    return allocations.reduce((largest, current) => 
      current.amount_allocated > largest.amount_allocated ? current : largest
    );
  }

  async getSmallestAllocation(budgetId: string, config?: ApiConfigOverride): Promise<BudgetAllocation | null> {
    const allocations = await this.getBudgetAllocations(budgetId, {}, config);
    if (allocations.length === 0) return null;
    
    return allocations.reduce((smallest, current) => 
      current.amount_allocated < smallest.amount_allocated ? current : smallest
    );
  }

  async getAverageAllocationAmount(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const allocations = await this.getBudgetAllocations(budgetId, {}, config);
    if (allocations.length === 0) return 0;
    
    const total = allocations.reduce((sum, allocation) => sum + allocation.amount_allocated, 0);
    return total / allocations.length;
  }

  // Allocation summary convenience methods
  async getAllocationUtilization(allocationId: string, config?: ApiConfigOverride): Promise<number> {
    const summary = await this.getAllocationSummary(allocationId, config);
    return summary.utilization_percentage;
  }

  async getAllocationRemaining(allocationId: string, config?: ApiConfigOverride): Promise<number> {
    const summary = await this.getAllocationSummary(allocationId, config);
    return summary.amount_remaining;
  }

  async getAllocationSpent(allocationId: string, config?: ApiConfigOverride): Promise<number> {
    const summary = await this.getAllocationSummary(allocationId, config);
    return summary.amount_spent;
  }

  async getAllocationSpendingTrend(allocationId: string, config?: ApiConfigOverride): Promise<AllocationSummary['spending_trend']> {
    const summary = await this.getAllocationSummary(allocationId, config);
    return summary.spending_trend;
  }

  async getAllocationRecentTransactions(allocationId: string, config?: ApiConfigOverride): Promise<BudgetTransaction[]> {
    const summary = await this.getAllocationSummary(allocationId, config);
    return summary.recent_transactions;
  }

  // Bulk allocation operations
  async createMultipleAllocations(budgetId: string, allocations: CreateAllocationData[], config?: ApiConfigOverride): Promise<BudgetAllocation[]> {
    const promises = allocations.map(allocation => 
      this.createBudgetAllocation(budgetId, allocation, config)
    );
    return Promise.all(promises);
  }

  async deleteAllAllocations(budgetId: string, config?: ApiConfigOverride): Promise<void> {
    const allocations = await this.getBudgetAllocations(budgetId, {}, config);
    const deletePromises = allocations.map(allocation => 
      this.deleteAllocation(allocation.id, config)
    );
    await Promise.all(deletePromises);
  }

  async reallocateBudget(budgetId: string, newAllocations: CreateAllocationData[], config?: ApiConfigOverride): Promise<BudgetAllocation[]> {
    // Delete existing allocations
    await this.deleteAllAllocations(budgetId, config);
    
    // Create new allocations
    return this.createMultipleAllocations(budgetId, newAllocations, config);
  }

  // Financial analytics
  async getTotalRevenue(config?: ApiConfigOverride): Promise<number> {
    const overview = await this.getFinanceOverview(config);
    return overview.total_revenue;
  }

  async getTotalExpenses(config?: ApiConfigOverride): Promise<number> {
    const overview = await this.getFinanceOverview(config);
    return overview.total_expenses;
  }

  async getNetProfit(config?: ApiConfigOverride): Promise<number> {
    const overview = await this.getFinanceOverview(config);
    return overview.net_profit;
  }

  async getOutstandingInvoicesAmount(config?: ApiConfigOverride): Promise<number> {
    const invoices = await this.getInvoices({ status: 'sent' }, config);
    return invoices.reduce((total, invoice) => total + invoice.amount, 0);
  }

  async getTotalInvoiceAmount(config?: ApiConfigOverride): Promise<number> {
    const invoices = await this.getInvoices({}, config);
    return invoices.reduce((total, invoice) => total + invoice.amount, 0);
  }

  async getTotalExpenseAmountFromExpenses(config?: ApiConfigOverride): Promise<number> {
    const expenses = await this.getExpenses({}, config);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  async getBudgetUtilization(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const summary = await this.getBudgetSummary(budgetId, config);
    return summary.utilization_percentage;
  }

  async getBudgetRemaining(budgetId: string, config?: ApiConfigOverride): Promise<number> {
    const summary = await this.getBudgetSummary(budgetId, config);
    return summary.total_remaining;
  }

  async getTotalBudgetAllocated(config?: ApiConfigOverride): Promise<number> {
    const budgets = await this.getActiveBudgets(config);
    return budgets.reduce((total, budget) => total + budget.total_amount, 0);
  }

  async getTotalBudgetSpent(config?: ApiConfigOverride): Promise<number> {
    const budgets = await this.getActiveBudgets(config);
    let totalSpent = 0;
    for (const budget of budgets) {
      const summary = await this.getBudgetSummary(budget.id, config);
      totalSpent += summary.total_spent;
    }
    return totalSpent;
  }

  // Report convenience methods
  async getCurrentMonthRevenue(config?: ApiConfigOverride): Promise<RevenueReport> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getRevenueReport({
      period_start: startOfMonth.toISOString().split('T')[0],
      period_end: endOfMonth.toISOString().split('T')[0]
    }, config);
  }

  async getCurrentMonthExpenses(config?: ApiConfigOverride): Promise<ExpenseReport> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getExpenseReport({
      period_start: startOfMonth.toISOString().split('T')[0],
      period_end: endOfMonth.toISOString().split('T')[0]
    }, config);
  }

  async getYearToDateProfitLoss(config?: ApiConfigOverride): Promise<ProfitLossReport> {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    return this.getProfitLossReport({
      period_start: startOfYear.toISOString().split('T')[0],
      period_end: now.toISOString().split('T')[0]
    }, config);
  }

  // ================================
  // ACCOUNT UTILITY METHODS
  // ================================

  // Account filtering methods
  async getAccountsByType(type: FinancialAccount['type'], config?: ApiConfigOverride): Promise<FinancialAccount[]> {
    return this.getAccounts({ type }, config);
  }

  async getBankAccounts(config?: ApiConfigOverride): Promise<FinancialAccount[]> {
    return this.getAccountsByType('bank', config);
  }

  async getCreditCardAccounts(config?: ApiConfigOverride): Promise<FinancialAccount[]> {
    return this.getAccountsByType('credit_card', config);
  }

  async getCashAccounts(config?: ApiConfigOverride): Promise<FinancialAccount[]> {
    return this.getAccountsByType('cash', config);
  }

  async getPrimaryAccounts(config?: ApiConfigOverride): Promise<FinancialAccount[]> {
    return this.getAccounts({ is_primary: true }, config);
  }

  async getPrimaryAccount(config?: ApiConfigOverride): Promise<FinancialAccount | null> {
    const accounts = await this.getPrimaryAccounts(config);
    return accounts.length > 0 ? accounts[0] : null;
  }

  async getAccountsByCurrency(currency: string, config?: ApiConfigOverride): Promise<FinancialAccount[]> {
    return this.getAccounts({ currency }, config);
  }

  // Account convenience methods
  async createBankAccount(name: string, currency: string, isPrimary: boolean = false, balance: number = 0, description?: string, config?: ApiConfigOverride): Promise<FinancialAccount> {
    const accountData: CreateFinancialAccountData = {
      name,
      type: 'bank',
      currency,
      is_primary: isPrimary,
      balance,
      description
    };
    return this.createAccount(accountData, config);
  }

  async createCreditCardAccount(name: string, currency: string, description?: string, config?: ApiConfigOverride): Promise<FinancialAccount> {
    const accountData: CreateFinancialAccountData = {
      name,
      type: 'credit_card',
      currency,
      description
    };
    return this.createAccount(accountData, config);
  }

  async updateAccountBalance(accountId: string, newBalance: number, config?: ApiConfigOverride): Promise<FinancialAccount> {
    return this.updateAccount(accountId, { balance: newBalance }, config);
  }

  async setPrimaryAccount(accountId: string, config?: ApiConfigOverride): Promise<FinancialAccount> {
    // First, get all accounts and set is_primary to false
    const accounts = await this.getAccounts(config);
    const updatePromises = accounts
      .filter(account => account.is_primary)
      .map(account => this.updateAccount(account.id, { is_primary: false }, config));
    
    await Promise.all(updatePromises);
    
    // Then set the specified account as primary
    return this.updateAccount(accountId, { is_primary: true }, config);
  }

  // Account analytics
  async getTotalAccountBalance(config?: ApiConfigOverride): Promise<number> {
    const accounts = await this.getAccounts({}, config);
    return accounts.reduce((total, account) => {
      // Add positive balances for assets, subtract negative balances for liabilities
      if (account.type === 'credit_card' || account.type === 'loan') {
        return total - Math.abs(account.balance);
      }
      return total + account.balance;
    }, 0);
  }

  async getTotalBalanceByType(type: FinancialAccount['type'], config?: ApiConfigOverride): Promise<number> {
    const accounts = await this.getAccountsByType(type, config);
    return accounts.reduce((total, account) => total + account.balance, 0);
  }

  async getTotalBalanceByCurrency(currency: string, config?: ApiConfigOverride): Promise<number> {
    const accounts = await this.getAccountsByCurrency(currency, config);
    return accounts.reduce((total, account) => total + account.balance, 0);
  }

  // ================================
  // CATEGORY UTILITY METHODS
  // ================================

  // Category filtering methods
  async getCategoriesByType(type: Category['type'], config?: ApiConfigOverride): Promise<Category[]> {
    return this.getCategories({ type }, config);
  }

  async getIncomeCategories(config?: ApiConfigOverride): Promise<Category[]> {
    return this.getCategoriesByType('income', config);
  }

  async getExpenseCategories(config?: ApiConfigOverride): Promise<Category[]> {
    return this.getCategoriesByType('expense', config);
  }

  // Category convenience methods
  async createIncomeCategory(name: string, description?: string, color?: string, config?: ApiConfigOverride): Promise<Category> {
    const categoryData: CreateCategoryData = {
      name,
      type: 'income',
      description,
      color
    };
    return this.createCategory(categoryData, config);
  }

  async createExpenseCategory(name: string, description?: string, color?: string, config?: ApiConfigOverride): Promise<Category> {
    const categoryData: CreateCategoryData = {
      name,
      type: 'expense',
      description,
      color
    };
    return this.createCategory(categoryData, config);
  }

  async getCategoryByName(name: string, config?: ApiConfigOverride): Promise<Category | null> {
    const categories = await this.getCategories({}, config);
    return categories.find(category => category.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async updateCategoryColor(categoryId: string, color: string, config?: ApiConfigOverride): Promise<Category> {
    return this.updateCategory(categoryId, { color }, config);
  }

  // Category analytics
  async getCategoryCount(config?: ApiConfigOverride): Promise<{ income: number; expense: number; total: number }> {
    const categories = await this.getCategories({}, config);
    const incomeCount = categories.filter(cat => cat.type === 'income').length;
    const expenseCount = categories.filter(cat => cat.type === 'expense').length;
    
    return {
      income: incomeCount,
      expense: expenseCount,
      total: categories.length
    };
  }

  // ================================
  // TRANSACTION METHODS
  // ================================

  /**
   * Get all transactions with optional filtering
   * 
   * @param params - Query parameters for filtering transactions
   * @param config - API configuration override
   * @returns Promise resolving to array of transactions
   * 
   * @example
   * ```typescript
   * // Get all expense transactions for 2024
   * const expenses = await financeService.getTransactions({
   *   type: 'expense',
   *   start_date: '2024-01-01',
   *   end_date: '2024-12-31'
   * });
   * 
   * // Get transactions for specific account
   * const accountTransactions = await financeService.getTransactions({
   *   account_id: 'a93a22f5-4790-4530-a36c-bf78fe24309e'
   * });
   * ```
   * 
   * HTTP: GET /finance/transactions
   */
  async getTransactions(params?: { 
    type?: "income" | "expense";
    start_date?: string;
    end_date?: string;
    account_id?: string;
    category_id?: string;
    budget_allocation_id?: string;
    page?: number; 
    limit?: number; 
  }, config?: ApiConfigOverride): Promise<Transaction[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.type) queryParams.append('type', params.type);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.account_id) queryParams.append('account_id', params.account_id);
      if (params?.category_id) queryParams.append('category_id', params.category_id);
      if (params?.budget_allocation_id) queryParams.append('budget_allocation_id', params.budget_allocation_id);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `${FINANCE_ENDPOINTS.TRANSACTIONS_LIST}?${queryString}` : FINANCE_ENDPOINTS.TRANSACTIONS_LIST;
      
      const response = await this.apiClient.get<Transaction[]>(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new transaction
   * 
   * @param data - Transaction creation data
   * @param config - API configuration override
   * @returns Promise resolving to created transaction
   * 
   * @example
   * ```typescript
   * const transactionData: CreateTransactionData = {
   *   account_id: "a93a22f5-4790-4530-a36c-bf78fe24309e",
   *   category_id: "7925fe36-8aeb-495b-932e-55424a32199f",
   *   budget_allocation_id: "781c84c1-1aba-43b0-ad3c-c6a3b237d76b",
   *   type: "expense",
   *   amount: 100.50,
   *   description: "Office supplies purchase",
   *   transaction_date: "2024-03-20",
   *   reference: "INV-001",
   *   tags: ["office", "supplies"]
   * };
   * 
   * const transaction = await financeService.createTransaction(transactionData);
   * ```
   * 
   * HTTP: POST /finance/transactions
   */
  async createTransaction(data: CreateTransactionData, config?: ApiConfigOverride): Promise<Transaction> {
    try {
      const response = await this.apiClient.post<Transaction>(
        FINANCE_ENDPOINTS.TRANSACTIONS_LIST,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get transaction by ID
   * 
   * @param transactionId - ID of the transaction to retrieve
   * @param config - API configuration override
   * @returns Promise resolving to transaction details
   * 
   * @example
   * ```typescript
   * const transaction = await financeService.getTransactionById(
   *   'f95f2ac4-2f18-4596-8efb-62f333959ba8'
   * );
   * console.log('Transaction:', transaction.description, transaction.amount);
   * ```
   * 
   * HTTP: GET /finance/transactions/:id
   */
  async getTransactionById(transactionId: string, config?: ApiConfigOverride): Promise<Transaction> {
    try {
      const response = await this.apiClient.get<Transaction>(
        FINANCE_ENDPOINTS.TRANSACTION_DETAIL(transactionId),
        config
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update transaction by ID
   * 
   * @param transactionId - ID of the transaction to update
   * @param data - Transaction update data
   * @param config - API configuration override
   * @returns Promise resolving to updated transaction
   * 
   * @example
   * ```typescript
   * const updatedTransaction = await financeService.updateTransaction(
   *   'f95f2ac4-2f18-4596-8efb-62f333959ba8',
   *   {
   *     amount: 125.75,
   *     description: "Updated office supplies purchase",
   *     tags: ["office", "supplies", "updated"]
   *   }
   * );
   * ```
   * 
   * HTTP: PUT /finance/transactions/:id
   */
  async updateTransaction(transactionId: string, data: UpdateTransactionData, config?: ApiConfigOverride): Promise<Transaction> {
    try {
      const response = await this.apiClient.put<Transaction>(
        FINANCE_ENDPOINTS.TRANSACTION_DETAIL(transactionId),
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete transaction by ID
   * 
   * @param transactionId - ID of the transaction to delete
   * @param config - API configuration override
   * @returns Promise resolving when transaction is deleted
   * 
   * @example
   * ```typescript
   * await financeService.deleteTransaction('f95f2ac4-2f18-4596-8efb-62f333959ba8');
   * console.log('Transaction deleted successfully');
   * ```
   * 
   * HTTP: DELETE /finance/transactions/:id
   */
  async deleteTransaction(transactionId: string, config?: ApiConfigOverride): Promise<void> {
    try {
      await this.apiClient.delete(
        FINANCE_ENDPOINTS.TRANSACTION_DETAIL(transactionId),
        config
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ================================
  // TRANSACTION UTILITY METHODS
  // ================================

  // Transaction filtering methods
  async getTransactionsByType(type: Transaction['type'], config?: ApiConfigOverride): Promise<Transaction[]> {
    return this.getTransactions({ type }, config);
  }

  async getIncomeTransactions(config?: ApiConfigOverride): Promise<Transaction[]> {
    return this.getTransactionsByType('income', config);
  }

  async getExpenseTransactions(config?: ApiConfigOverride): Promise<Transaction[]> {
    return this.getTransactionsByType('expense', config);
  }

  async getTransactionsByAccount(accountId: string, config?: ApiConfigOverride): Promise<Transaction[]> {
    return this.getTransactions({ account_id: accountId }, config);
  }

  async getTransactionsByCategory(categoryId: string, config?: ApiConfigOverride): Promise<Transaction[]> {
    return this.getTransactions({ category_id: categoryId }, config);
  }

  async getTransactionsByBudgetAllocation(budgetAllocationId: string, config?: ApiConfigOverride): Promise<Transaction[]> {
    return this.getTransactions({ budget_allocation_id: budgetAllocationId }, config);
  }

  async getTransactionsForDateRange(startDate: string, endDate: string, config?: ApiConfigOverride): Promise<Transaction[]> {
    return this.getTransactions({ start_date: startDate, end_date: endDate }, config);
  }

  async getTransactionsForCurrentMonth(config?: ApiConfigOverride): Promise<Transaction[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getTransactionsForDateRange(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0],
      config
    );
  }

  async getTransactionsForCurrentYear(config?: ApiConfigOverride): Promise<Transaction[]> {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    
    return this.getTransactionsForDateRange(
      startOfYear.toISOString().split('T')[0],
      endOfYear.toISOString().split('T')[0],
      config
    );
  }

  // Transaction convenience methods
  async createIncomeTransaction(
    accountId: string,
    categoryId: string,
    amount: number,
    description: string,
    transactionDate: string,
    options?: {
      budgetAllocationId?: string;
      reference?: string;
      tags?: string[];
    },
    config?: ApiConfigOverride
  ): Promise<Transaction> {
    const transactionData: CreateTransactionData = {
      account_id: accountId,
      category_id: categoryId,
      type: 'income',
      amount,
      description,
      transaction_date: transactionDate,
      budget_allocation_id: options?.budgetAllocationId,
      reference: options?.reference,
      tags: options?.tags
    };
    return this.createTransaction(transactionData, config);
  }

  async createExpenseTransaction(
    accountId: string,
    categoryId: string,
    amount: number,
    description: string,
    transactionDate: string,
    options?: {
      budgetAllocationId?: string;
      reference?: string;
      tags?: string[];
    },
    config?: ApiConfigOverride
  ): Promise<Transaction> {
    const transactionData: CreateTransactionData = {
      account_id: accountId,
      category_id: categoryId,
      type: 'expense',
      amount,
      description,
      transaction_date: transactionDate,
      budget_allocation_id: options?.budgetAllocationId,
      reference: options?.reference,
      tags: options?.tags
    };
    return this.createTransaction(transactionData, config);
  }

  async updateTransactionAmount(transactionId: string, newAmount: number, config?: ApiConfigOverride): Promise<Transaction> {
    return this.updateTransaction(transactionId, { amount: newAmount }, config);
  }

  async updateTransactionDescription(transactionId: string, newDescription: string, config?: ApiConfigOverride): Promise<Transaction> {
    return this.updateTransaction(transactionId, { description: newDescription }, config);
  }

  async addTransactionTags(transactionId: string, newTags: string[], config?: ApiConfigOverride): Promise<Transaction> {
    const transaction = await this.getTransactionById(transactionId, config);
    const existingTags = transaction.tags || [];
    const updatedTags = [...new Set([...existingTags, ...newTags])]; // Remove duplicates
    return this.updateTransaction(transactionId, { tags: updatedTags }, config);
  }

  async removeTransactionTags(transactionId: string, tagsToRemove: string[], config?: ApiConfigOverride): Promise<Transaction> {
    const transaction = await this.getTransactionById(transactionId, config);
    const existingTags = transaction.tags || [];
    const updatedTags = existingTags.filter(tag => !tagsToRemove.includes(tag));
    return this.updateTransaction(transactionId, { tags: updatedTags }, config);
  }

  // Transaction analytics
  async getTotalTransactionAmount(config?: ApiConfigOverride): Promise<number> {
    const transactions = await this.getTransactions({}, config);
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
    }, 0);
  }

  async getTotalIncomeAmount(config?: ApiConfigOverride): Promise<number> {
    const incomeTransactions = await this.getIncomeTransactions(config);
    return incomeTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  async getTotalExpenseAmount(config?: ApiConfigOverride): Promise<number> {
    const expenseTransactions = await this.getExpenseTransactions(config);
    return expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  async getTransactionAmountByAccount(accountId: string, config?: ApiConfigOverride): Promise<number> {
    const transactions = await this.getTransactionsByAccount(accountId, config);
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'income' ? total + transaction.amount : total - transaction.amount;
    }, 0);
  }

  async getTransactionAmountByCategory(categoryId: string, config?: ApiConfigOverride): Promise<number> {
    const transactions = await this.getTransactionsByCategory(categoryId, config);
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  async getTransactionCount(config?: ApiConfigOverride): Promise<{ income: number; expense: number; total: number }> {
    const transactions = await this.getTransactions({}, config);
    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    
    return {
      income: incomeCount,
      expense: expenseCount,
      total: transactions.length
    };
  }

  async getTransactionCountByAccount(accountId: string, config?: ApiConfigOverride): Promise<number> {
    const transactions = await this.getTransactionsByAccount(accountId, config);
    return transactions.length;
  }

  async getTransactionCountByCategory(categoryId: string, config?: ApiConfigOverride): Promise<number> {
    const transactions = await this.getTransactionsByCategory(categoryId, config);
    return transactions.length;
  }

  async getAverageTransactionAmount(config?: ApiConfigOverride): Promise<number> {
    const transactions = await this.getTransactions({}, config);
    if (transactions.length === 0) return 0;
    
    const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    return totalAmount / transactions.length;
  }

  async getLargestTransaction(config?: ApiConfigOverride): Promise<Transaction | null> {
    const transactions = await this.getTransactions({}, config);
    if (transactions.length === 0) return null;
    
    return transactions.reduce((largest, transaction) => 
      transaction.amount > largest.amount ? transaction : largest
    );
  }

  async getSmallestTransaction(config?: ApiConfigOverride): Promise<Transaction | null> {
    const transactions = await this.getTransactions({}, config);
    if (transactions.length === 0) return null;
    
    return transactions.reduce((smallest, transaction) => 
      transaction.amount < smallest.amount ? transaction : smallest
    );
  }

  async getTransactionsByTag(tag: string, config?: ApiConfigOverride): Promise<Transaction[]> {
    const transactions = await this.getTransactions({}, config);
    return transactions.filter(transaction => 
      transaction.tags && transaction.tags.includes(tag)
    );
  }

  async getTransactionsByReference(reference: string, config?: ApiConfigOverride): Promise<Transaction[]> {
    const transactions = await this.getTransactions({}, config);
    return transactions.filter(transaction => 
      transaction.reference && transaction.reference.includes(reference)
    );
  }

  async getTransactionsFromLastNDays(days: number, config?: ApiConfigOverride): Promise<Transaction[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return this.getTransactionsForDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      config
    );
  }

  async getMonthlyTransactionSummary(year: number, month: number, config?: ApiConfigOverride): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    transactionCount: number;
    incomeCount: number;
    expenseCount: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = await this.getTransactionsForDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      config
    );

    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length
    };
  }
}

// Remove default instance export from here, it's handled in src/apis/index.ts
// export const financeService = new FinanceService();
// export default financeService; 