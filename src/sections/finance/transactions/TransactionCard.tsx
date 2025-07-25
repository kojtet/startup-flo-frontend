import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, TrendingUp, TrendingDown, Calendar, DollarSign, Tag } from 'lucide-react';
import type { Transaction, FinancialAccount, FinanceCategory } from '@/apis/types';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  isLoading?: boolean;
  account?: FinancialAccount;
  category?: FinanceCategory;
}

export function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete, 
  isLoading = false,
  account,
  category
}: TransactionCardProps) {
  const getTransactionIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'income' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const IconComponent = getTransactionIcon(transaction.type);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <IconComponent 
                className={`h-6 w-6 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} 
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                <Badge className={getTransactionTypeColor(transaction.type)}>
                  {transaction.type.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                {account && category && (
                  <p>{account.name} • {category.name}</p>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                  {transaction.reference && (
                    <>
                      <span>•</span>
                      <span>Ref: {transaction.reference}</span>
                    </>
                  )}
                </div>

                {transaction.tags && transaction.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Tag className="h-3 w-3" />
                    <div className="flex gap-1">
                      {transaction.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {transaction.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{transaction.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(transaction)}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(transaction.id)}
                disabled={isLoading}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 