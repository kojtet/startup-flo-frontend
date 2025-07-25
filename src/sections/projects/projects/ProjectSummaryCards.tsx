import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectSummaryCardsProps {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
}

export function ProjectSummaryCards({
  totalProjects,
  activeProjects,
  completedProjects,
  totalBudget
}: ProjectSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalProjects}</div>
          <p className="text-sm text-blue-600">All projects</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{activeProjects}</div>
          <p className="text-sm text-gray-600">In progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{completedProjects}</div>
          <p className="text-sm text-green-600">Successfully finished</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${(totalBudget / 1000).toFixed(0)}K</div>
          <p className="text-sm text-gray-600">Allocated budget</p>
        </CardContent>
      </Card>
    </div>
  );
} 