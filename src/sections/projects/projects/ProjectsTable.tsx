import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Target,
  Calendar,
  Users,
  Eye,
  Edit3,
  Trash2,
  ListTodo,
  Milestone,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress?: number;
  budget?: number;
  team_lead?: string;
  expected_end?: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
}

interface ProjectsTableProps {
  projects: Project[];
  users: User[];
  onAddTasks: (project: Project) => void;
  onAddMilestones: (project: Project) => void;
  onAddSprints: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string, projectName: string) => void;
  onViewProject: (projectId: string) => void;
  getStatusColor: (status: string) => string;
}

export function ProjectsTable({
  projects,
  users,
  onAddTasks,
  onAddMilestones,
  onAddSprints,
  onEditProject,
  onDeleteProject,
  onViewProject,
  getStatusColor
}: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          No projects found. Create your first project!
        </p>
      </div>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Team Lead</TableHead>
            <TableHead>Team Size</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="w-full max-w-24">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-xs">{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {(() => {
                    const teamLead = users.find(u => u.id === project.team_lead);
                    return teamLead ? `${teamLead.first_name} ${teamLead.last_name}` : 'Not assigned';
                  })()}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-gray-400" />
                  <span>1</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  {project.expected_end ? new Date(project.expected_end).toLocaleDateString() : 'No date set'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    0 total
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    0 done
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAddTasks(project)}>
                      <ListTodo className="h-4 w-4 mr-2" /> Add Tasks
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddMilestones(project)}>
                      <Milestone className="h-4 w-4 mr-2" /> Add Milestones
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddSprints(project)}>
                      <Zap className="h-4 w-4 mr-2" /> Add Sprints
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewProject(project.id)}>
                      <Eye className="h-4 w-4 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditProject(project)}>
                      <Edit3 className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteProject(project.id, project.name)} className="text-red-500 focus:text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 