import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Globe, 
  Calendar, 
  Building, 
  Edit, 
  Trash2,
  ExternalLink
} from "lucide-react";
import type { Account } from "@/apis/types";

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

export const AccountCard = ({ account, onEdit, onDelete }: AccountCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-base truncate">
                  {account.name}
                </h3>
                {account.industry && (
                  <Badge className="bg-gray-100 text-gray-800">
                    {account.industry}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                {account.website && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <a 
                      href={account.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline"
                    >
                      {account.website.replace(/^https?:\/\//, '')}
                    </a>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(account.created_at).toLocaleDateString()}
                </span>
              </div>
              
              {account.notes && (
                <div className="text-sm text-gray-600">
                  <p className="line-clamp-2">{account.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {account.website && (
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Mail className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(account)} 
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(account.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 