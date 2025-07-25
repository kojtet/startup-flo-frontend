import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

interface SprintModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: Project | null;
  formData: {
    name: string;
    goal: string;
    start_date: string;
    end_date: string;
    status: string;
    capacity: number;
  };
  onFormDataChange: (data: any) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function SprintModal({
  isOpen,
  onOpenChange,
  selectedProject,
  formData,
  onFormDataChange,
  isSubmitting,
  onSubmit
}: SprintModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Add Sprint to "{selectedProject?.name}"
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sprint-name">Sprint Name *</Label>
              <Input
                id="sprint-name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="Enter sprint name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprint-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => onFormDataChange({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint-goal">Sprint Goal</Label>
            <Textarea
              id="sprint-goal"
              value={formData.goal}
              onChange={(e) => onFormDataChange({ ...formData, goal: e.target.value })}
              placeholder="What is the goal of this sprint?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sprint-start-date">Start Date *</Label>
              <Input
                id="sprint-start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => onFormDataChange({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprint-end-date">End Date *</Label>
              <Input
                id="sprint-end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => onFormDataChange({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sprint-capacity">Sprint Capacity (hours)</Label>
            <Input
              id="sprint-capacity"
              type="number"
              min="1"
              max="200"
              value={formData.capacity}
              onChange={(e) => onFormDataChange({ ...formData, capacity: parseInt(e.target.value) || 40 })}
              placeholder="Total hours available for this sprint"
            />
            <p className="text-sm text-gray-500">
              Estimate total hours available for this sprint (default: 40 hours)
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
                  Creating...
                </>
              ) : (
                'Create Sprint'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 