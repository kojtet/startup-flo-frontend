
export const FINANCE_ENDPOINTS = {
  // Overview
  OVERVIEW: "/finance/overview",
  
  // Invoice endpoints
  INVOICES_LIST: "/finance/invoices",                    // GET all invoices, POST create invoice
  INVOICE_DETAIL: (invoiceId: string) => `/finance/invoices/${invoiceId}`, // GET, PATCH, DELETE invoice by ID
  INVOICE_STATUS: (invoiceId: string) => `/finance/invoices/${invoiceId}/status`, // PATCH update invoice status
  INVOICE_SEND: (invoiceId: string) => `/finance/invoices/${invoiceId}/send`, // POST send invoice
  INVOICE_PAYMENT: (invoiceId: string) => `/finance/invoices/${invoiceId}/payment`, // POST record payment
  
  // Expense endpoints
  EXPENSES_LIST: "/finance/expenses",                    // GET all expenses, POST create expense
  EXPENSE_DETAIL: (expenseId: string) => `/finance/expenses/${expenseId}`, // GET, PATCH, DELETE expense by ID
  EXPENSE_STATUS: (expenseId: string) => `/finance/expenses/${expenseId}/status`, // PATCH update expense status
  EXPENSE_APPROVE: (expenseId: string) => `/finance/expenses/${expenseId}/approve`, // POST approve expense
  EXPENSE_REJECT: (expenseId: string) => `/finance/expenses/${expenseId}/reject`, // POST reject expense
  
  // Payment endpoints
  PAYMENTS_LIST: "/finance/payments",                    // GET all payments, POST create payment
  PAYMENT_DETAIL: (paymentId: string) => `/finance/payments/${paymentId}`, // GET, PATCH, DELETE payment by ID
  
  // Budget Category endpoints
  BUDGET_CATEGORIES_LIST: "/finance/budget-categories", // GET all budget categories, POST create budget category
  BUDGET_CATEGORY_DETAIL: (categoryId: string) => `/finance/budget-categories/${categoryId}`, // GET, PUT, DELETE budget category by ID

  // Budget endpoints
  BUDGETS_LIST: "/finance/budgets",                      // GET all budgets, POST create budget
  BUDGET_DETAIL: (budgetId: string) => `/finance/budgets/${budgetId}`, // GET, PUT, DELETE budget by ID
  BUDGET_CLOSE: (budgetId: string) => `/finance/budgets/${budgetId}/close`, // POST close budget
  BUDGET_ARCHIVE: (budgetId: string) => `/finance/budgets/${budgetId}/archive`, // POST archive budget
  BUDGET_SUMMARY: (budgetId: string) => `/finance/budgets/${budgetId}/summary`, // GET budget summary
  BUDGET_TRANSACTIONS: (budgetId: string) => `/finance/budgets/${budgetId}/transactions`, // GET budget transactions
  BUDGET_SNAPSHOTS: (budgetId: string) => `/finance/budgets/${budgetId}/snapshots`, // GET budget snapshots
  BUDGET_ALLOCATIONS: (budgetId: string) => `/finance/budgets/${budgetId}/allocations`, // GET budget allocations, POST create allocation
  BUDGET_ALLOCATION_DETAIL: (allocationId: string) => `/finance/budgets/allocations/${allocationId}`, // GET, PUT, DELETE allocation by ID
  ALLOCATION_SUMMARY: (allocationId: string) => `/finance/allocations/${allocationId}/summary`, // GET allocation summary
  
  // Account endpoints
  ACCOUNTS_LIST: "/finance/accounts",                    // GET all accounts, POST create account
  ACCOUNT_DETAIL: (accountId: string) => `/finance/accounts/${accountId}`, // GET, PUT, DELETE account by ID
  
  // Category endpoints
  CATEGORIES_LIST: "/finance/categories",                // GET all categories, POST create category
  CATEGORY_DETAIL: (categoryId: string) => `/finance/categories/${categoryId}`, // GET, PUT, DELETE category by ID
  
  // Transaction endpoints
  TRANSACTIONS_LIST: "/finance/transactions",            // GET all transactions, POST create transaction
  TRANSACTION_DETAIL: (transactionId: string) => `/finance/transactions/${transactionId}`, // GET, PUT, DELETE transaction by ID
  
  // Report endpoints
  REPORTS: "/finance/reports",                           // GET financial reports
  REPORTS_REVENUE: "/finance/reports/revenue",           // GET revenue reports
  REPORTS_EXPENSES: "/finance/reports/expenses",         // GET expense reports
  REPORTS_PROFIT_LOSS: "/finance/reports/profit-loss",   // GET profit & loss reports
  REPORTS_CASH_FLOW: "/finance/reports/cash-flow",       // GET cash flow reports
  
  // Tax endpoints
  TAX_RECORDS: "/finance/tax-records",                   // GET tax records
  TAX_CALCULATIONS: "/finance/tax-calculations",         // GET tax calculations
};
