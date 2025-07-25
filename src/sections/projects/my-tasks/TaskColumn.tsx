import { Badge } from "@/components/ui/badge";
import { ProjectTask } from "@/apis/types";
import { Target } from "lucide-react";
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  title: string;
  count: number;
  tasks: ProjectTask[];
  status: string;
  updatingTasks: Set<string>;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ 
  title, 
  count, 
  tasks, 
  status, 
  updatingTasks 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="space-y-3">
      {/* Column Header */}
      <div className={`p-3 rounded-lg border transition-all duration-300 ${
        isOver ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <h3 className={`font-medium text-sm transition-colors duration-300 ${
            isOver ? 'text-blue-700' : 'text-gray-700'
          }`}>{title}</h3>
          <Badge 
            variant="secondary" 
            className={`text-xs transition-all duration-300 ${
              isOver ? 'bg-blue-100 text-blue-700' : ''
            }`}
          >
            {count}
          </Badge>
        </div>
      </div>

      {/* Tasks Container */}
      <div 
        ref={setNodeRef}
        className={`min-h-80 p-3 rounded-lg border border-dashed border-gray-200 space-y-2 transition-all duration-300 ${
          isOver ? 'border-blue-400 bg-blue-50 shadow-inner scale-105' : 'bg-gray-50/30'
        }`}
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className={`mb-2 transition-colors duration-300 ${
                isOver ? 'text-blue-500' : 'text-gray-400'
              }`}>
                <Target className="h-6 w-6 mx-auto" />
              </div>
              <p className={`text-xs transition-colors duration-300 ${
                isOver ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {isOver ? 'Drop task here' : 'No tasks'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="transition-all duration-300">
                  <TaskCard 
                    task={task} 
                    isUpdating={updatingTasks.has(task.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}; 