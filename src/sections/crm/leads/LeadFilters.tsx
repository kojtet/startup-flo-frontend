import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Category } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories?: Category[];
  sortKey: string;
  setSortKey: (value: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
}

export const LeadFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories = [],
  sortKey,
  setSortKey,
  sortDirection,
  setSortDirection
}: LeadFiltersProps) => {
  return (
    <div className="flex gap-4 items-center flex-wrap">
      <div className="relative flex-1 max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        <Input 
          placeholder="Search leads..." 
          className="pl-9" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="proposal">Proposal</SelectItem>
          <SelectItem value="negotiation">Negotiation</SelectItem>
          <SelectItem value="won">Won</SelectItem>
          <SelectItem value="lost">Lost</SelectItem>
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Sort Dropdown */}
      <Select value={sortKey} onValueChange={setSortKey}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Sort by Created Date</SelectItem>
          <SelectItem value="name">Sort by Name</SelectItem>
          <SelectItem value="email">Sort by Email</SelectItem>
          <SelectItem value="status">Sort by Status</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        className="w-10 flex items-center justify-center"
        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
        aria-label={sortDirection === "asc" ? "Sort ascending" : "Sort descending"}
      >
        {sortDirection === "asc" ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </Button>
    </div>
  );
}; 