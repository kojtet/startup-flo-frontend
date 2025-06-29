import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { projectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus,
  Users,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
  UserPlus,
  UserMinus,
  Award,
  Clock
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/apis";
import type { 
  Project, 
  User as UserType,
  ProjectTask
} from "@/apis/types";

export default function Team() {
  const { user, companyId } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isAssignUserOpen, setIsAssignUserOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [projectUsers, setProjectUsers] = useState<UserType[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);

  const [assignForm, setAssignForm] = useState({
    project_id: '',
    user_id: '',
    role: 'member'
  });

  useEffect(() => {
    const loadTeamData = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const [projectsData, usersData] = await Promise.all([
          api.projects.getProjects({ limit: 100 }),
          api.user.getCompanyUsers(companyId, { limit: 100 })
        ]);

        const projectsList = Array.isArray(projectsData) ? projectsData : projectsData.data || [];
        setProjects(projectsList);
        setAllUsers(usersData);

        if (projectsList.length > 0) {
          const firstProject = projectsList[0];
          setSelectedProject(firstProject.id);
          await loadProjectTeam(firstProject.id);
        }

        toast({
          title: "Team data loaded",
          description: `Found ${projectsList.length} projects and ${usersData.length} team members`,
        });

      } catch (err) {
        console.error("Failed to load team data:", err);
        setError("Failed to load team data");
        toast({
          title: "Error",
          description: "Failed to load team data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [companyId, toast]);

  const loadProjectTeam = async (projectId: string) => {
    try {
      const [teamData, tasksData] = await Promise.all([
        api.projects.getProjectTeam(projectId).catch(() => []),
        api.projects.getProjectTasks(projectId).catch(() => [])
      ]);
      
      setProjectUsers(teamData);
      setTasks(tasksData);
    } catch (err) {
      console.error("Failed to load project team:", err);
    }
  };

  const handleProjectChange = async (projectId: string) => {
    setSelectedProject(projectId);
    await loadProjectTeam(projectId);
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.project_id || !assignForm.user_id) return;

    setSubmitting(true);
    try {
      await api.projects.assignUserToProject(assignForm.project_id, {
        user_id: assignForm.user_id,
        role: assignForm.role
      });

      await loadProjectTeam(assignForm.project_id);
      setIsAssignUserOpen(false);
      resetForm();

      toast({
        title: "User assigned",
        description: "User has been assigned to the project successfully",
      });

    } catch (err) {
      console.error("Failed to assign user:", err);
      toast({
        title: "Error",
        description: "Failed to assign user to project",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUser = async (projectId: string, userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the project?")) return;

    try {
      await api.projects.removeUserFromProject(projectId, userId);
      await loadProjectTeam(projectId);

      toast({
        title: "User removed",
        description: "User has been removed from the project",
      });

    } catch (err) {
      console.error("Failed to remove user:", err);
      toast({
        title: "Error",
        description: "Failed to remove user from project",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAssignForm({
      project_id: selectedProject,
      user_id: '',
      role: 'member'
    });
  };

  const filteredUsers = projectUsers.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = allUsers.filter(user => 
    !projectUsers.some(pu => pu.id === user.id)
  );

  const getUserTaskCount = (userId: string) => {
    return tasks.filter(task => task.assigned_to === userId).length;
  };

  const getUserCompletedTasks = (userId: string) => {
    return tasks.filter(task => task.assigned_to === userId && task.status === 'completed').length;
  };

  if (!user) {
    return (
      <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management" user={null}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Team</h1>
            <p className="text-gray-600 mt-2">Manage team members and their roles across projects</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isAssignUserOpen} onOpenChange={setIsAssignUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign User to Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssignUser} className="space-y-4">
                  <div>
                    <Label htmlFor="project">Project *</Label>
                    <Select 
                      value={assignForm.project_id} 
                      onValueChange={(value) => setAssignForm({...assignForm, project_id: value})}
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
                    <Label htmlFor="user">User *</Label>
                    <Select 
                      value={assignForm.user_id} 
                      onValueChange={(value) => setAssignForm({...assignForm, user_id: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} - {user.job_title || user.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={assignForm.role} 
                      onValueChange={(value) => setAssignForm({...assignForm, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAssignUserOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        "Assign User"
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold">{allUsers.length}</div>
                  <p className="text-sm text-blue-600">Company-wide</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Project Team</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-600">{projectUsers.length}</div>
                  <p className="text-sm text-gray-600">Current project</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-600">
                    {tasks.filter(t => t.status === 'in_progress').length}
                  </div>
                  <p className="text-sm text-gray-600">In progress</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-600">
                    {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Tasks completed</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-4">
          <div className="w-64">
            <Label htmlFor="project-select">Select Project</Label>
            <Select value={selectedProject} onValueChange={handleProjectChange}>
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
          <div className="flex-1">
            <Label htmlFor="search">Search Team Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <p className="text-sm text-gray-600">
              {selectedProject ? `Members assigned to ${projects.find(p => p.id === selectedProject)?.name}` : 'Select a project to view team members'}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                <p className="text-gray-600">
                  {selectedProject ? 'Assign users to this project to build your team.' : 'Select a project to view team members.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{member.first_name} {member.last_name}</h4>
                          <p className="text-sm text-gray-600">{member.job_title || member.role}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveUser(selectedProject, member.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {member.phone}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-blue-600">
                            {getUserTaskCount(member.id)}
                          </div>
                          <p className="text-xs text-gray-600">Total Tasks</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {getUserCompletedTasks(member.id)}
                          </div>
                          <p className="text-xs text-gray-600">Completed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
} 
