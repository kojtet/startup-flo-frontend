import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Lead, Account } from "@/apis/types";

interface ContactFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  accountFilter: string;
  setAccountFilter: (filter: string) => void;
  leadFilter: string;
  setLeadFilter: (filter: string) => void;
  accounts?: Account[];
  leads?: Lead[];
}

export const ContactFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  accountFilter, 
  setAccountFilter, 
  leadFilter, 
  setLeadFilter,
  accounts = [],
  leads = []
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
      </div>
    </div>
  );
}; 