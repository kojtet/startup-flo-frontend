import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Account } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface AccountFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  industryFilter: string;
  setIndustryFilter: (filter: string) => void;
  accounts?: Account[];
  sortKey: string;
  setSortKey: (value: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
}

export const AccountFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  industryFilter, 
  setIndustryFilter,
  accounts = [],
  sortKey,
  setSortKey,
  sortDirection,
  setSortDirection
}: AccountFiltersProps) => {
  // Get unique industries from accounts
  const industries = Array.from(new Set(accounts.map(account => account.industry).filter(Boolean)));

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search accounts by name, industry, or website..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              <SelectItem value="none">No industry</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Sort Dropdown */}
        <Select value={sortKey} onValueChange={setSortKey}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Sort by Created Date</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="industry">Sort by Industry</SelectItem>
            <SelectItem value="website">Sort by Website</SelectItem>
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
    </div>
  );
}; 