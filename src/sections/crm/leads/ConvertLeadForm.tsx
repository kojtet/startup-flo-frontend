import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building, User, Plus, Target } from "lucide-react";
import type { Account, Contact, Stage } from "@/apis/types";

interface ConvertLeadFormProps {
  onSubmit: (data: {
    name: string;
    amount: number;
    account_id: string;
    contact_id: string;
    stage_id: string;
    expected_close: string;
  }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  accounts: Account[];
  contacts: Contact[];
  stages: Stage[];
  leadName: string;
  leadCompany?: string;
  leadEmail: string;
}

export const ConvertLeadForm = ({ 
  onSubmit, 
  onCancel, 
  loading, 
  accounts, 
  contacts, 
  stages,
  leadName,
  leadCompany,
  leadEmail
}: ConvertLeadFormProps) => {
  const [formData, setFormData] = useState({
    name: `${leadName} - Opportunity`,
    amount: "",
    account_id: "",
    contact_id: "",
    stage_id: "23f0e029-5d0f-4a3c-860a-da44d5452ff2", // Default stage
    expected_close: ""
  });

  // Auto-select account if lead has company info
  useEffect(() => {
    if (leadCompany && accounts.length > 0) {
      const matchingAccount = accounts.find(account => 
        account.name.toLowerCase() === leadCompany.toLowerCase()
      );
      if (matchingAccount) {
        setFormData(prev => ({ ...prev, account_id: matchingAccount.id }));
      }
    }
  }, [leadCompany, accounts]);

  // Auto-select contact if lead email matches
  useEffect(() => {
    if (leadEmail && contacts.length > 0) {
      const matchingContact = contacts.find(contact => 
        contact.email.toLowerCase() === leadEmail.toLowerCase()
      );
      if (matchingContact) {
        setFormData(prev => ({ ...prev, contact_id: matchingContact.id }));
      }
    }
  }, [leadEmail, contacts]);

  // Filter contacts based on selected account
  const filteredContacts = useMemo(() => {
    if (!formData.account_id) return contacts;
    return contacts.filter(contact => contact.account_id === formData.account_id);
  }, [contacts, formData.account_id]);

  // Reset contact selection when account changes
  useEffect(() => {
    if (formData.account_id) {
      const hasValidContact = filteredContacts.some(contact => contact.id === formData.contact_id);
      if (!hasValidContact) {
        setFormData(prev => ({ ...prev, contact_id: "" }));
      }
    }
  }, [formData.account_id, filteredContacts, formData.contact_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.account_id || !formData.contact_id || !formData.stage_id || !formData.expected_close) {
      return;
    }

    await onSubmit({
      name: formData.name,
      amount: parseFloat(formData.amount),
      account_id: formData.account_id,
      contact_id: formData.contact_id,
      stage_id: formData.stage_id,
      expected_close: formData.expected_close
    });
  };

  const getAccountDisplayName = (account: Account) => {
    return account.industry ? `${account.name} (${account.industry})` : account.name;
  };

  const getContactDisplayName = (contact: Contact) => {
    const fullName = `${contact.first_name} ${contact.last_name}`.trim();
    return contact.position ? `${fullName} - ${contact.position}` : fullName;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Opportunity Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter opportunity name"
            required
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="account" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Account
          </Label>
          <Select value={formData.account_id} onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {getAccountDisplayName(account)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {accounts.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              No accounts available. Please create an account first.
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Contact
          </Label>
          <Select value={formData.contact_id} onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a contact" />
            </SelectTrigger>
            <SelectContent>
              {filteredContacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {getContactDisplayName(contact)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filteredContacts.length === 0 && formData.account_id && (
            <p className="text-sm text-gray-500 mt-1">
              No contacts available for this account.
            </p>
          )}
          {contacts.length === 0 && !formData.account_id && (
            <p className="text-sm text-gray-500 mt-1">
              No contacts available. Please create a contact first.
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="stage" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Stage
        </Label>
        <Select value={formData.stage_id} onValueChange={(value) => setFormData(prev => ({ ...prev, stage_id: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a stage" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: stage.color }}
                  />
                  {stage.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="expected_close">Expected Close Date</Label>
        <Input
          id="expected_close"
          type="date"
          value={formData.expected_close}
          onChange={(e) => setFormData(prev => ({ ...prev, expected_close: e.target.value }))}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.account_id || !formData.contact_id || !formData.stage_id}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Convert to Opportunity
            </>
          )}
        </Button>
      </div>
    </form>
  );
}; 