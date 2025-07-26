import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  accountFilter: string;
  onAccountFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  budgetAllocationFilter: string;
  onBudgetAllocationFilterChange: (value: string) => void;
  onClearFilters: () => void;
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: string }>;
  budgetAllocations: Array<{ id: string; category: { name: string }; amount_allocated: number }>;
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  accountFilter,
  onAccountFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  budgetAllocationFilter,
  onBudgetAllocationFilterChange,
  onClearFilters,
  accounts,
  categories,
  budgetAllocations
}: TransactionFiltersProps) {
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || accountFilter !== 'all' || 
    categoryFilter !== 'all' || budgetAllocationFilter !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex gap-2 w-full sm:w-auto flex-wrap">
        {/* Search */}
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        {/* Account Filter */}
        <Select value={accountFilter} onValueChange={onAccountFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Budget Allocation Filter */}
        <Select value={budgetAllocationFilter} onValueChange={onBudgetAllocationFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Budget Allocation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Allocations</SelectItem>
            <SelectItem value="none">No Allocation</SelectItem>
            {budgetAllocations.filter(a => a.id && a.id !== '').map(allocation => (
              <SelectItem key={allocation.id} value={allocation.id}>
                {allocation.category.name} - ${allocation.amount_allocated.toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-10 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
} 