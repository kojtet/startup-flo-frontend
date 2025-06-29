import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { // Unused Select components
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import {
  Star,
  TrendingUp,
  BarChart,
  Clock
} from "lucide-react";

export default function PerformanceReviews() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const reviews = [
    { id: 1, employee: "Sarah Johnson", reviewer: "Mike Wilson", period: "Q1 2024", score: 4.2, status: "Completed", department: "Marketing" },
    { id: 2, employee: "Mike Chen", reviewer: "Alice Roberts", period: "Q1 2024", score: 4.8, status: "Completed", department: "Engineering" },
    { id: 3, employee: "Emily Davis", reviewer: "John Smith", period: "Q1 2024", score: 3.9, status: "In Progress", department: "Sales" },
    { id: 4, employee: "David Wilson", reviewer: "Sarah Connor", period: "Q1 2024", score: 4.1, status: "Pending", department: "HR" }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
            <p className="text-gray-600 mt-2">Track and manage employee performance evaluations</p>
          </div>
          <Button>
            <BarChart className="mr-2 h-4 w-4" />
            Start Review Cycle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviews.filter(review => review.status === 'Completed').length}
              </div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(reviews.reduce((acc, review) => acc + review.score, 0) / reviews.length).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviews.filter(review => review.status === 'Pending' || review.status === 'In Progress').length}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Performers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviews.filter(review => review.score >= 4.5).length}
              </div>
              <p className="text-xs text-muted-foreground">Score ≥ 4.5</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Review Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{review.employee}</h3>
                      <p className="text-sm text-gray-500">{review.department} • Reviewed by {review.reviewer}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(review.status)}>
                        {review.status}
                      </Badge>
                      {review.status === 'Completed' && (
                        <Badge variant="outline">
                          {review.period}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {review.status === 'Completed' && (
                        <div className="flex items-center space-x-2">
                          <Star className={`h-4 w-4 ${getScoreColor(review.score)}`} />
                          <span className={`font-bold ${getScoreColor(review.score)}`}>
                            {review.score}/5.0
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-gray-600">{review.period}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {review.status !== 'Completed' && (
                        <Button size="sm">
                          Continue Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {reviews.filter(review => review.score >= 4.0).length}
                  </div>
                  <p className="text-sm text-green-700">Exceeds Expectations</p>
                  <p className="text-xs text-green-600">Score 4.0+</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reviews.filter(review => review.score >= 3.0 && review.score < 4.0).length}
                  </div>
                  <p className="text-sm text-yellow-700">Meets Expectations</p>
                  <p className="text-xs text-yellow-600">Score 3.0-3.9</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {reviews.filter(review => review.score < 3.0).length}
                  </div>
                  <p className="text-sm text-red-700">Needs Improvement</p>
                  <p className="text-xs text-red-600">Score &lt; 3.0</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
} 
