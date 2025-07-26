import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { projectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Play,
  Pause,
  Calendar,
  Clock,
  Flag,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Archive,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProjectsService } from "@/apis/services/projects.service";
import { UserService } from "@/apis/services/user.service";
import { apiClient } from "@/apis/core/client";
import type { 
  Project, 
  ProjectSprint, 
  ProjectTask,
  CreateProjectSprintData,
  UpdateProjectSprintData,
  User
} from "@/apis/types";

export default function SprintsBacklog() {
  const { user, isHydrated } = useAuth();
  const { toast } = useToast();

  const projectsService = new ProjectsService(apiClient);
  const userService = new UserService(apiClient);

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [isEditSprintOpen, setIsEditSprintOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<ProjectSprint | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<ProjectSprint[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<ProjectTask[]>([]);
  const [activeSprints, setActiveSprints] = useState<ProjectSprint[]>([]);
  const [completedSprints, setCompletedSprints] = useState<ProjectSprint[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Form state
  const [sprintForm, setSprintForm] = useState<Partial<CreateProjectSprintData>>({
    project_id: '',
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    capacity: 40
  });

  // Load data on component mount
  useEffect(() => {
    if (!isHydrated) return;
    if (!user?.company_id) return;
    if (!apiClient.getAuthToken()) return;

    const loadSprintsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Parallel API calls for optimal performance
        const [
          projectsData,
          usersData
        ] = await Promise.all([
          projectsService.getProjects({ limit: 100 }),
          userService.getCompanyUsers(user.company_id, { limit: 100 })
        ]);

        console.log("🏃‍♂️ Sprints data loaded:", { 
          projectsCount: Array.isArray(projectsData) ? projectsData.length : projectsData.data?.length || 0,
          usersCount: usersData.length 
        });

        const projectsList = Array.isArray(projectsData) ? projectsData : projectsData.data || [];
        setProjects(projectsList);
        setUsers(usersData);

        // Load sprints and tasks for active projects
        if (projectsList.length > 0) {
          const activeProjects = projectsList.filter(p => p.status === 'in_progress');
          const [sprintsData, tasksData] = await Promise.all([
            Promise.all(
              activeProjects.map(project => 
                projectsService.getProjectSprints(project.id).catch(() => [])
              )
            ),
            Promise.all(
              activeProjects.map(project => 
                projectsService.getProjectTasks(project.id).then(r => r.data || []).catch(() => [])
              )
            )
          ]);
          const allSprints = sprintsData.flat();
          const allTasks = tasksData.flat();
          setSprints(allSprints);
          // Categorize sprints
          const now = new Date();
          const active = allSprints.filter(sprint => 
            new Date(sprint.start_date) <= now && new Date(sprint.end_date) >= now
          );
          const completed = allSprints.filter(sprint => new Date(sprint.end_date) < now);
          setActiveSprints(active);
          setCompletedSprints(completed);
          // Get backlog tasks (tasks not assigned to any sprint)
          const backlog = allTasks.filter(task => !task.sprint_id);
          setBacklogTasks(backlog);
        }
        toast({
          title: "Sprints loaded",
          description: `Found ${projectsList.length} projects with sprint data`,
        });
      } catch (err) {
        console.error("Failed to load sprints data:", err);
        setError("Failed to load sprints data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load sprints data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadSprintsData();
  }, [isHydrated, user?.company_id, apiClient.getAuthToken(), toast]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintForm.project_id || !sprintForm.name) return;

    setSubmitting(true);
    try {
      const newSprint = await projectsService.createSprint({
        project_id: sprintForm.project_id!, // required
        name: sprintForm.name!, // required
        goal: sprintForm.goal || '',
        start_date: sprintForm.start_date!,
        end_date: sprintForm.end_date!,
        status: 'planning',
        capacity: 40
      });

      setSprints([...sprints, newSprint]);
      
      // Check if it's active
      const now = new Date();
      if (new Date(newSprint.start_date) <= now && new Date(newSprint.end_date) >= now) {
        setActiveSprints([...activeSprints, newSprint]);
      }

      setIsCreateSprintOpen(false);
      resetSprintForm();

      toast({
        title: "Sprint created",
        description: `${newSprint.name} has been created successfully`,
      });

    } catch (err) {
      console.error("Failed to create sprint:", err);
      toast({
        title: "Error",
        description: "Failed to create sprint",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint || !sprintForm.name) return;

    setSubmitting(true);
    try {
      const updateData: UpdateProjectSprintData = {
        name: sprintForm.name!,
        goal: sprintForm.goal,
        start_date: sprintForm.start_date!,
        end_date: sprintForm.end_date!,
        status: selectedSprint.status,
        capacity: selectedSprint.capacity
      };
      const updatedSprint = await projectsService.updateSprint(selectedSprint.id, updateData);

      setSprints(sprints.map(s => s.id === selectedSprint.id ? updatedSprint : s));
      
      // Update categorized sprints
      const now = new Date();
      if (new Date(updatedSprint.start_date) <= now && new Date(updatedSprint.end_date) >= now) {
        setActiveSprints(activeSprints.map(s => s.id === selectedSprint.id ? updatedSprint : s));
      }

      setIsEditSprintOpen(false);
      setSelectedSprint(null);
      resetSprintForm();

      toast({
        title: "Sprint updated",
        description: `${updatedSprint.name} has been updated successfully`,
      });

    } catch (err) {
      console.error("Failed to update sprint:", err);
      toast({
        title: "Error",
        description: "Failed to update sprint",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm("Are you sure you want to delete this sprint?")) return;

    try {
      await projectsService.deleteSprint(sprintId);
      
      setSprints(sprints.filter(s => s.id !== sprintId));
      setActiveSprints(activeSprints.filter(s => s.id !== sprintId));
      setCompletedSprints(completedSprints.filter(s => s.id !== sprintId));

      toast({
        title: "Sprint deleted",
        description: "Sprint has been deleted successfully",
      });

    } catch (err) {
      console.error("Failed to delete sprint:", err);
      toast({
        title: "Error",
        description: "Failed to delete sprint",
        variant: "destructive",
      });
    }
  };

  const openEditSprint = (sprint: ProjectSprint) => {
    setSelectedSprint(sprint);
    setSprintForm({
      project_id: sprint.project_id,
      name: sprint.name,
      goal: sprint.goal || '',
      start_date: sprint.start_date ? sprint.start_date.split('T')[0] : '', // Format for date input with null check
      end_date: sprint.end_date ? sprint.end_date.split('T')[0] : '', // Format for date input with null check
      status: sprint.status,
      capacity: sprint.capacity
    });
    setIsEditSprintOpen(true);
  };

  const resetSprintForm = () => {
    setSprintForm({
      project_id: '',
      name: '',
      goal: '',
      start_date: '',
      end_date: '',
      status: 'planning',
      capacity: 40
    });
  };

  const filteredSprints = sprints.filter(sprint =>
    sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sprint.goal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBacklog = backlogTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "todo": return "bg-gray-100 text-gray-800";
      case "backlog": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Epic": return "bg-purple-100 text-purple-800";
      case "Story": return "bg-blue-100 text-blue-800";
      case "Task": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isSprintActive = (sprint: ProjectSprint) => {
    const now = new Date();
    return new Date(sprint.start_date) <= now && new Date(sprint.end_date) >= now;
  };

  const getSprintProgress = (sprint: ProjectSprint) => {
    const now = new Date();
    const start = new Date(sprint.start_date);
    const end = new Date(sprint.end_date);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
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
            <h1 className="text-3xl font-bold text-gray-900">Sprints & Backlog</h1>
            <p className="text-gray-600 mt-2">Manage agile sprints and product backlog</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Dialog open={isCreateSprintOpen} onOpenChange={setIsCreateSprintOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Sprint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Sprint</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSprint} className="space-y-4">
                  <div>
                    <Label htmlFor="project">Project *</Label>
                    <Select 
                      value={sprintForm.project_id} 
                      onValueChange={(value) => setSprintForm({...sprintForm, project_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Sprint Name *</Label>
                    <Input
                      id="name"
                      value={sprintForm.name}
                      onChange={(e) => setSprintForm({...sprintForm, name: e.target.value})}
                      placeholder="e.g., Sprint 1, Q1 Sprint"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal">Sprint Goal</Label>
                    <Textarea
                      id="goal"
                      value={sprintForm.goal}
                      onChange={(e) => setSprintForm({...sprintForm, goal: e.target.value})}
                      placeholder="What do you want to achieve in this sprint?"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={sprintForm.start_date}
                        onChange={(e) => setSprintForm({...sprintForm, start_date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={sprintForm.end_date}
                        onChange={(e) => setSprintForm({...sprintForm, end_date: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateSprintOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Sprint"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sprints</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{sprints.length}</div>
                  <p className="text-sm text-blue-600">Across all projects</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Sprints</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-600">{activeSprints.length}</div>
                  <p className="text-sm text-gray-600">Currently running</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-600">{completedSprints.length}</div>
                  <p className="text-sm text-gray-600">Finished sprints</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Backlog Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{backlogTasks.length}</div>
                  <p className="text-sm text-gray-600">Ready for planning</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="current-sprint" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current-sprint">Active Sprints</TabsTrigger>
            <TabsTrigger value="backlog">Product Backlog</TabsTrigger>
            <TabsTrigger value="sprints">All Sprints</TabsTrigger>
          </TabsList>

          <TabsContent value="current-sprint" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : activeSprints.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active sprints</h3>
                    <p className="text-gray-600">Create a sprint to start planning your work.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {activeSprints.map((sprint) => (
                  <Card key={sprint.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{sprint.name}</span>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </CardTitle>
                          {sprint.goal && (
                            <p className="text-sm text-gray-600 mt-1">{sprint.goal}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditSprint(sprint)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteSprint(sprint.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{getSprintProgress(sprint)}%</div>
                          <p className="text-sm text-gray-600">Time Progress</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">0</div>
                          <p className="text-sm text-gray-600">Tasks Completed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">0</div>
                          <p className="text-sm text-gray-600">Total Tasks</p>
                        </div>
                      </div>
                      <Progress value={getSprintProgress(sprint)} className="h-3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="backlog" className="space-y-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search backlog items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Backlog</CardTitle>
                <p className="text-sm text-gray-600">Items ready for sprint planning</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredBacklog.length === 0 ? (
                  <div className="text-center py-8">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No backlog items</h3>
                    <p className="text-gray-600">Add items to your backlog to start planning.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBacklog.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium">{task.title}</h4>
                              {task.priority && (
                                <Badge className={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                              )}
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {task.due_date && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Due: {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
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

          <TabsContent value="sprints" className="space-y-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sprints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Sprints</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredSprints.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sprints found</h3>
                    <p className="text-gray-600">Create your first sprint to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSprints.map((sprint) => (
                      <div key={sprint.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold">{sprint.name}</h4>
                              <Badge className={isSprintActive(sprint) ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {isSprintActive(sprint) ? "Active" : new Date(sprint.end_date) < new Date() ? "Completed" : "Upcoming"}
                              </Badge>
                            </div>
                            {sprint.goal && (
                              <p className="text-sm text-gray-600 mb-2">{sprint.goal}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button variant="ghost" size="sm" onClick={() => openEditSprint(sprint)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSprint(sprint.id)}>
                              <Trash2 className="h-4 w-4" />
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
        </Tabs>

        {/* Edit Sprint Dialog */}
        <Dialog open={isEditSprintOpen} onOpenChange={setIsEditSprintOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Sprint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSprint} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Sprint Name *</Label>
                <Input
                  id="edit_name"
                  value={sprintForm.name}
                  onChange={(e) => setSprintForm({...sprintForm, name: e.target.value})}
                  placeholder="e.g., Sprint 1, Q1 Sprint"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit_goal">Sprint Goal</Label>
                <Textarea
                  id="edit_goal"
                  value={sprintForm.goal}
                  onChange={(e) => setSprintForm({...sprintForm, goal: e.target.value})}
                  placeholder="What do you want to achieve in this sprint?"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_start_date">Start Date *</Label>
                  <Input
                    id="edit_start_date"
                    type="date"
                    value={sprintForm.start_date}
                    onChange={(e) => setSprintForm({...sprintForm, start_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_end_date">End Date *</Label>
                  <Input
                    id="edit_end_date"
                    type="date"
                    value={sprintForm.end_date}
                    onChange={(e) => setSprintForm({...sprintForm, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditSprintOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Sprint"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
} 