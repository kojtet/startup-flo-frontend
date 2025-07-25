import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Lead, CreateLeadData, Category } from "@/apis/types";

interface LeadFormProps {
  formData: CreateLeadData;
  setFormData: React.Dispatch<React.SetStateAction<CreateLeadData>>;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
  formLoading: boolean;
  onCancel: () => void;
  categories?: Category[];
}

export const LeadForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  isEdit = false, 
  formLoading, 
  onCancel,
  categories = []
}: LeadFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
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
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          value={formData.company || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
          placeholder="Enter company name"
        />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter job title"
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="source">Source</Label>
        <Select value={formData.source || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category_id || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Lead['status'] }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="proposal">Proposal</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
        {isEdit ? "Update Lead" : "Create Lead"}
      </Button>
    </div>
  </form>
); 