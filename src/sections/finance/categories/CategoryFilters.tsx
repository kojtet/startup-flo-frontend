import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  onCreateClick: () => void;
}

export function CategoryFilters({ 
  searchTerm, 
  setSearchTerm, 
  typeFilter, 
  setTypeFilter, 
  onCreateClick 
}: CategoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="flex gap-3 w-full sm:w-auto">
        {/* Enhanced Search Input */}
        <div className="relative flex-1 sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Enhanced Filter Dropdown */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="hover:bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                All Types
              </div>
            </SelectItem>
            <SelectItem value="income" className="hover:bg-green-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Income
              </div>
            </SelectItem>
            <SelectItem value="expense" className="hover:bg-red-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                Expense
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Active Filters Display */}
      {(searchTerm || typeFilter !== 'all') && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
            </span>
          )}
          {typeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              Type: {typeFilter}
            </span>
          )}
        </div>
      )}
    </div>
  );
} 