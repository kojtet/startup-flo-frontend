import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  Building, 
  Edit, 
  Trash2,
  Briefcase,
  Tag,
  ArrowRight
} from "lucide-react";
import type { Lead } from "@/apis/types";

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onConvert: (lead: Lead) => void;
}

export const LeadCard = ({ lead, onEdit, onDelete, onConvert }: LeadCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "qualified": return "bg-green-100 text-green-800";
      case "proposal": return "bg-purple-100 text-purple-800";
      case "negotiation": return "bg-orange-100 text-orange-800";
      case "won": return "bg-emerald-100 text-emerald-800";
      case "lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-base truncate">{lead.name}</h3>
                <Badge className={getStatusColor(lead.status)}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
                {lead.category && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: lead.category.color }}
                    />
                    {lead.category.name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3" />
                  {lead.email}
                </span>
                {lead.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {lead.company && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {lead.company}
                  </span>
                )}
                {lead.title && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {lead.title}
                  </span>
                )}
                {lead.source && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {lead.source.replace('_', ' ')}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Mail className="h-3 w-3" />
            </Button>
            {lead.phone && (
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <Phone className="h-3 w-3" />
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Calendar className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(lead)} 
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onConvert(lead)}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              title="Convert to Opportunity"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(lead.id)}
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