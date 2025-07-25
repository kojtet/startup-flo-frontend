import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectTask } from "@/apis/types";
import { 
  Target,
  GripVertical,
  AlertCircle
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { TaskColumn } from './TaskColumn';

// Helper function for priority colors (duplicated from TaskCard for overlay)
const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high": return "bg-red-50 text-red-700 border-red-200";
    case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
    case "low": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

interface TaskBoardProps {
  taskColumns: Array<{
    title: string;
    count: number;
    color: string;
    headerColor: string;
    tasks: ProjectTask[];
    status: string;
  }>;
  updatingTasks: Set<string>;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  activeTask: ProjectTask | null;
  isLoading: boolean;
  userTasks: ProjectTask[];
  searchTerm: string;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  taskColumns,
  updatingTasks,
  onDragStart,
  onDragEnd,
  activeTask,
  isLoading,
  userTasks,
  searchTerm
}) => {
  // Configure sensors for drag and drop with improved responsiveness
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 100,
        tolerance: 5,
      },
    })
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {["To Do", "In Progress", "Review", "Done"].map((title) => (
          <div key={title} className="space-y-3">
            {/* Column Header Skeleton */}
            <div className="p-3 rounded-lg border bg-gray-50 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-5 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
            {/* Task Cards Skeleton */}
            <div className="min-h-80 p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/30 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-white border rounded animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (userTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
        <p className="text-gray-600">
          {searchTerm ? "No tasks found matching your search." : "You don't have any tasks assigned yet. Check back later or contact your project manager."}
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {taskColumns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            count={column.count}
            tasks={column.tasks}
            status={column.status}
            updatingTasks={updatingTasks}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <Card className="cursor-grabbing shadow-2xl border-blue-500 opacity-95 rotate-3 scale-105 bg-white">
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <div className="p-1 bg-blue-100 rounded transition-colors">
                  <GripVertical className="h-3 w-3 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                    {activeTask.title}
                  </h4>
                  {activeTask.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {activeTask.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    {activeTask.priority && (
                      <Badge className={`${getPriorityColor(activeTask.priority)} text-xs`} variant="outline">
                        {activeTask.priority.charAt(0).toUpperCase() + activeTask.priority.slice(1)}
                      </Badge>
                    )}
                    <div className="text-xs text-blue-600 font-mono">
                      #{activeTask.id.slice(0, 6)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}; 