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
  description: string;
  status: string;
  start_date?: string;
  expected_end?: string;
  team_lead?: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: Project | null;
  formData: {
    name: string;
    description: string;
    start_date: string;
    expected_end: string;
    team_lead: string;
    status: string;
  };
  onFormDataChange: (data: any) => void;
  users: User[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function EditProjectModal({
  isOpen,
  onOpenChange,
  selectedProject,
  formData,
  onFormDataChange,
  users,
  isSubmitting,
  onSubmit
}: EditProjectModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit Project "{selectedProject?.name}"
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Project Name *</Label>
              <Input
                id="edit-project-name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: string) => onFormDataChange({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-project-description">Description *</Label>
            <Textarea
              id="edit-project-description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Enter project description"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-start-date">Start Date *</Label>
              <Input
                id="edit-project-start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => onFormDataChange({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-expected-end">Expected End Date *</Label>
              <Input
                id="edit-project-expected-end"
                type="date"
                value={formData.expected_end}
                onChange={(e) => onFormDataChange({ ...formData, expected_end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-project-team-lead">Team Lead</Label>
            <Select 
              value={formData.team_lead || undefined} 
              onValueChange={(value) => onFormDataChange({ ...formData, team_lead: value || '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team lead" />
              </SelectTrigger>
              <SelectContent>
                {users.length > 0 ? (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} - {user.job_title || 'No title'}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-users" disabled>No users available</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {users.length > 0 
                ? `${users.length} user(s) available` 
                : 'Loading users...'
              }
            </p>
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
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 