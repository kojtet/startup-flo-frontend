import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Wallet, CreditCard, DollarSign, TrendingUp, Banknote } from 'lucide-react';
import type { FinancialAccount } from '@/apis/types';

interface AccountCardProps {
  account: FinancialAccount;
  onEdit: (account: FinancialAccount) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return Wallet;
      case 'credit_card': return CreditCard;
      case 'cash': return DollarSign;
      case 'investment': return TrendingUp;
      case 'loan': return Banknote;
      default: return Wallet;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'bank': return 'bg-blue-100 text-blue-800';
      case 'credit_card': return 'bg-red-100 text-red-800';
      case 'cash': return 'bg-green-100 text-green-800';
      case 'investment': return 'bg-purple-100 text-purple-800';
      case 'loan': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'bank': return 'BANK';
      case 'credit_card': return 'CREDIT CARD';
      case 'cash': return 'CASH';
      case 'investment': return 'INVESTMENT';
      case 'loan': return 'LOAN';
      default: return 'OTHER';
    }
  };

  const IconComponent = getAccountIcon(account.type);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <IconComponent className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{account.name}</h3>
                {account.is_primary && (
                  <Badge variant="secondary" className="text-xs">
                    Primary
                  </Badge>
                )}
                <Badge className={`text-xs ${getAccountTypeColor(account.type)}`}>
                  {getAccountTypeLabel(account.type)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {account.description || 'No description'}
              </p>
              <p className="text-xs text-gray-500">
                Created: {new Date(account.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {account.balance.toLocaleString('en-US', {
                style: 'currency',
                currency: account.currency
              })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(account)}
                className="h-8 px-3"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(account.id)}
                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
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