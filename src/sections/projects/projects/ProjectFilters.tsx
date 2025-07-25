import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface ProjectFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    status: string;
    priority: string;
    teamLead: string;
    dateRange: string;
  };
  onFiltersChange: (filters: any) => void;
  users: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ProjectFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  users,
  hasActiveFilters,
  onClearFilters
}: ProjectFiltersProps) {
  return (
    <div className="flex space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search projects..."
          className="max-w-md pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={hasActiveFilters ? "border-blue-500 bg-blue-50" : ""}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {Object.values(filters).filter(v => v !== 'all').length + (searchTerm ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Filter Projects</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={filters.status} onValueChange={(value) => onFiltersChange({...filters, status: value})}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Lead Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Team Lead</Label>
                <Select value={filters.teamLead} onValueChange={(value) => onFiltersChange({...filters, teamLead: value})}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Team Leads</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Date</Label>
                <Select value={filters.dateRange} onValueChange={(value) => onFiltersChange({...filters, dateRange: value})}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="due_this_week">Due This Week</SelectItem>
                    <SelectItem value="due_this_month">Due This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 