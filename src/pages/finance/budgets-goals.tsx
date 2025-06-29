import React, { useState, useEffect } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { financeSidebarSections } from '@/components/sidebars/FinanceSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/apis';
import type { Budget, Goal, CreateBudgetData, UpdateBudgetData, CreateGoalData, UpdateGoalData, Category } from '@/apis/types';
import { Plus, Edit, Trash2, Target, DollarSign, Calendar, TrendingUp, Search, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BudgetsGoalsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isEditBudgetDialogOpen, setIsEditBudgetDialogOpen] = useState(false);
  const [isEditGoalDialogOpen, setIsEditGoalDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [budgetFormData, setBudgetFormData] = useState<CreateBudgetData>({
    name: '',
    category_id: '',
    amount: 0,
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: ''
  });
  const [goalFormData, setGoalFormData] = useState<CreateGoalData>({
    name: '',
    target_amount: 0,
    current_amount: 0,
    target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: '',
    priority: 'medium'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsResponse, goalsResponse, categoriesResponse] = await Promise.all([
        api.finance.getBudgets(),
        api.finance.getGoals(),
        api.finance.getCategories()
      ]);
      setBudgets(budgetsResponse || []);
      setGoals(goalsResponse || []);
      setCategories(categoriesResponse || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBudget = await api.finance.createBudget(budgetFormData);
      setBudgets(prev => [...prev, newBudget]);
      setIsBudgetDialogOpen(false);
      setBudgetFormData({
        name: '',
        category_id: '',
        amount: 0,
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: ''
      });
      toast({
        title: "Success",
        description: "Budget created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive"
      });
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGoal = await api.finance.createGoal(goalFormData);
      setGoals(prev => [...prev, newGoal]);
      setIsGoalDialogOpen(false);
      setGoalFormData({
        name: '',
        target_amount: 0,
        current_amount: 0,
        target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '',
        priority: 'medium'
      });
      toast({
        title: "Success",
        description: "Goal created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await api.finance.deleteBudget(budgetId);
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
      toast({
        title: "Success",
        description: "Budget deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.finance.deleteGoal(goalId);
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      toast({
        title: "Success",
        description: "Goal deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'over_budget': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const achievedGoals = goals.filter(g => g.status === 'completed').length;

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Budgets & Goals</h1>
          <p className="text-muted-foreground">
            Plan your finances with budgets and track your financial goals
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBudgetAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goal Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalGoalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achieved Goals</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{achievedGoals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search budgets & goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="over_budget">Over Budget</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs for Budgets and Goals */}
        <Tabs defaultValue="budgets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="budgets" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Budget Management</h2>
              <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreateBudget}>
                    <DialogHeader>
                      <DialogTitle>Create New Budget</DialogTitle>
                      <DialogDescription>
                        Set up a new budget to track your spending in a specific category.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="budget-name">Budget Name</Label>
                        <Input
                          id="budget-name"
                          value={budgetFormData.name}
                          onChange={(e) => setBudgetFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Monthly Groceries"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="budget-category">Category</Label>
                        <Select
                          value={budgetFormData.category_id}
                          onValueChange={(value) => setBudgetFormData(prev => ({ ...prev, category_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(c => c.type === 'expense').map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="budget-amount">Budget Amount</Label>
                        <Input
                          id="budget-amount"
                          type="number"
                          step="0.01"
                          value={budgetFormData.amount}
                          onChange={(e) => setBudgetFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="budget-period">Period</Label>
                        <Select
                          value={budgetFormData.period}
                          onValueChange={(value: any) => setBudgetFormData(prev => ({ ...prev, period: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="budget-start">Start Date</Label>
                          <Input
                            id="budget-start"
                            type="date"
                            value={budgetFormData.start_date}
                            onChange={(e) => setBudgetFormData(prev => ({ ...prev, start_date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="budget-end">End Date</Label>
                          <Input
                            id="budget-end"
                            type="date"
                            value={budgetFormData.end_date}
                            onChange={(e) => setBudgetFormData(prev => ({ ...prev, end_date: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="budget-description">Description</Label>
                        <Textarea
                          id="budget-description"
                          value={budgetFormData.description}
                          onChange={(e) => setBudgetFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Budget</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading budgets...</div>
            ) : (
              <div className="grid gap-4">
                {filteredBudgets.map((budget) => {
                  const category = categories.find(c => c.id === budget.category_id);
                  const progressPercentage = Math.min((budget.spent / budget.amount) * 100, 100);
                  
                  return (
                    <Card key={budget.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{budget.name}</h3>
                              <Badge className={getStatusColor(budget.status)}>
                                {budget.status?.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {category?.name} • {budget.period}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBudget(budget.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progressPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className={progressPercentage > 100 ? "bg-red-100" : ""} 
                          />
                        </div>
                        {budget.description && (
                          <p className="text-sm text-muted-foreground mt-3">{budget.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredBudgets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No budgets found
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Financial Goals</h2>
              <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreateGoal}>
                    <DialogHeader>
                      <DialogTitle>Create New Goal</DialogTitle>
                      <DialogDescription>
                        Set up a new financial goal to work towards.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="goal-name">Goal Name</Label>
                        <Input
                          id="goal-name"
                          value={goalFormData.name}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Emergency Fund"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goal-target">Target Amount</Label>
                        <Input
                          id="goal-target"
                          type="number"
                          step="0.01"
                          value={goalFormData.target_amount}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goal-current">Current Amount</Label>
                        <Input
                          id="goal-current"
                          type="number"
                          step="0.01"
                          value={goalFormData.current_amount}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, current_amount: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goal-date">Target Date</Label>
                        <Input
                          id="goal-date"
                          type="date"
                          value={goalFormData.target_date}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, target_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goal-priority">Priority</Label>
                        <Select
                          value={goalFormData.priority}
                          onValueChange={(value: any) => setGoalFormData(prev => ({ ...prev, priority: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goal-description">Description</Label>
                        <Textarea
                          id="goal-description"
                          value={goalFormData.description}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create Goal</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading goals...</div>
            ) : (
              <div className="grid gap-4">
                {filteredGoals.map((goal) => {
                  const progressPercentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  const daysRemaining = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Card key={goal.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{goal.name}</h3>
                              <Badge className={getPriorityColor(goal.priority)}>
                                {goal.priority.toUpperCase()}
                              </Badge>
                              <Badge className={getStatusColor(goal.status)}>
                                {goal.status?.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Target: {new Date(goal.target_date).toLocaleDateString()}
                              {daysRemaining > 0 && ` (${daysRemaining} days left)`}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progressPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={progressPercentage} />
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-3">{goal.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredGoals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No goals found
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ExtensibleLayout>
  );
}
