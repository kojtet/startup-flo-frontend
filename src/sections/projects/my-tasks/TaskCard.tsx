import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectTask } from "@/apis/types";
import { 
  Calendar,
  AlertCircle,
  GripVertical
} from "lucide-react";
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

// Helper function for priority colors
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high": return "bg-red-50 text-red-700 border-red-200";
    case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
    case "low": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

interface TaskCardProps {
  task: ProjectTask;
  isUpdating?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isUpdating = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-all duration-300 group ${
        isDragging ? 'shadow-lg border-blue-500 scale-105' : ''
      } ${isUpdating ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-3 relative">
        {isUpdating && (
          <div className="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1">
              <div 
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors mt-0.5"
              >
                <GripVertical className="h-3 w-3 text-gray-400" />
              </div>
              <h4 className="font-medium text-sm text-gray-900 flex-1 leading-tight">
                {task.title}
              </h4>
            </div>
            {task.priority && (
              <Badge className={`${getPriorityColor(task.priority)} text-xs`} variant="outline">
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            )}
          </div>

          {task.description && (
            <div className="text-xs text-gray-500 line-clamp-2 ml-6">
              {task.description}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 ml-6">
            <div className={`flex items-center text-xs ${
              isOverdue(task.due_date) ? 'text-red-600' : 'text-gray-500'
            }`}>
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(task.due_date)}
              {isOverdue(task.due_date) && (
                <AlertCircle className="h-3 w-3 ml-1 text-red-500" />
              )}
            </div>
            <div className="text-xs text-gray-400 font-mono">
              #{task.id.slice(0, 6)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 