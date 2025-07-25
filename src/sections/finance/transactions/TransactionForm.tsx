import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import type { Transaction, CreateTransactionData, UpdateTransactionData, FinancialAccount, FinanceCategory, BudgetAllocation } from '@/apis/types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionData | UpdateTransactionData) => Promise<void>;
  transaction?: Transaction | null;
  isLoading?: boolean;
  accounts: FinancialAccount[];
  categories: FinanceCategory[];
  budgetAllocations: BudgetAllocation[];
}

export function TransactionForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  transaction, 
  isLoading = false,
  accounts,
  categories,
  budgetAllocations
}: TransactionFormProps) {
  const [formData, setFormData] = useState<CreateTransactionData>({
    account_id: '',
    category_id: '',
    budget_allocation_id: '',
    type: 'expense',
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    reference: '',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        account_id: transaction.account_id,
        category_id: transaction.category_id,
        budget_allocation_id: transaction.budget_allocation_id || '',
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: transaction.transaction_date,
        reference: transaction.reference || '',
        tags: transaction.tags || []
      });
    } else {
      setFormData({
        account_id: '',
        category_id: '',
        budget_allocation_id: '',
        type: 'expense',
        amount: 0,
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        reference: '',
        tags: []
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.account_id) {
      newErrors.account_id = 'Account is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Transaction date is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleInputChange = (field: keyof CreateTransactionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Filter categories by transaction type
  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {transaction ? 'Edit Transaction' : 'Create New Transaction'}
            </DialogTitle>
            <DialogDescription>
              {transaction ? 'Update transaction details below.' : 'Record a new financial transaction.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="transaction-type">Transaction Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => handleInputChange('type', value)}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction-account">Account *</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) => handleInputChange('account_id', value)}
              >
                <SelectTrigger className={errors.account_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account_id && <p className="text-sm text-red-500">{errors.account_id}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction-category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleInputChange('category_id', value)}
              >
                <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction-budget-allocation">Budget Allocation (Optional)</Label>
              <Select
                value={formData.budget_allocation_id}
                onValueChange={(value) => handleInputChange('budget_allocation_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget allocation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No allocation</SelectItem>
                  {budgetAllocations.map(allocation => (
                    <SelectItem key={allocation.id} value={allocation.id}>
                      {allocation.category.name} - ${allocation.amount_allocated.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction-amount">Amount *</Label>
              <Input
                id="transaction-amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction-description">Description *</Label>
              <Textarea
                id="transaction-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Transaction description"
                className={errors.description ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction-date">Transaction Date *</Label>
              <Input
                id="transaction-date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                className={errors.transaction_date ? 'border-red-500' : ''}
              />
              {errors.transaction_date && <p className="text-sm text-red-500">{errors.transaction_date}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction-reference">Reference (Optional)</Label>
              <Input
                id="transaction-reference"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="e.g., INV-001, Receipt #123"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 