import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Lead, Account } from "@/apis/types";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ContactFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  accountFilter: string;
  setAccountFilter: (filter: string) => void;
  leadFilter: string;
  setLeadFilter: (filter: string) => void;
  accounts?: Account[];
  leads?: Lead[];
  sortKey: string;
  setSortKey: (value: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
}

export const ContactFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  accountFilter, 
  setAccountFilter, 
  leadFilter, 
  setLeadFilter,
  accounts = [],
  leads = [],
  sortKey,
  setSortKey,
  sortDirection,
  setSortDirection
}: ContactFiltersProps) => {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search contacts by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              <SelectItem value="none">No account</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={leadFilter} onValueChange={setLeadFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All leads</SelectItem>
              <SelectItem value="none">No lead</SelectItem>
              {leads.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.name}
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
            <SelectItem value="first_name">Sort by First Name</SelectItem>
            <SelectItem value="last_name">Sort by Last Name</SelectItem>
            <SelectItem value="email">Sort by Email</SelectItem>
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