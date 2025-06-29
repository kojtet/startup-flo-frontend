import { 
  LayoutList, // For Overview (List) / Gantt (could also use BarChartHorizontal for Gantt)
  FolderKanban, // For Projects
  ClipboardCheck, // For My Tasks (Kanban)
  IterationCcw, // For Sprints & Backlog
  Award, // For Deliverables / Milestones
  Users, // For Team Roles & Workload
  TrendingUp // For Reports & Velocity
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

interface ProjectsSidebarOptions {
  pendingTasksCount?: number;
}

export const getProjectsSidebarSections = (options: ProjectsSidebarOptions = {}): SidebarSection[] => {
  const { pendingTasksCount } = options;
  
  return [
    {
      title: "Project Views",
      items: [
        { label: "Overview", href: "/projects/overview", icon: LayoutList },
        { label: "Projects", href: "/projects/projects", icon: FolderKanban },
        { 
          label: "My Tasks", 
          href: "/projects/my-tasks", 
          icon: ClipboardCheck, 
          badge: pendingTasksCount !== undefined && pendingTasksCount > 0 ? pendingTasksCount.toString() : undefined,
          hasNotification: pendingTasksCount !== undefined && pendingTasksCount > 0
        },
        { label: "Sprints & Backlog", href: "/projects/sprints", icon: IterationCcw },
        { label: "Deliverables", href: "/projects/deliverables", icon: Award },
      ],
    },
    {
      title: "Team & Performance",
      items: [
        { label: "Team Roles & Workload", href: "/projects/team", icon: Users },
        { label: "Reports & Velocity", href: "/projects/reports", icon: TrendingUp },
      ],
    },
  ];
};

// Keep the old export for backward compatibility until all pages are updated
export const projectsSidebarSections = getProjectsSidebarSections();
