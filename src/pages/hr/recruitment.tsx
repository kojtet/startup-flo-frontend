import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users2, Briefcase, Eye, CheckCircle, Clock } from "lucide-react";

export default function Recruitment() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      applications: 24,
      status: "Active",
      posted: "2024-01-10"
    },
    {
      id: 2,
      title: "Marketing Manager",
      department: "Marketing",
      location: "New York",
      type: "Full-time",
      applications: 18,
      status: "Active",
      posted: "2024-01-15"
    },
    {
      id: 3,
      title: "Sales Representative",
      department: "Sales",
      location: "San Francisco",
      type: "Full-time",
      applications: 31,
      status: "Closed",
      posted: "2024-01-05"
    }
  ];

  const candidates = [
    {
      id: 1,
      name: "Alice Johnson",
      position: "Senior Frontend Developer",
      stage: "Technical Interview",
      score: 85,
      appliedDate: "2024-01-12"
    },
    {
      id: 2,
      name: "Mark Thompson",
      position: "Marketing Manager",
      stage: "HR Screening",
      score: 78,
      appliedDate: "2024-01-16"
    },
    {
      id: 3,
      name: "Jennifer Davis",
      position: "Senior Frontend Developer",
      stage: "Final Interview",
      score: 92,
      appliedDate: "2024-01-11"
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage: string) => {
    switch(stage) {
      case 'HR Screening': return 'bg-blue-100 text-blue-800';
      case 'Technical Interview': return 'bg-purple-100 text-purple-800';
      case 'Final Interview': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruitment</h1>
            <p className="text-gray-600 mt-2">Manage job openings and candidate applications</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobOpenings.filter(job => job.status === 'Active').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently hiring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobOpenings.reduce((acc, job) => acc + job.applications, 0)}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates.length}</div>
              <p className="text-xs text-muted-foreground">Active candidates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hire Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Openings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobOpenings.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.department} • {job.location}</p>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{job.type}</span>
                        <span>{job.applications} applications</span>
                        <span>Posted {job.posted}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-sm text-gray-500">{candidate.position}</p>
                      </div>
                      <Badge className={getStageColor(candidate.stage)}>
                        {candidate.stage}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Score: </span>
                          <span className={`font-medium ${candidate.score >= 85 ? 'text-green-600' : candidate.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {candidate.score}%
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">Applied {candidate.appliedDate}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-3 w-3" />
                        Review
                      </Button>
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