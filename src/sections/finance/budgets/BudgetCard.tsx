import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, Calendar, DollarSign, User, Target } from 'lucide-react';
import { getUserDisplayName } from '@/lib/utils';
import type { Budget } from '@/apis/types';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  isLoading?: boolean;
}

export function BudgetCard({ budget, onEdit, onDelete, isLoading = false }: BudgetCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScopeTypeIcon = (scopeType: string) => {
    switch (scopeType) {
      case 'company': return <Target className="h-4 w-4" />;
      case 'department': return <User className="h-4 w-4" />;
      case 'project': return <Target className="h-4 w-4" />;
      case 'user': return <User className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getScopeTypeLabel = (scopeType: string) => {
    switch (scopeType) {
      case 'company': return 'Company';
      case 'department': return 'Department';
      case 'project': return 'Project';
      case 'user': return 'User';
      default: return scopeType;
    }
  };

  // Calculate progress based on allocations
  const totalAllocated = budget.allocations.reduce((sum, allocation) => sum + allocation.amount_allocated, 0);
  const progressPercentage = budget.total_amount > 0 ? (totalAllocated / budget.total_amount) * 100 : 0;

  // Calculate remaining budget
  const remainingBudget = budget.total_amount - totalAllocated;

  // Format dates
  const startDate = new Date(budget.period_start).toLocaleDateString();
  const endDate = new Date(budget.period_end).toLocaleDateString();

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {budget.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(budget.status)}>
                {budget.status.toUpperCase()}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {getScopeTypeIcon(budget.scope_type)}
                <span>{getScopeTypeLabel(budget.scope_type)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(budget)}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(budget.id)}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Total Budget</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              ${budget.total_amount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Allocated: ${totalAllocated.toLocaleString()}</span>
            <span>Remaining: ${remainingBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{startDate} - {endDate}</span>
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{getUserDisplayName(budget.owner)}</span>
        </div>

        {/* Allocations Summary */}
        {budget.allocations.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-sm text-gray-600 mb-2">Allocations:</div>
            <div className="space-y-1">
              {budget.allocations.slice(0, 3).map((allocation) => (
                <div key={allocation.id} className="flex justify-between text-xs">
                  <span className="text-gray-600">{allocation.category.name}</span>
                  <span className="font-medium">${allocation.amount_allocated.toLocaleString()}</span>
                </div>
              ))}
              {budget.allocations.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{budget.allocations.length - 3} more allocations
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 