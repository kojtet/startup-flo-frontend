import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { projectsSidebarSections } from "@/components/sidebars/ProjectsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  FileText,
  Users,
  Target,
  // MoreHorizontal, // Unused
  // PlusCircle, // Unused
  // Edit3, // Unused
  // Trash2, // Unused
  // FileDown, // Unused
  // Paperclip, // Unused
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Deliverables() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const deliverables = [
    {
      id: 1,
      title: "Website Wireframes",
      description: "Complete wireframe designs for all main pages",
      project: "Website Redesign",
      status: "Completed",
      priority: "High",
      dueDate: "2024-01-20",
      completedDate: "2024-01-18",
      assignee: "Alice Johnson",
      progress: 100,
      type: "Design",
      dependencies: []
    },
    {
      id: 2,
      title: "API Documentation",
      description: "Comprehensive API documentation for mobile app",
      project: "Mobile App Launch",
      status: "In Progress",
      priority: "High",
      dueDate: "2024-01-25",
      completedDate: null,
      assignee: "Bob Smith",
      progress: 75,
      type: "Documentation",
      dependencies: ["API Development"]
    },
    {
      id: 3,
      title: "User Testing Report",
      description: "Analysis of user testing sessions and recommendations",
      project: "Website Redesign",
      status: "Overdue",
      priority: "Medium",
      dueDate: "2024-01-22",
      completedDate: null,
      assignee: "Carol Brown",
      progress: 45,
      type: "Research",
      dependencies: ["User Testing Sessions"]
    },
    {
      id: 4,
      title: "Marketing Campaign Assets",
      description: "All creative assets for Q1 marketing campaign",
      project: "Q1 Marketing Campaign",
      status: "Pending",
      priority: "Medium",
      dueDate: "2024-01-30",
      completedDate: null,
      assignee: "David Wilson",
      progress: 20,
      type: "Creative",
      dependencies: ["Brand Guidelines"]
    },
    {
      id: 5,
      title: "Security Audit Report",
      description: "Complete security assessment of infrastructure",
      project: "Infrastructure Upgrade",
      status: "In Review",
      priority: "High",
      dueDate: "2024-01-28",
      completedDate: null,
      assignee: "Eve Davis",
      progress: 90,
      type: "Security",
      dependencies: ["Penetration Testing"]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "In Progress": return <Clock className="h-4 w-4 text-blue-600" />;
      case "Overdue": return <XCircle className="h-4 w-4 text-red-600" />;
      case "In Review": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "Pending": return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Overdue": return "bg-red-100 text-red-800";
      case "In Review": return "bg-yellow-100 text-yellow-800";
      case "Pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Design": return "bg-purple-100 text-purple-800";
      case "Documentation": return "bg-blue-100 text-blue-800";
      case "Research": return "bg-green-100 text-green-800";
      case "Creative": return "bg-pink-100 text-pink-800";
      case "Security": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== "Completed" && new Date(dueDate) < new Date();
  };

  const completedCount = deliverables.filter(d => d.status === "Completed").length;
  const overdueCount = deliverables.filter(d => isOverdue(d.dueDate, d.status)).length;
  const inProgressCount = deliverables.filter(d => d.status === "In Progress").length;

  return (
    <ExtensibleLayout moduleSidebar={projectsSidebarSections} moduleTitle="Project Management" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deliverables</h1>
            <p className="text-gray-600 mt-2">Track project milestones and deliverables</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Deliverable
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deliverables.length}</div>
              <p className="text-sm text-blue-600">Across all projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{completedCount}</div>
              <p className="text-sm text-gray-600">{Math.round((completedCount / deliverables.length) * 100)}% completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{inProgressCount}</div>
              <p className="text-sm text-gray-600">Active deliverables</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{overdueCount}</div>
              <p className="text-sm text-red-600">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search deliverables..."
              className="max-w-md"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Deliverables List */}
        <Card>
          <CardHeader>
            <CardTitle>All Deliverables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliverables.map((deliverable) => (
                <div key={deliverable.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(deliverable.status)}
                        <h3 className="text-lg font-semibold">{deliverable.title}</h3>
                        <Badge className={getStatusColor(deliverable.status)}>
                          {deliverable.status}
                        </Badge>
                        <Badge className={getPriorityColor(deliverable.priority)}>
                          {deliverable.priority}
                        </Badge>
                        <Badge className={getTypeColor(deliverable.type)}>
                          {deliverable.type}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{deliverable.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Project</p>
                          <p className="font-medium">{deliverable.project}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Assignee</p>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <p className="font-medium">{deliverable.assignee}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Due Date</p>
                          <div className={`flex items-center ${
                            isOverdue(deliverable.dueDate, deliverable.status) ? 'text-red-600' : ''
                          }`}>
                            <Calendar className="h-4 w-4 mr-1" />
                            <p className="font-medium">{deliverable.dueDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Progress</p>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            <p className="font-medium">{deliverable.progress}%</p>
                          </div>
                        </div>
                      </div>

                      {deliverable.dependencies.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">Dependencies:</p>
                          <div className="flex flex-wrap gap-1">
                            {deliverable.dependencies.map((dep, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{deliverable.progress}%</span>
                          </div>
                          <Progress value={deliverable.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
} 
