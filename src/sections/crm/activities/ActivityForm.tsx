import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import React from "react";

// Types for props
import type { Activity, CreateActivityData } from "@/apis/types";

type ActivityFormProps = {
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
  activityFormData: CreateActivityData;
  setActivityFormData: React.Dispatch<React.SetStateAction<CreateActivityData>>;
  activityFormLoading: boolean;
  setActivityFormLoading: React.Dispatch<React.SetStateAction<boolean>>;
  leads: any[];
  contacts: any[];
  accounts: any[];
  opportunities: any[];
  handleEditDialogOpen: (open: boolean) => void;
  setEditingActivity: React.Dispatch<React.SetStateAction<Activity | null>>;
  editingActivity: Activity | null;
  toast: any;
  fetchActivities: any;
  createActivity: any;
  updateActivity: any;
  deleteActivity: any;
  markActivityAsCompleted: any;
  openEditActivityDialog: (activity: Activity) => void;
  getActivityIcon: (type: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  getContactName: (contactId: string) => string;
  getOpportunityName: (opportunityId: string) => string;
  getLeadName: (leadId: string) => string;
  getAccountName: (accountId: string) => string;
};

export const ActivityForm: React.FC<ActivityFormProps> = ({
  onSubmit,
  isEdit = false,
  activityFormData,
  setActivityFormData,
  activityFormLoading,
  leads,
  contacts,
  accounts,
  opportunities,
  handleEditDialogOpen,
}) => {
  // Filter contacts, leads, and opportunities by selected account
  const filteredContacts = activityFormData.account_id
    ? contacts.filter(contact => contact.account_id === activityFormData.account_id)
    : contacts;
  const filteredLeads = activityFormData.account_id
    ? leads.filter(lead => lead.account_id === activityFormData.account_id)
    : leads;
  const filteredOpportunities = activityFormData.account_id
    ? opportunities.filter(opportunity => opportunity.account_id === activityFormData.account_id)
    : opportunities;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Activity Type *</Label>
          <Select 
            value={activityFormData.type} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, type: value as "call" | "email" | "meeting" | "task" }))}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="task">Task</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={activityFormData.priority} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, priority: value as "low" | "medium" | "high" }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={activityFormData.title}
          onChange={(e) => setActivityFormData(prev => ({ ...prev, title: e.target.value }))}
          required
          placeholder="e.g., Follow-up call with client"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={activityFormData.description}
          onChange={(e) => setActivityFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Activity details..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="due_date">Date *</Label>
          <Input
            id="due_date"
            type="date"
            value={activityFormData.due_date}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, due_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={activityFormData.location}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="e.g., Conference Room A"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={activityFormData.start_time}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, start_time: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={activityFormData.end_time}
            onChange={(e) => setActivityFormData(prev => ({ ...prev, end_time: e.target.value }))}
          />
        </div>
      </div>

      {/* Move Related Account above Related Contact and Related Lead */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="account_id">Related Account</Label>
          <Select 
            value={activityFormData.account_id || "none"} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, account_id: value === "none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Account</SelectItem>
              {accounts.map(account => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="lead_id">Related Lead</Label>
          <Select 
            value={activityFormData.lead_id || "none"} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, lead_id: value === "none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lead" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Lead</SelectItem>
              {filteredLeads.map(lead => (
                <SelectItem key={lead.id} value={lead.id}>
                  {lead.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_id">Related Contact</Label>
          <Select 
            value={activityFormData.contact_id || "none"} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, contact_id: value === "none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Contact</SelectItem>
              {filteredContacts.map(contact => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="opportunity_id">Related Opportunity</Label>
          <Select 
            value={activityFormData.opportunity_id || "none"} 
            onValueChange={(value) => setActivityFormData(prev => ({ ...prev, opportunity_id: value === "none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select opportunity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Opportunity</SelectItem>
              {filteredOpportunities.map(opportunity => (
                <SelectItem key={opportunity.id} value={opportunity.id}>
                  {opportunity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              handleEditDialogOpen(false);
            } else {
              handleEditDialogOpen(false); // For create, close dialog
            }
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={activityFormLoading}>
          {activityFormLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit ? "Update Activity" : "Create Activity"}
        </Button>
      </div>
    </form>
  );
}; 