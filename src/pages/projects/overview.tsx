import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { getProjectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Plus,
  Filter,
  Eye,
  Edit,
  Users,
  Briefcase,
  ListChecks,
  CalendarDays,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Activity,
  Search,
  Loader2,
  FileText,
  Download
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

export default function ProjectsOverview() {
  const { user, companyId } = useAuth();
  const { toast } = useToast();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("30");

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [sprints, setSprints] = useState<ProjectSprint[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [overview, setOverview] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalBudget: 0,
    spentBudget: 0,
    averageProgress: 0,
    onTimeDelivery: 0
  });

  // Load all data on component mount
  useEffect(() => {
    const loadOverviewData = async () => {
      if (!companyId) return;

      setLoading(true);
      setError(null);

      try {
        // Parallel API calls for optimal performance
        const [
          projectsData,
          usersData
        ] = await Promise.all([
          api.projects.getProjects({ limit: 100 }),
          api.user.getCompanyUsers(companyId, { limit: 100 })
        ]);

        console.log("📊 Overview data loaded:", { 
          projectsCount: Array.isArray(projectsData) ? projectsData.length : projectsData.data?.length || 0,
          usersCount: usersData.length 
        });

        const projectsList = Array.isArray(projectsData) ? projectsData : projectsData.data || [];
        setProjects(projectsList);
        setTeamMembers(usersData);

        // Load tasks and sprints for active projects
        if (projectsList.length > 0) {
          const activeProjects = projectsList.filter(p => p.status === 'in_progress');
          
          const [tasksData, sprintsData] = await Promise.all([
            // Get tasks for first few active projects to avoid overwhelming
            Promise.all(
              activeProjects.slice(0, 5).map(project => 
                api.projects.getProjectTasks(project.id).catch(() => [])
              )
            ),
            // Get sprints for active projects
            Promise.all(
              activeProjects.slice(0, 5).map(project => 
                api.projects.getProjectSprints(project.id).catch(() => [])
              )
            )
          ]);

          const allTasks = tasksData.flat();
          const allSprints = sprintsData.flat();
          
          setTasks(allTasks);
          setSprints(allSprints);
        }

        // Calculate overview metrics
        calculateOverviewMetrics(projectsList);

        toast({
          title: "Overview loaded",
          description: `Found ${projectsList.length} projects and ${usersData.length} team members`,
        });

      } catch (err) {
        console.error("Failed to load overview data:", err);
        setError("Failed to load overview data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load overview data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, [companyId, toast]);

  const isValidDate = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const calculateOverviewMetrics = (projectsList: Project[]) => {
    const totalProjects = projectsList.length;
    const activeProjects = projectsList.filter(p => p.status === 'in_progress').length;
    const completedProjects = projectsList.filter(p => p.status === 'completed').length;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => 
      isValidDate(t.due_date) && new Date(t.due_date!) < new Date() && t.status !== 'done'
    ).length;

    const projectsWithBudget = projectsList.filter(p => p.budget);
    const totalBudget = projectsWithBudget.reduce((sum, p) => sum + (p.budget || 0), 0);
    const spentBudget = projectsWithBudget.reduce((sum, p) => sum + (p.currentSpend || 0), 0);

    const projectsWithProgress = projectsList.filter(p => p.progress !== undefined);
    const averageProgress = projectsWithProgress.length > 0 
      ? projectsWithProgress.reduce((sum, p) => sum + (p.progress || 0), 0) / projectsWithProgress.length
      : 0;

    const onTimeDelivery = completedProjects > 0 ? 
      (completedProjects / totalProjects) * 100 : 0;

    setOverview({
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalBudget,
      spentBudget,
      averageProgress,
      onTimeDelivery
    });
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "on_hold": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "not_started": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user) {
    return (
      <ExtensibleLayout moduleSidebar={getProjectsSidebarSections()} moduleTitle="Project Management" user={null}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ExtensibleLayout>
    );
  }

  // Transform user object to match ExtensibleLayout expectations
  const transformedUser = {
    name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'User',
    email: user.email || '',
    role: user.role || user.job_title || 'Member',
    avatarUrl: user.avatar_url,
    companyId: user.company_id
  };

  return (
    <ExtensibleLayout moduleSidebar={getProjectsSidebarSections()} moduleTitle="Project Management" user={transformedUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Overview</h1>
            <p className="text-gray-600 mt-2">Comprehensive view of all projects and key metrics</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center text-red-800">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Briefcase className="h-4 w-4 mr-2" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{overview.totalProjects}</div>
                  <p className="text-sm text-green-600">
                    {overview.activeProjects} active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <ListChecks className="h-4 w-4 mr-2" />
                Tasks Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    {overview.totalTasks > 0 ? Math.round((overview.completedTasks / overview.totalTasks) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {overview.completedTasks}/{overview.totalTasks} completed
                  </p>
                  {overview.overdueTasks > 0 && (
                    <p className="text-sm text-red-600">
                      {overview.overdueTasks} overdue
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{formatCurrency(overview.totalBudget)}</div>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(overview.spentBudget)} spent ({overview.totalBudget > 0 ? Math.round((overview.spentBudget / overview.totalBudget) * 100) : 0}%)
                  </p>
                  <Progress 
                    value={overview.totalBudget > 0 ? (overview.spentBudget / overview.totalBudget) * 100 : 0} 
                    className="mt-2 h-2" 
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Avg Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{Math.round(overview.averageProgress)}%</div>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {Math.round(overview.onTimeDelivery)}% on time
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Recent Tasks</TabsTrigger>
            <TabsTrigger value="sprints">Active Sprints</TabsTrigger>
            <TabsTrigger value="team">Team Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-600">Get started by creating your first project.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">{project.name}</h3>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                              {project.priority && (
                                <Badge className={getPriorityColor(project.priority)}>
                                  {project.priority}
                                </Badge>
                              )}
                            </div>
                            {project.description && (
                              <p className="text-gray-600 mb-3">{project.description}</p>
                            )}
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              {(project.end_date || project.endDate) && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Due: {formatDate(project.end_date || project.endDate)}
                                </div>
                              )}
                              {project.budget && (
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Budget: {formatCurrency(project.budget)}
                                </div>
                              )}
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Team: {project.team_ids?.length || 0} members
                              </div>
                            </div>
                            {project.progress !== undefined && (
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2" />
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <ListChecks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600">Tasks will appear here once projects are created.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 10).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              task.status === 'done' ? 'bg-green-500' :
                              task.status === 'in-progress' ? 'bg-blue-500' :
                              'bg-gray-300'
                            }`} />
                            <h4 className="font-medium">{task.title}</h4>
                            {task.priority && (
                              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            )}
                          </div>
                          {task.due_date && (
                            <p className="text-sm text-gray-500 mt-1 ml-6">
                              Due: {formatDate(task.due_date)}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sprints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Sprints</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : sprints.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active sprints</h3>
                    <p className="text-gray-600">Create sprints to organize your project work.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sprints.map((sprint) => (
                      <div key={sprint.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{sprint.name}</h4>
                            {sprint.goal && (
                              <p className="text-sm text-gray-600 mt-1">{sprint.goal}</p>
                            )}
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
                    <p className="text-gray-600">Add team members to start collaborating.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.slice(0, 9).map((member) => (
                      <div key={member.id} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {member.first_name?.[0]}{member.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {member.first_name} {member.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{member.job_title || member.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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
