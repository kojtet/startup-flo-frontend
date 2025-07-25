import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  job_title?: string;
}

interface Project {
  id: string;
  name: string;
}

interface MilestoneModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: Project | null;
  formData: {
    name: string;
    description: string;
    expected_date: string;
    priority: string;
    status: string;
    owner_id: string;
    progress: number;
    requirements: string;
  };
  onFormDataChange: (data: any) => void;
  users: User[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function MilestoneModal({
  isOpen,
  onOpenChange,
  selectedProject,
  formData,
  onFormDataChange,
  users,
  isSubmitting,
  onSubmit
}: MilestoneModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Add Milestone to "{selectedProject?.name}"
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-name">Milestone Name *</Label>
              <Input
                id="milestone-name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="Enter milestone name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => onFormDataChange({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-description">Description</Label>
            <Textarea
              id="milestone-description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Enter milestone description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => onFormDataChange({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-expected-date">Expected Date *</Label>
              <Input
                id="milestone-expected-date"
                type="date"
                value={formData.expected_date}
                onChange={(e) => onFormDataChange({ ...formData, expected_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-owner">Assign To</Label>
              <Select 
                value={formData.owner_id || undefined} 
                onValueChange={(value) => onFormDataChange({ ...formData, owner_id: value || '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} - {user.job_title || 'No title'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-progress">Progress (%)</Label>
              <Input
                id="milestone-progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => onFormDataChange({ ...formData, progress: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-requirements">Requirements</Label>
            <Textarea
              id="milestone-requirements"
              value={formData.requirements}
              onChange={(e) => onFormDataChange({ ...formData, requirements: e.target.value })}
              placeholder="Enter milestone requirements and specifications"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Milestone'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 