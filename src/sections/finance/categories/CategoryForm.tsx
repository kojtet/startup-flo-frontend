import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, TrendingDown, Palette, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CreateFinanceCategoryData } from '@/apis/types';

interface CategoryFormProps {
  formData: CreateFinanceCategoryData;
  setFormData: (data: CreateFinanceCategoryData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CategoryForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isLoading = false,
  submitLabel = "Create Category"
}: CategoryFormProps) {
  const getTypeIcon = (type: string) => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const TypeIcon = getTypeIcon(formData.type);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Category Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Office Supplies, Salary, Marketing"
          required
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
        />
        <p className="text-xs text-gray-500">Choose a descriptive name for your category</p>
      </div>

      {/* Category Type */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <TypeIcon className={`h-4 w-4 ${getTypeColor(formData.type)}`} />
          Category Type
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200">
            <SelectValue placeholder="Select category type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income" className="hover:bg-green-50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Income</span>
              </div>
            </SelectItem>
            <SelectItem value="expense" className="hover:bg-red-50">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span>Expense</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          {formData.type === 'income' 
            ? 'For money coming into your business' 
            : 'For money going out of your business'
          }
        </p>
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <Label htmlFor="color" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Category Color
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="h-12 w-20 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
          />
          <div className="flex-1">
            <div 
              className="w-full h-8 rounded-lg border-2 border-gray-200 transition-all duration-200"
              style={{ backgroundColor: formData.color }}
            />
            <p className="text-xs text-gray-500 mt-1">Choose a color to identify this category</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional: Add more details about this category..."
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 min-h-[80px]"
        />
        <p className="text-xs text-gray-500">Help others understand what this category is for</p>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg shadow-sm"
            style={{ backgroundColor: `${formData.color}15` }}
          >
            <TypeIcon 
              className="h-5 w-5" 
              style={{ color: formData.color }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {formData.name || 'Category Name'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.type === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {formData.type?.toUpperCase() || 'TYPE'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {formData.description || 'No description'}
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] py-3"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Saving...
          </div>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
} 