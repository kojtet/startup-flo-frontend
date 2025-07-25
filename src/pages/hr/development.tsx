import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, BookOpen, TrendingUp, Users2, Target } from "lucide-react";

export default function CareerDevelopment() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const developmentPlans = [
    { id: 1, employee: "Sarah Johnson", currentRole: "Marketing Specialist", targetRole: "Marketing Manager", progress: 75, skills: ["Leadership", "Strategy"], mentor: "Mike Wilson" },
    { id: 2, employee: "Mike Chen", currentRole: "Junior Developer", targetRole: "Senior Developer", progress: 60, skills: ["React", "System Design"], mentor: "Alice Roberts" },
    { id: 3, employee: "Emily Davis", currentRole: "Sales Rep", targetRole: "Account Manager", progress: 40, skills: ["Account Management", "Negotiation"], mentor: "John Smith" },
    { id: 4, employee: "David Wilson", currentRole: "HR Assistant", targetRole: "HR Specialist", progress: 85, skills: ["Policy", "Employee Relations"], mentor: "Sarah Connor" }
  ];

  const trainingPrograms = [
    { id: 1, name: "Leadership Fundamentals", participants: 25, duration: "8 weeks", status: "Active" },
    { id: 2, name: "Technical Skills Bootcamp", participants: 15, duration: "12 weeks", status: "Starting Soon" },
    { id: 3, name: "Sales Excellence", participants: 18, duration: "6 weeks", status: "Completed" }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Starting Soon': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Career Development</h1>
            <p className="text-gray-600 mt-2">Support employee growth and career advancement</p>
          </div>
          <Button>
            <Briefcase className="mr-2 h-4 w-4" />
            Create Development Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{developmentPlans.length}</div>
              <p className="text-xs text-muted-foreground">Development plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(developmentPlans.reduce((acc, plan) => acc + plan.progress, 0) / developmentPlans.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Programs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainingPrograms.length}</div>
              <p className="text-xs text-muted-foreground">Available programs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trainingPrograms.reduce((acc, program) => acc + program.participants, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all programs</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Development Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {developmentPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{plan.employee}</h3>
                        <p className="text-sm text-gray-500">
                          {plan.currentRole} → {plan.targetRole}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {plan.progress}% Complete
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{plan.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(plan.progress)}`}
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Focus Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {plan.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-600">Mentor: {plan.mentor}</span>
                        <Button variant="outline" size="sm">
                          View Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingPrograms.map((program) => (
                  <div key={program.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{program.name}</h3>
                        <p className="text-sm text-gray-500">{program.duration} • {program.participants} participants</p>
                      </div>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{program.participants}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{program.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {program.status === 'Active' && (
                          <Button size="sm">
                            Enroll
                          </Button>
                        )}
                      </div>
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