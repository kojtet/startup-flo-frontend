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
import type { Budget, CreateBudgetData, UpdateBudgetData } from '@/apis/types';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBudgetData | UpdateBudgetData) => Promise<void>;
  budget?: Budget | null;
  isLoading?: boolean;
}

export function BudgetForm({ isOpen, onClose, onSubmit, budget, isLoading = false }: BudgetFormProps) {
  const [formData, setFormData] = useState<Omit<CreateBudgetData, 'owner_id'>>({
    name: '',
    scope_type: 'company',
    scope_ref: '',
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_amount: 0,
    status: 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when budget changes
  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        scope_type: budget.scope_type,
        scope_ref: budget.scope_ref || '',
        period_start: budget.period_start,
        period_end: budget.period_end,
        total_amount: budget.total_amount,
        status: budget.status
      });
    } else {
      setFormData({
        name: '',
        scope_type: 'company',
        scope_ref: '',
        period_start: new Date().toISOString().split('T')[0],
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_amount: 0,
        status: 'active'
      });
    }
    setErrors({});
  }, [budget, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }

    if (!formData.period_start) {
      newErrors.period_start = 'Start date is required';
    }

    if (!formData.period_end) {
      newErrors.period_end = 'End date is required';
    }

    if (formData.period_start && formData.period_end && formData.period_start >= formData.period_end) {
      newErrors.period_end = 'End date must be after start date';
    }

    if (formData.total_amount < 0) {
      newErrors.total_amount = 'Total amount must be positive';
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

  const handleInputChange = (field: keyof Omit<CreateBudgetData, 'owner_id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {budget ? 'Edit Budget' : 'Create New Budget'}
            </DialogTitle>
            <DialogDescription>
              {budget ? 'Update budget details below.' : 'Set up a new budget to track your spending.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="budget-name">Budget Name *</Label>
              <Input
                id="budget-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Q1 2024 Marketing Budget"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget-scope">Scope Type *</Label>
              <Select
                value={formData.scope_type}
                onValueChange={(value: any) => handleInputChange('scope_type', value)}
              >
                <SelectTrigger className={errors.scope_type ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              {errors.scope_type && <p className="text-sm text-red-500">{errors.scope_type}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget-amount">Total Amount *</Label>
              <Input
                id="budget-amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_amount}
                onChange={(e) => handleInputChange('total_amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.total_amount ? 'border-red-500' : ''}
              />
              {errors.total_amount && <p className="text-sm text-red-500">{errors.total_amount}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="budget-start">Start Date *</Label>
                <Input
                  id="budget-start"
                  type="date"
                  value={formData.period_start}
                  onChange={(e) => handleInputChange('period_start', e.target.value)}
                  className={errors.period_start ? 'border-red-500' : ''}
                />
                {errors.period_start && <p className="text-sm text-red-500">{errors.period_start}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget-end">End Date *</Label>
                <Input
                  id="budget-end"
                  type="date"
                  value={formData.period_end}
                  onChange={(e) => handleInputChange('period_end', e.target.value)}
                  className={errors.period_end ? 'border-red-500' : ''}
                />
                {errors.period_end && <p className="text-sm text-red-500">{errors.period_end}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="budget-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {budget ? 'Update Budget' : 'Create Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 