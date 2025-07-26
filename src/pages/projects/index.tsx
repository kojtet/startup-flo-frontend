import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { projectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, ClipboardList, Target, Users2, Loader2, AlertTriangle } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo } from "react";

export default function ProjectsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    projects,
    isLoadingProjects,
    projectsError,
    fetchProjects,
    projectTasks,
    isLoadingTasks,
    tasksError,
    fetchProjectTasks,
    projectDeliverables,
    isLoadingDeliverables,
    deliverablesError,
    fetchProjectDeliverables,
  } = useProjects();

  // Fetch all data on mount
  useEffect(() => {
    if (user?.company_id) {
      fetchProjects();
      fetchProjectTasks();
      fetchProjectDeliverables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.company_id]);

  // Compute dashboard stats
  const activeProjects = useMemo(() => projects.filter(p => p.status === "active").length, [projects]);
  const myTasks = useMemo(() => user ? projectTasks.filter(t => t.owner_id === user.id).length : 0, [projectTasks, user]);
  const myTasksDueThisWeek = useMemo(() => {
    if (!user) return 0;
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return projectTasks.filter(t => t.owner_id === user.id && t.due_date && new Date(t.due_date) <= weekFromNow && new Date(t.due_date) >= now).length;
  }, [projectTasks, user]);
  const deliverables = useMemo(() => projectDeliverables.length, [projectDeliverables]);
  const overdueDeliverables = useMemo(() => {
    const now = new Date();
    return projectDeliverables.filter(d => d.status !== "completed" && new Date(d.expected_date) < now).length;
  }, [projectDeliverables]);
  const teamMembers = useMemo(() => {
    // Unique team_lead from projects + unique owners from tasks
    const leads = projects.map(p => p.team_lead).filter(Boolean);
    const owners = projectTasks.map(t => t.owner_id).filter(Boolean);
    return new Set([...leads, ...owners]).size;
  }, [projects, projectTasks]);

  // Recent projects (last 3 by created_at)
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  }, [projects]);

  // Upcoming deadlines (next 3 deliverables/tasks by due/expected date)
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const deliverableDeadlines = projectDeliverables
      .filter(d => d.status !== "completed" && new Date(d.expected_date) >= now)
      .map(d => ({
        type: "Deliverable",
        name: d.name,
        date: d.expected_date,
        projectId: d.project_id,
      }));
    const taskDeadlines = projectTasks
      .filter(t => t.status !== "done" && t.due_date && new Date(t.due_date) >= now)
      .map(t => ({
        type: "Task",
        name: t.title,
        date: t.due_date!,
        projectId: t.project_id,
      }));
    return [...deliverableDeadlines, ...taskDeadlines]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [projectDeliverables, projectTasks]);

  // Loading and error states
  const isLoading = authLoading || isLoadingProjects || isLoadingTasks || isLoadingDeliverables;
  const error = projectsError || tasksError || deliverablesError;

  if (isLoading) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  if (error) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button className="btn" onClick={() => {
              if (user?.company_id) {
                fetchProjects();
                fetchProjectTasks();
                fetchProjectDeliverables();
              }
            }}>
              Try Again
            </button>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Dashboard</h1>
          <p className="text-gray-600 mt-2">Track and manage your projects and tasks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">{activeProjects === 1 ? "1 active" : `${activeProjects} active`}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myTasks}</div>
              <p className="text-xs text-muted-foreground">{myTasksDueThisWeek} due this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deliverables</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliverables}</div>
              <p className="text-xs text-muted-foreground">{overdueDeliverables} overdue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers}</div>
              <p className="text-xs text-muted-foreground">Across all projects</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length === 0 && <p className="text-gray-500">No recent projects.</p>}
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.description}</p>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress ?? 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.length === 0 && <p className="text-gray-500">No upcoming deadlines.</p>}
                {upcomingDeadlines.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${item.type === "Deliverable" ? "bg-red-500" : "bg-yellow-500"}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()} • {item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ExtensibleLayout>
  );
}
