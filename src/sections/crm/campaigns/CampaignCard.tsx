import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Users, 
  Calendar,
  Eye,
  Target,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  DollarSign,
  Award,
  Tag,
  User,
  FileText
} from "lucide-react";
import type { Campaign } from "@/apis/types";

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  onLaunch: (campaignId: string) => void;
  onPause: (campaignId: string) => void;
  onComplete: (campaignId: string) => void;
  onCancel: (campaignId: string) => void;
}

export function CampaignCard({ 
  campaign, 
  onEdit, 
  onDelete, 
  onLaunch, 
  onPause, 
  onComplete, 
  onCancel 
}: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "active": return "bg-green-100 text-green-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "social": return <Users className="h-4 w-4" />;
      case "display": return <Eye className="h-4 w-4" />;
      case "search": return <Target className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateProgress = (campaign: Campaign) => {
    if (!campaign.start_date || !campaign.end_date) return 0;
    
    const start = new Date(campaign.start_date);
    const end = new Date(campaign.end_date);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.round((elapsed / total) * 100);
  };

  const calculateROI = (campaign: Campaign) => {
    if (!campaign.spend || campaign.spend === 0) return 0;
    // Assuming each conversion is worth $100 on average
    const revenue = (campaign.conversions || 0) * 100;
    return ((revenue - campaign.spend) / campaign.spend) * 100;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable": return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              {getTypeIcon(campaign.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{campaign.name}</h3>
                <Badge className={getPriorityColor(campaign.priority)}>
                  {campaign.priority?.toUpperCase() || "MEDIUM"}
                </Badge>
              </div>
              <p className="text-gray-600 capitalize text-sm mb-2">{campaign.type} Campaign</p>
              {campaign.description && (
                <p className="text-gray-700 text-sm line-clamp-2">{campaign.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status.toUpperCase()}
            </Badge>
            <div className="flex gap-1">
              {campaign.status === "draft" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onLaunch(campaign.id)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}
              {campaign.status === "active" && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onPause(campaign.id)}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onComplete(campaign.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                </>
              )}
              {campaign.status === "paused" && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onLaunch(campaign.id)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}
              {(campaign.status === "draft" || campaign.status === "paused") && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onCancel(campaign.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onEdit(campaign)}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDelete(campaign.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Campaign Info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">{formatCurrency(campaign.budget)}</div>
              <div className="text-xs text-gray-500">Budget</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">{new Date(campaign.start_date).toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">Start Date</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">{new Date(campaign.end_date).toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">End Date</div>
            </div>
          </div>
          {campaign.target_audience && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-sm font-medium truncate">{campaign.target_audience}</div>
                <div className="text-xs text-gray-500">Target Audience</div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {campaign.tags && campaign.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {campaign.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tracking */}
        {campaign.current_progress && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Campaign Progress</h4>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{campaign.current_progress.performance_score}/100</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{campaign.current_progress.overall_progress}%</div>
                <div className="text-xs text-gray-600">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{campaign.current_progress.goals_completed}/{campaign.current_progress.total_goals}</div>
                <div className="text-xs text-gray-600">Goals Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{campaign.current_progress.days_remaining}</div>
                <div className="text-xs text-gray-600">Days Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(campaign.current_progress.budget_utilized)}</div>
                <div className="text-xs text-gray-600">Budget Used</div>
              </div>
            </div>

            <Progress value={campaign.current_progress.overall_progress} className="h-2" />
          </div>
        )}

        {/* End Goals */}
        {campaign.end_goals && campaign.end_goals.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              End Goals
            </h4>
            <div className="grid gap-2">
              {campaign.end_goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{goal.name}</span>
                      {goal.is_completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {goal.current_value} / {goal.target_value} {goal.unit} • {goal.type}
                      {goal.deadline && ` • Due: ${new Date(goal.deadline).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {Math.round((goal.current_value / goal.target_value) * 100)}%
                    </div>
                    <Progress 
                      value={(goal.current_value / goal.target_value) * 100} 
                      className="h-1 w-16 mt-1" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaign Metrics */}
        {campaign.impressions !== undefined && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{campaign.impressions?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-600">Impressions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{campaign.clicks?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-600">Clicks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{campaign.conversions?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-600">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {campaign.clicks && campaign.impressions ? 
                    ((campaign.clicks / campaign.impressions) * 100).toFixed(2) + '%' : '0%'}
                </div>
                <div className="text-xs text-gray-600">CTR</div>
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        {campaign.kpis && campaign.kpis.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Key Performance Indicators</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {campaign.kpis.map((kpi) => (
                <div key={kpi.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{kpi.name}</div>
                    <div className="text-xs text-gray-600">{kpi.current_value} / {kpi.target_value} {kpi.unit}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(kpi.trend)}
                    <span className={`text-sm font-medium ${kpi.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change_percentage >= 0 ? '+' : ''}{kpi.change_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROI and Spend */}
        {campaign.spend !== undefined && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3">Financial Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(campaign.spend || 0)}</div>
                <div className="text-xs text-gray-600">Total Spent</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${calculateROI(campaign) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculateROI(campaign).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">ROI</div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Progress Bar */}
        {campaign.status === "active" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Campaign Timeline Progress</span>
              <span className="font-medium">{calculateProgress(campaign)}%</span>
            </div>
            <Progress value={calculateProgress(campaign)} className="h-2" />
          </div>
        )}

        <Separator />

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="flex-1">
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Users className="h-4 w-4 mr-1" />
            Audience
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            Performance
          </Button>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {campaign.assigned_to && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Assigned: {campaign.assigned_to}</span>
              </div>
            )}
            {campaign.notes && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>Has notes</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Updated: {new Date(campaign.updated_at || campaign.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 