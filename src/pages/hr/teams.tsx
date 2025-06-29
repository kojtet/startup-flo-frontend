import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GanttChartSquare, Users2, Plus, Settings, Star } from "lucide-react";

export default function TeamsManagement() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const teams = [
    {
      id: 1,
      name: "Frontend Development",
      department: "Engineering",
      lead: "Bob Wilson",
      members: 5,
      status: "Active",
      performance: 92,
      projects: ["Web App V2", "Mobile Dashboard"]
    },
    {
      id: 2,
      name: "Backend Development",
      department: "Engineering",
      lead: "Carol Davis",
      members: 6,
      status: "Active",
      performance: 88,
      projects: ["API Gateway", "Database Migration"]
    },
    {
      id: 3,
      name: "Digital Marketing",
      department: "Marketing",
      lead: "Mike Chen",
      members: 4,
      status: "Active",
      performance: 95,
      projects: ["Q1 Campaign", "Social Media Strategy"]
    },
    {
      id: 4,
      name: "Enterprise Sales",
      department: "Sales",
      lead: "Emma Davis",
      members: 8,
      status: "Active",
      performance: 87,
      projects: ["Enterprise Outreach", "Client Renewals"]
    }
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
            <p className="text-gray-600 mt-2">Organize and manage your teams across departments</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground">Active teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.reduce((acc, team) => acc + team.members, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(teams.reduce((acc, team) => acc + team.performance, 0) / teams.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Team performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.reduce((acc, team) => acc + team.projects.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Ongoing projects</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <GanttChartSquare className="mr-2 h-5 w-5" />
                      {team.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{team.department}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Team Lead</p>
                      <p className="text-sm text-gray-600">{team.lead}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Members</p>
                      <p className="text-sm text-gray-600">{team.members}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Performance</span>
                      <span className={`text-sm font-medium ${getPerformanceColor(team.performance)}`}>
                        {team.performance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          team.performance >= 90 ? 'bg-green-500' :
                          team.performance >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${team.performance}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Current Projects</p>
                    <div className="space-y-1">
                      {team.projects.map((project, index) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          {project}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <Badge className={team.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {team.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ExtensibleLayout>
  );
} 