import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Campaign, CampaignGoal } from "@/apis/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Target, Calendar, Users } from "lucide-react";

interface CampaignFormData {
  name: string;
  description: string;
  type: Campaign['type'];
  status: Campaign['status'];
  start_date: string;
  end_date: string;
  budget: number;
  target_audience: string;
  priority: Campaign['priority'];
  tags: string[];
  assigned_to: string;
  notes: string;
  end_goals: Omit<CampaignGoal, 'id' | 'current_value' | 'is_completed'>[];
}

interface MultiStepCampaignFormProps {
  formData: CampaignFormData;
  setFormData: (data: CampaignFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
  formLoading?: boolean;
  onCancel?: () => void;
}

const steps = [
  "Basic Info",
  "Timeline & Budget",
  "End Goals & KPIs",
  "Tags & Notes"
];

export function MultiStepCampaignForm({
  formData,
  setFormData,
  onSubmit,
  isEdit = false,
  formLoading = false,
  onCancel
}: MultiStepCampaignFormProps) {
  const [step, setStep] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [newGoal, setNewGoal] = useState({
    name: "",
    target_value: 0,
    unit: "",
    type: "conversion" as const,
    deadline: ""
  });

  // Step navigation
  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Tag logic
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };
  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  // Goal logic
  const addGoal = () => {
    if (newGoal.name && newGoal.target_value > 0 && newGoal.unit) {
      setFormData({
        ...formData,
        end_goals: [...formData.end_goals, { ...newGoal }]
      });
      setNewGoal({
        name: "",
        target_value: 0,
        unit: "",
        type: "conversion",
        deadline: ""
      });
    }
  };
  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      end_goals: formData.end_goals.filter((_, i) => i !== index)
    });
  };

  // Step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label htmlFor="name" className="text-sm">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Q4 Product Launch Campaign"
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Campaign description and objectives..."
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="type" className="text-sm">Campaign Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value as Campaign['type'] })}
                    required
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Marketing</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="display">Display Advertising</SelectItem>
                      <SelectItem value="search">Search Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" className="text-sm">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as Campaign['status'] })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="priority" className="text-sm">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Campaign['priority'] })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assigned_to" className="text-sm">Assigned To</Label>
                  <Input
                    id="assigned_to"
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    placeholder="User ID or email"
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Timeline & Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start_date" className="text-sm">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="text-sm">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="budget" className="text-sm">Budget *</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    required
                    placeholder="0.00"
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="target_audience" className="text-sm">Target Audience</Label>
                  <Input
                    id="target_audience"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="e.g., Enterprise customers"
                    className="h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                End Goals & KPIs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {formData.end_goals.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-sm">Current Goals</Label>
                  {formData.end_goals.map((goal, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <div>
                        <div className="font-medium">{goal.name}</div>
                        <div className="text-gray-600">
                          {goal.target_value} {goal.unit} • {goal.type}
                          {goal.deadline && ` • ${new Date(goal.deadline).toLocaleDateString()}`}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeGoal(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-2">
                <Label className="text-sm">Add New Goal</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label htmlFor="goal_name" className="text-xs">Goal Name</Label>
                    <Input
                      id="goal_name"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      placeholder="e.g., Lead Generation"
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal_target" className="text-xs">Target Value</Label>
                    <Input
                      id="goal_target"
                      type="number"
                      min="0"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal_unit" className="text-xs">Unit</Label>
                    <Input
                      id="goal_unit"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      placeholder="e.g., leads"
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal_type" className="text-xs">Goal Type</Label>
                    <Select 
                      value={newGoal.type} 
                      onValueChange={(value) => setNewGoal({ ...newGoal, type: value as any })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversion">Conversion</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="awareness">Awareness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="goal_deadline" className="text-xs">Deadline (Optional)</Label>
                    <Input
                      id="goal_deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGoal}
                  className="mt-1 h-7 text-xs"
                  disabled={!newGoal.name || newGoal.target_value <= 0 || !newGoal.unit}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Tags & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label htmlFor="tags" className="text-sm">Tags</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="h-7 text-xs"
                  />
                  <Button type="button" variant="outline" onClick={addTag} disabled={!newTag.trim()} className="h-7 w-7 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs h-5">
                        {tag}
                        <X 
                          className="h-2 w-2 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="notes" className="text-sm">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {steps.map((label, idx) => (
          <div key={label} className="flex items-center">
            <div className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 ${step === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>{idx + 1}</div>
            {idx < steps.length - 1 && <div className={`w-8 h-1 ${step > idx ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mb-4">
        {steps.map((label, idx) => (
          <span key={label} className={`text-xs font-medium ${step === idx ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
        ))}
      </div>
      {/* Step Content */}
      {renderStep()}
      {/* Navigation */}
      <div className="flex justify-between gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} size="sm">
            Cancel
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={prevStep} size="sm">
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button type="button" onClick={nextStep} size="sm">
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={formLoading} size="sm">
              {formLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {isEdit ? "Update Campaign" : "Create Campaign"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
} 