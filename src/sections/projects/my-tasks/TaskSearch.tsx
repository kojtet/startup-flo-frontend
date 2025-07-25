import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";

interface TaskSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  isLoading: boolean;
}

export const TaskSearch: React.FC<TaskSearchProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onClearSearch, 
  isLoading 
}) => {
  return (
    <div className="flex space-x-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          className="max-w-md pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <Button variant="outline" disabled={isLoading}>
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
    </div>
  );
}; 