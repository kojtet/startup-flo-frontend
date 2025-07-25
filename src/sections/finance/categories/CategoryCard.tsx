import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';
import type { FinanceCategory } from '@/apis/types';

interface CategoryCardProps {
  category: FinanceCategory;
  onEdit: (category: FinanceCategory) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const getCategoryIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getCategoryTypeColor = (type: string) => {
    return type === 'income' 
      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-500'
      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-500';
  };

  const getCategoryTypeBg = (type: string) => {
    return type === 'income' 
      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
      : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200';
  };

  const IconComponent = getCategoryIcon(category.type);

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 ${getCategoryTypeBg(category.type)}`}>
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10"
        style={{ 
          background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}80 100%)` 
        }}
      />
      
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Enhanced icon container */}
            <div 
              className="p-3 rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110"
              style={{ 
                backgroundColor: `${category.color}15`,
                border: `2px solid ${category.color}30`
              }}
            >
              <IconComponent 
                className="h-6 w-6 transition-colors duration-300" 
                style={{ color: category.color }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {category.name}
                </h3>
                <Badge className={`${getCategoryTypeColor(category.type)} font-medium text-xs px-2 py-1 shadow-sm`}>
                  {category.type.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {category.description || 'No description provided'}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created {new Date(category.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>ID: {category.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(category.id)}
              className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Color indicator bar */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
          style={{ backgroundColor: category.color }}
        />
      </CardContent>
    </Card>
  );
} 