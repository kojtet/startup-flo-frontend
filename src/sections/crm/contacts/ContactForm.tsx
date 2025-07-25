import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Contact, CreateContactData, Lead, Account } from "@/apis/types";

interface ContactFormProps {
  formData: CreateContactData;
  setFormData: React.Dispatch<React.SetStateAction<CreateContactData>>;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
  formLoading: boolean;
  onCancel: () => void;
  leads?: Lead[];
  accounts?: Account[];
}

export const ContactForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  isEdit = false, 
  formLoading, 
  onCancel,
  leads = [],
  accounts = []
}: ContactFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="first_name">First Name *</Label>
        <Input
          id="first_name"
          value={formData.first_name}
          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="last_name">Last Name *</Label>
        <Input
          id="last_name"
          value={formData.last_name}
          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
          required
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          value={formData.position || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
          placeholder="e.g., CEO, Manager"
        />
      </div>
      <div>
        <Label htmlFor="account_id">Account</Label>
        <Select 
          value={formData.account_id || "none"} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value === "none" ? "" : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an account (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No account associated</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label htmlFor="lead_id">Associated Lead</Label>
      <Select 
        value={formData.lead_id || "none"} 
        onValueChange={(value) => setFormData(prev => ({ ...prev, lead_id: value === "none" ? "" : value }))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a lead (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No lead associated</SelectItem>
          {leads.map((lead) => (
            <SelectItem key={lead.id} value={lead.id}>
              {lead.name} - {lead.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex justify-end gap-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={formLoading}>
        {formLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isEdit ? "Update Contact" : "Create Contact"}
      </Button>
    </div>
  </form>
); 