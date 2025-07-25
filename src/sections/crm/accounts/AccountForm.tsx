import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Account, CreateAccountData } from "@/apis/types";

interface AccountFormProps {
  formData: CreateAccountData;
  setFormData: React.Dispatch<React.SetStateAction<CreateAccountData>>;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
  formLoading: boolean;
  onCancel: () => void;
}

export const AccountForm = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  isEdit = false, 
  formLoading, 
  onCancel
}: AccountFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <Label htmlFor="name">Account Name *</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
        placeholder="e.g., Acme Corporation"
      />
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          value={formData.industry || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
          placeholder="e.g., Technology, Healthcare"
        />
      </div>
      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://example.com"
        />
      </div>
    </div>

    <div>
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={formData.notes || ""}
        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        placeholder="Additional notes about this account..."
        rows={3}
      />
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
        {isEdit ? "Update Account" : "Create Account"}
      </Button>
    </div>
  </form>
); 