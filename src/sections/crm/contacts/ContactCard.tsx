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
  Link
} from "lucide-react";
import type { Contact } from "@/apis/types";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
}

export const ContactCard = ({ contact, onEdit, onDelete }: ContactCardProps) => {
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
                <h3 className="font-semibold text-base truncate">
                  {contact.first_name} {contact.last_name}
                </h3>
                {contact.position && (
                  <Badge className="bg-gray-100 text-gray-800">
                    {contact.position}
                  </Badge>
                )}
                {contact.lead && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    Lead
                  </Badge>
                )}
                {contact.account && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    Account
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3" />
                  {contact.email}
                </span>
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {contact.account && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {contact.account.name}
                  </span>
                )}
                {contact.lead && (
                  <span className="flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    From: {contact.lead.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(contact.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <Mail className="h-3 w-3" />
            </Button>
            {contact.phone && (
              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                <Phone className="h-3 w-3" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onEdit(contact)} 
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(contact.id)}
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