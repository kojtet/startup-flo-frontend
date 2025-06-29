import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  CheckCircle,
  Loader2,
  Plus,
  X,
  Users2,
  Clock,
  ClipboardCheck,
  Search,
  Edit2,
  Save,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/apis";
import type { Employee, Onboarding, CreateOnboardingData, OnboardingTask } from "@/apis/types";
import { useToast } from "@/hooks/use-toast";

// Helper type for UI - with completion tracking
interface OnboardingWithTaskList extends Omit<Onboarding, "checklist"> {
  checklist: OnboardingTask[]; // Using the proper OnboardingTask type
  employee?: Employee;
}

export default function OnboardingTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [onboardings, setOnboardings] = useState<OnboardingWithTaskList[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOnboarding, setEditingOnboarding] = useState<string | null>(null);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // New onboarding form state - using proper OnboardingTask objects
  const [newOnboarding, setNewOnboarding] = useState<CreateOnboardingData>({
    employee_id: "",
    start_date: new Date().toISOString().split('T')[0],
    status: "in_progress",
    checklist: [
      { task: "Complete paperwork", completed: false },
      { task: "Setup workstation", completed: false },
      { task: "Orientation meeting", completed: false },
      { task: "IT account setup", completed: false },
      { task: "Security briefing", completed: false },
      { task: "Department introduction", completed: false }
    ]
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [onboardingsData, employeesData] = await Promise.all([
        api.hr.getOnboardings(),
        api.hr.getEmployees()
      ]);
      
      // Transform onboarding data to match UI expectations
      const transformedOnboardings = onboardingsData.map((onboarding): OnboardingWithTaskList => {
        // Find the employee data using staff_id
        const employee = employeesData.find(emp => emp.staff_id === onboarding.employee_id);
        
        // Normalize checklist data to ensure consistent structure
        const normalizedChecklist = (onboarding.checklist || []).map((item: any) => {
          if (typeof item === 'string') {
            return { task: item, completed: false };
          } else if (item && typeof item === 'object') {
            return {
              task: item.task || item.description || 'Unnamed Task',
              completed: Boolean(item.completed)
            };
          } else {
            return { task: 'Invalid Task', completed: false };
          }
        });
        
        return {
          ...onboarding,
          employee,
          checklist: normalizedChecklist
        };
      });

      setOnboardings(transformedOnboardings);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for creating onboarding
  const handleCreateOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const createdOnboarding = await api.hr.createOnboarding(newOnboarding);
      
      // Transform and add to state
      const employee = employees.find(emp => emp.staff_id === createdOnboarding.employee_id);
      const transformedOnboarding: OnboardingWithTaskList = {
        ...createdOnboarding,
        employee
      };
      
      setOnboardings(prev => [...prev, transformedOnboarding]);
      setIsCreateDialogOpen(false);
      
      // Reset form
      setNewOnboarding({
        employee_id: "",
        start_date: new Date().toISOString().split('T')[0],
        status: "in_progress",
        checklist: [
          { task: "Complete paperwork", completed: false },
          { task: "Setup workstation", completed: false },
          { task: "Orientation meeting", completed: false },
          { task: "IT account setup", completed: false },
          { task: "Security briefing", completed: false },
          { task: "Department introduction", completed: false }
        ]
      });
      
      // Reset search
      setEmployeeSearchTerm("");
      
      toast({
        title: "Onboarding process created successfully!",
        description: "The onboarding process has been created successfully."
      });
    } catch (error: any) {
      console.error('Error creating onboarding:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create onboarding process. Please try again.';
      toast({
        title: "Error",
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark onboarding as completed using the complete endpoint
  const markAsCompleted = async (onboardingId: string) => {
    try {
      // Use the HR service complete method
      await api.hr.completeOnboarding(onboardingId);

      // Update local state
      setOnboardings(prev => prev.map(o => 
        o.id === onboardingId 
          ? {
              ...o,
              status: 'completed',
              completed: true
            }
          : o
      ));

      toast({
        title: "Onboarding completed!",
        description: "The onboarding process has been marked as completed."
      });
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast({
        title: "Error",
        description: 'Failed to mark onboarding as completed. Please try again.'
      });
    }
  };

  // Add task to list
  const addTaskToList = async (onboardingId: string, task: string) => {
    try {
      const onboarding = onboardings.find(o => o.id === onboardingId);
      if (!onboarding) return;

      // Add task to the list with completed false
      const updatedChecklist = [...onboarding.checklist, { task, completed: false }];
      
      // Call the HR service update method
      await api.hr.updateOnboardingChecklist(onboardingId, {
        checklist: updatedChecklist
      });
      
      // Update local state
      setOnboardings(prev => prev.map(o => 
        o.id === onboardingId 
          ? {
              ...o,
              checklist: updatedChecklist
            }
          : o
      ));
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: 'Failed to add task. Please try again.'
      });
    }
  };

  // Mark task as complete/incomplete using the checklist endpoint
  const updateTaskCompletion = async (onboardingId: string, taskIndex: number, completed: boolean) => {
    try {
      const onboarding = onboardings.find(o => o.id === onboardingId);
      if (!onboarding) return;

      // Update the specific task's completion status
      const updatedChecklist = onboarding.checklist.map((item, index) => 
        index === taskIndex ? { ...item, completed } : item
      );
      
      // Use the HR service checklist update method
      await api.hr.updateOnboardingChecklist(onboardingId, {
        checklist: updatedChecklist
      });
      
      // Update local state
      setOnboardings(prev => prev.map(o => 
        o.id === onboardingId 
          ? {
              ...o,
              checklist: updatedChecklist
            }
          : o
      ));
    } catch (error) {
      console.error('Error updating task completion:', error);
      toast({
        title: "Error",
        description: 'Failed to update task completion. Please try again.'
      });
    }
  };

  // Calculate completion progress
  const calculateProgress = (checklist: OnboardingTask[]) => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  // Filter onboarding processes based on search and status
  const filteredOnboardings = onboardings.filter(onboarding => {
    // Search filter
    const searchMatch = !searchTerm || 
      `${onboarding.employee?.first_name || ''} ${onboarding.employee?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onboarding.employee?.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onboarding.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onboarding.employee?.staff_id?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const statusMatch = statusFilter === "all" || onboarding.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Get available employees (not already in onboarding)
  const availableEmployees = employees.filter(emp => 
    !onboardings.some(onb => onb.employee_id === emp.staff_id)
  );

  // Filter employees based on search term
  const filteredEmployees = availableEmployees.filter(employee => {
    if (!employeeSearchTerm) return true;
    const searchLower = employeeSearchTerm.toLowerCase();
    return (
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchLower) ||
      employee.position.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.staff_id.toLowerCase().includes(searchLower) ||
      (employee.departments?.name || '').toLowerCase().includes(searchLower)
    );
  });

  // Get selected employee for display
  const selectedEmployee = availableEmployees.find(emp => emp.staff_id === newOnboarding.employee_id);

  // Handle employee selection
  const handleEmployeeSelect = (employee: Employee) => {
    setNewOnboarding(prev => ({ ...prev, employee_id: employee.staff_id }));
    setEmployeeSearchTerm("");
    setEmployeeSearchOpen(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (employeeSearchOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.employee-autocomplete')) {
          setEmployeeSearchOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [employeeSearchOpen]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'paused': return 'Paused';
      default: return status;
    }
  };

  // Pagination logic
  const totalItems = filteredOnboardings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOnboardings = filteredOnboardings.slice(startIndex, endIndex);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // Calculate statistics
  const stats = {
    total: onboardings.length,
    completed: onboardings.filter(o => o.status === 'completed').length,
    inProgress: onboardings.filter(o => o.status === 'in_progress').length,
    avgDuration: 14 // This could be calculated from completed onboardings
  };

  const userForLayout = {
    name: user ? (`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email) : 'Guest',
    email: user?.email || 'guest@example.com',
    role: user?.role || 'User',
    avatarUrl: user?.avatar_url || undefined
  };

  if (loading) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={userForLayout}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={userForLayout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Onboarding Tracker</h1>
            <p className="text-gray-600 mt-2">Monitor new employee onboarding progress and tasks</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Start Onboarding
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Start New Onboarding Process</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOnboarding} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee">Employee</Label>
                    <div className="relative employee-autocomplete">
                      {/* Show input when searching or no employee selected */}
                      {(!selectedEmployee || employeeSearchTerm) && (
                        <Input
                          type="text"
                          placeholder="Type to search employees..."
                          value={employeeSearchTerm}
                          onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                          onFocus={() => setEmployeeSearchOpen(true)}
                          className="w-full"
                        />
                      )}
                      
                      {/* Selected employee display */}
                      {selectedEmployee && !employeeSearchTerm && (
                        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2">
                          <div 
                            className="flex-1 cursor-pointer" 
                            onClick={() => {
                              setEmployeeSearchTerm(`${selectedEmployee.first_name} ${selectedEmployee.last_name}`);
                              setEmployeeSearchOpen(true);
                            }}
                          >
                            <div className="font-medium text-gray-900 truncate">
                              {selectedEmployee.first_name} {selectedEmployee.last_name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {selectedEmployee.position}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-6 px-2 text-xs text-gray-400 hover:text-gray-600"
                            onClick={() => {
                              setNewOnboarding(prev => ({ ...prev, employee_id: "" }));
                              setEmployeeSearchTerm("");
                              setEmployeeSearchOpen(false);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Autocomplete suggestions */}
                      {employeeSearchOpen && employeeSearchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredEmployees.length === 0 ? (
                            <div className="p-3 text-sm text-gray-500 text-center">
                              No employees found matching "{employeeSearchTerm}"
                            </div>
                          ) : (
                            filteredEmployees.map((employee) => (
                              <div
                                key={employee.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleEmployeeSelect(employee)}
                              >
                                <div className="font-medium text-gray-900">
                                  {employee.first_name} {employee.last_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {employee.position} • {employee.email}
                                </div>
                                <div className="text-xs text-gray-400">
                                  ID: {employee.staff_id} • {employee.departments?.name || 'No Department'}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    
                    {availableEmployees.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        All employees are already in onboarding processes
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newOnboarding.start_date}
                      onChange={(e) => setNewOnboarding(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Default Task List</Label>
                  <div className="space-y-2 mt-2 border rounded-lg p-4">
                    {newOnboarding.checklist.map((taskObj, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{taskObj.task}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updatedChecklist = newOnboarding.checklist.filter((_, i) => i !== index);
                            setNewOnboarding(prev => ({ ...prev, checklist: updatedChecklist }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex space-x-2 mt-3 pt-3 border-t">
                      <Input
                        placeholder="Add new task..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const task = (e.target as HTMLInputElement).value.trim();
                            if (task) {
                              setNewOnboarding(prev => ({
                                ...prev,
                                checklist: [...prev.checklist, { task, completed: false }]
                              }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add new task..."]') as HTMLInputElement;
                          const task = input?.value.trim();
                          if (task) {
                            setNewOnboarding(prev => ({
                              ...prev,
                              checklist: [...prev.checklist, { task, completed: false }]
                            }));
                            input.value = '';
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !newOnboarding.employee_id}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Start Onboarding
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Onboarding</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total processes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Ongoing processes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgDuration}</div>
              <p className="text-xs text-muted-foreground">Days to complete</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle>Onboarding Progress</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search employees..." 
                    className="pl-10 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b text-sm text-gray-600">
              <div>
                Showing {filteredOnboardings.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalItems)} of {totalItems} onboarding processes
                {(searchTerm || statusFilter !== "all") && (
                  <span className="ml-2 text-blue-600">
                    (filtered)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-xs">Items per page:</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredOnboardings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== "all" ? 
                  'No onboarding processes found matching your criteria.' : 
                  'No onboarding processes found. Start a new onboarding process to get started.'
                }
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Position</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Start Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOnboardings.map((onboarding) => {
                        const progress = calculateProgress(onboarding.checklist);
                        return (
                          <tr key={onboarding.id} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {onboarding.employee?.first_name || 'Unknown'} {onboarding.employee?.last_name || 'Employee'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {onboarding.employee?.staff_id}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-gray-900">
                                {onboarding.employee?.position || 'Unknown Position'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {onboarding.employee?.departments?.name || 'No Department'}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {new Date(onboarding.start_date).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{progress}%</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {onboarding.checklist.filter(t => t.completed).length} of {onboarding.checklist.length} tasks
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={getStatusColor(onboarding.status)}>
                                {getStatusDisplayName(onboarding.status)}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Ensure data is normalized before storing in localStorage
                                  const normalizedOnboarding = {
                                    ...onboarding,
                                    checklist: onboarding.checklist.map((item: any) => {
                                      if (typeof item === 'string') {
                                        return { task: item, completed: false };
                                      } else if (item && typeof item === 'object') {
                                        return {
                                          task: item.task || item.description || 'Unnamed Task',
                                          completed: Boolean(item.completed)
                                        };
                                      } else {
                                        return { task: 'Invalid Task', completed: false };
                                      }
                                    })
                                  };
                                  
                                  // Store normalized onboarding data in localStorage for the view page
                                  localStorage.setItem('currentOnboarding', JSON.stringify(normalizedOnboarding));
                                  router.push(`/hr/onboarding/${onboarding.id}`);
                                }}
                              >
                                View
                              </Button>
                                {onboarding.status !== 'completed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markAsCompleted(onboarding.id)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t">
                    <div className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-1">
                        {getPageNumbers().map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        ))}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="text-gray-500">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(totalPages)}
                              className="w-8 h-8 p-0"
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
} 
