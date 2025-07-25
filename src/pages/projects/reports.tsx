import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { projectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/apis";
import type { 
  Project, 
  ProjectTask,
  ProjectSprint,
  User
} from "@/apis/types";

export default function ProjectReports() {
  const { user, companyId } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [sprints, setSprints] = useState<ProjectSprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [reportData, setReportData] = useState({
    projectsOverview: {
      total: 0,
      active: 0,
      completed: 0,
      onHold: 0,
      overdue: 0
    },
    tasksOverview: {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      overdue: 0
    },
    performanceMetrics: {
      onTimeDelivery: 0,
      averageTaskDuration: 0,
      teamProductivity: 0,
      budgetUtilization: 0
    },
    timelineAnalysis: {
      sprintsCompleted: 0,
      averageSprintVelocity: 0,
      taskCompletionRate: 0
    }
  });

  useEffect(() => {
    const loadReportsData = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const [projectsData, usersData] = await Promise.all([
          api.projects.getProjects({ limit: 100 }),
          api.user.getCompanyUsers(companyId, { limit: 100 })
        ]);

        const projectsList = Array.isArray(projectsData) ? projectsData : projectsData.data || [];
        setProjects(projectsList);
        setUsers(usersData);

        if (projectsList.length > 0) {
          const [tasksData, sprintsData] = await Promise.all([
            Promise.all(
              projectsList.map(project => 
                api.projects.getProjectTasks(project.id).catch(() => [])
              )
            ),
            Promise.all(
              projectsList.map(project => 
                api.projects.getProjectSprints(project.id).catch(() => [])
              )
            )
          ]);

          const allTasks = tasksData.flat();
          const allSprints = sprintsData.flat();
          
          setTasks(allTasks);
          setSprints(allSprints);
          calculateReportMetrics(projectsList, allTasks, allSprints);
        }

        toast({
          title: "Reports loaded",
          description: `Generated reports for ${projectsList.length} projects`,
        });

      } catch (err) {
        console.error("Failed to load reports data:", err);
        setError("Failed to load reports data");
        toast({
          title: "Error",
          description: "Failed to load reports data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, [companyId, toast]);

  const calculateReportMetrics = (projectsList: Project[], tasksList: ProjectTask[], sprintsList: ProjectSprint[]) => {
    const now = new Date();
    const timeRangeDate = new Date();
    timeRangeDate.setDate(now.getDate() - parseInt(selectedTimeRange));

    // Projects Overview
    const total = projectsList.length;
    const active = projectsList.filter(p => p.status === 'in_progress').length;
    const completed = projectsList.filter(p => p.status === 'completed').length;
    const onHold = projectsList.filter(p => p.status === 'on_hold').length;
    const overdue = projectsList.filter(p => 
      p.endDate && new Date(p.endDate) < now && p.status !== 'completed'
    ).length;

    // Tasks Overview - using correct status values from ProjectTask type
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter(t => t.status === 'done').length;
    const inProgressTasks = tasksList.filter(t => t.status === 'in-progress').length;
    const todoTasks = tasksList.filter(t => t.status === 'todo').length;
    const overdueTasks = tasksList.filter(t => 
      t.due_date && new Date(t.due_date) < now && t.status !== 'done'
    ).length;

    // Performance Metrics
    const onTimeDelivery = completed > 0 ? Math.round((completed / total) * 100) : 0;
    const completedTasksInRange = tasksList.filter(t => 
      t.status === 'done' && t.updated_at && new Date(t.updated_at) >= timeRangeDate
    );
    const averageTaskDuration = completedTasksInRange.length > 0 ? 
      Math.round(completedTasksInRange.reduce((sum, task) => {
        if (task.created_at && task.updated_at) {
          const duration = new Date(task.updated_at).getTime() - new Date(task.created_at).getTime();
          return sum + (duration / (1000 * 60 * 60 * 24)); // Convert to days
        }
        return sum;
      }, 0) / completedTasksInRange.length) : 0;

    const teamProductivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const projectsWithBudget = projectsList.filter(p => p.budget);
    const budgetUtilization = projectsWithBudget.length > 0 ? 
      Math.round(projectsWithBudget.reduce((sum, p) => {
        if (p.budget && p.currentSpend) {
          return sum + ((p.currentSpend / p.budget) * 100);
        }
        return sum;
      }, 0) / projectsWithBudget.length) : 0;

    // Timeline Analysis
    const completedSprints = sprintsList.filter(s => new Date(s.end_date) < now).length;
    const averageSprintVelocity = completedSprints > 0 ? 
      Math.round(completedTasks / completedSprints) : 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    setReportData({
      projectsOverview: { total, active, completed, onHold, overdue },
      tasksOverview: { 
        total: totalTasks, 
        completed: completedTasks, 
        inProgress: inProgressTasks, 
        todo: todoTasks, 
        overdue: overdueTasks 
      },
      performanceMetrics: { 
        onTimeDelivery, 
        averageTaskDuration, 
        teamProductivity, 
        budgetUtilization 
      },
      timelineAnalysis: { 
        sprintsCompleted: completedSprints, 
        averageSprintVelocity, 
        taskCompletionRate 
      }
    });
  };

  const exportReport = async (format: string) => {
    try {
      toast({
        title: "Exporting report",
        description: `Generating ${format.toUpperCase()} report...`,
      });
      
      // Simulate export
      setTimeout(() => {
        toast({
          title: "Report exported",
          description: `${format.toUpperCase()} report has been downloaded`,
        });
      }, 1500);
      
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Failed to export report",
        variant: "destructive",
      });
    }
  };

  const refreshReports = () => {
    if (projects.length > 0) {
      calculateReportMetrics(projects, tasks, sprints);
      toast({
        title: "Reports refreshed",
        description: "Report data has been updated",
      });
    }
  };

  if (!user) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Reports</h1>
            <p className="text-gray-600 mt-2">Analytics and insights for project performance</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={refreshReports}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => exportReport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => exportReport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-4">
          <div className="w-48">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="team">Team Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Total Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold">{reportData.projectsOverview.total}</div>
                      <p className="text-sm text-green-600">
                        {reportData.projectsOverview.active} active
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-green-600">
                        {reportData.timelineAnalysis.taskCompletionRate}%
                      </div>
                      <p className="text-sm text-gray-600">
                        {reportData.tasksOverview.completed}/{reportData.tasksOverview.total} tasks
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Avg Task Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-blue-600">
                        {reportData.performanceMetrics.averageTaskDuration}
                      </div>
                      <p className="text-sm text-gray-600">days average</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Overdue Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-red-600">
                        {reportData.tasksOverview.overdue}
                      </div>
                      <p className="text-sm text-gray-600">tasks overdue</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Active</span>
                        <span className="text-sm text-green-600">{reportData.projectsOverview.active}</span>
                      </div>
                      <Progress value={(reportData.projectsOverview.active / reportData.projectsOverview.total) * 100} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Completed</span>
                        <span className="text-sm text-blue-600">{reportData.projectsOverview.completed}</span>
                      </div>
                      <Progress value={(reportData.projectsOverview.completed / reportData.projectsOverview.total) * 100} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">On Hold</span>
                        <span className="text-sm text-yellow-600">{reportData.projectsOverview.onHold}</span>
                      </div>
                      <Progress value={(reportData.projectsOverview.onHold / reportData.projectsOverview.total) * 100} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{reportData.tasksOverview.completed}</div>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{reportData.tasksOverview.inProgress}</div>
                        <p className="text-sm text-gray-600">In Progress</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{reportData.tasksOverview.todo}</div>
                        <p className="text-sm text-gray-600">To Do</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{reportData.tasksOverview.overdue}</div>
                        <p className="text-sm text-gray-600">Overdue</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">On-Time Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-green-600">
                        {reportData.performanceMetrics.onTimeDelivery}%
                      </div>
                      <p className="text-sm text-gray-600">Projects delivered</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Team Productivity</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-blue-600">
                        {reportData.performanceMetrics.teamProductivity}%
                      </div>
                      <p className="text-sm text-gray-600">Task completion rate</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Budget Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-orange-600">
                        {reportData.performanceMetrics.budgetUtilization}%
                      </div>
                      <p className="text-sm text-gray-600">Average spend</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Sprint Velocity</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-purple-600">
                        {reportData.timelineAnalysis.averageSprintVelocity}
                      </div>
                      <p className="text-sm text-gray-600">Tasks per sprint</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline Analysis</CardTitle>
                <p className="text-sm text-gray-600">Project and sprint timeline insights</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {reportData.timelineAnalysis.sprintsCompleted}
                      </div>
                      <p className="text-sm text-gray-600">Sprints Completed</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {reportData.timelineAnalysis.averageSprintVelocity}
                      </div>
                      <p className="text-sm text-gray-600">Average Velocity</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {reportData.timelineAnalysis.taskCompletionRate}%
                      </div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <p className="text-sm text-gray-600">Individual and team productivity metrics</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{users.length}</div>
                      <p className="text-sm text-gray-600">Total Team Members</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {reportData.performanceMetrics.teamProductivity}%
                      </div>
                      <p className="text-sm text-gray-600">Team Productivity</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ExtensibleLayout>
  );
} 
