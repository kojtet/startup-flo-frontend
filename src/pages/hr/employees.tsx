import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users2, Search, Plus, Mail, Phone, Loader2, Filter, X, Calendar, ChevronLeft, ChevronRight, Edit, Trash2, Eye } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useHR } from "@/hooks/useHR";
import type { Employee, CreateEmployeeData, UpdateEmployeeData, Department } from "@/apis";

export default function EmployeeDirectory() {
  const { user } = useAuth();
  const { 
    employees, 
    isLoadingEmployees, 
    employeesError, 
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchDepartments
  } = useHR();
  const { toast } = useToast();

  // Create a stable reference to toast for use in callbacks
  const toastRef = useCallback((options: any) => {
    toast(options);
  }, [toast]);

  // Fetch departments from API
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  // Use the actual employees from the HR API
  const employeesList: Employee[] = employees;

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployeeData, setNewEmployeeData] = useState<Partial<CreateEmployeeData>>({
    staff_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    position: "",
    date_of_birth: "",
    date_hired: "",
    status: "active"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState({
    department: "all",
    status: "all",
    position: "all",
    sortBy: "first_name",
    sortOrder: "asc",
    hiredDateFrom: "",
    hiredDateTo: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchData = async () => {
    if (user?.company_id) {
      try {
        await fetchEmployees();
      } catch (error) {
        console.error("❌ Employees Page: Failed to fetch employees:", error);
        toastRef({ title: "Error", description: "Could not load employees.", variant: "destructive" });
      }
    } else {
      console.log("⚠️ Employees Page: No company_id available, skipping employee fetch");
    }
  };

  const fetchDepartmentsData = async () => {
    if (user?.company_id) {
      setIsLoadingDepartments(true);
      try {
        const depts = await fetchDepartments();
        setDepartments(depts);
      } catch (error) {
        console.error("❌ Failed to fetch departments:", error);
        // Don't show error toast for departments - it's not critical for the main functionality
        // Just log the error and continue with empty departments list
        setDepartments([]);
      } finally {
        setIsLoadingDepartments(false);
      }
    } else {
      console.log("⚠️ No company_id available, skipping department fetch");
    }
  };

  useEffect(() => {
    if (user?.company_id) {
      // Only fetch data once when company_id is available
      fetchData();
      fetchDepartmentsData();
    } else {
      console.log("⚠️ Employees Page: useEffect triggered but no company_id available");
    }
  }, [user?.company_id]); // Only depend on company_id
  
  useEffect(() => {
    let updatedEmployees = employeesList;

    // Search term filter
    if (searchTerm) {
      updatedEmployees = updatedEmployees.filter(
        (emp) =>
          emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Advanced filters
    if (filters.department !== "all") {
      updatedEmployees = updatedEmployees.filter(emp => emp.department_id === filters.department);
    }
    if (filters.status !== "all") {
      updatedEmployees = updatedEmployees.filter(emp => (filters.status === "active" ? emp.status === "active" : emp.status !== "active"));
    }
    if (filters.position !== "all") {
      updatedEmployees = updatedEmployees.filter(emp => emp.position === filters.position);
    }
    if (filters.hiredDateFrom) {
      updatedEmployees = updatedEmployees.filter(emp => new Date(emp.date_hired) >= new Date(filters.hiredDateFrom));
    }
    if (filters.hiredDateTo) {
      updatedEmployees = updatedEmployees.filter(emp => new Date(emp.date_hired) <= new Date(filters.hiredDateTo));
    }

    // Sorting
    updatedEmployees.sort((a, b) => {
      const valA = (a as any)[filters.sortBy] || "";
      const valB = (b as any)[filters.sortBy] || "";
      if (valA < valB) return filters.sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredEmployees(updatedEmployees);
    setCurrentPage(1);
  }, [employeesList, searchTerm, filters]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.company_id) {
      toastRef({ title: "Error", description: "Company ID is missing.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        // Update employee
        await updateEmployee(editingEmployee.id, newEmployeeData as UpdateEmployeeData);
        toastRef({ title: "Success", description: "Employee updated successfully." });
      } else {
        // Create employee
        const employeeData: CreateEmployeeData = {
          ...newEmployeeData,
          staff_id: newEmployeeData.staff_id || "",
          first_name: newEmployeeData.first_name || "",
          last_name: newEmployeeData.last_name || "",
          email: newEmployeeData.email || "",
          phone: newEmployeeData.phone || "",
          department_id: newEmployeeData.department_id || "",
          position: newEmployeeData.position || "",
          date_of_birth: newEmployeeData.date_of_birth || "",
          date_hired: newEmployeeData.date_hired || new Date().toISOString().split('T')[0],
          status: newEmployeeData.status || "active"
        };
        await createEmployee(employeeData);
        toastRef({ title: "Success", description: "Employee added successfully." });
      }
      setIsAddDialogOpen(false);
      setEditingEmployee(null);
      setNewEmployeeData({
        staff_id: "",
        first_name: "",
        last_name: "",
        email: "",
        position: "",
        date_of_birth: "",
        date_hired: "",
        status: "active"
      });
      await fetchData(); // Refresh data
    } catch (error) {
      toastRef({
        title: "Error",
        description: "Failed to save employee.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit employee
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewEmployeeData({
      staff_id: employee.staff_id || "",
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      position: employee.position || "",
      date_of_birth: employee.date_of_birth || "",
      date_hired: employee.date_hired || "",
      status: employee.status || "active",
      department_id: employee.department_id || ""
    });
    setIsEditDialogOpen(true);
  };

  // Handle view employee
  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  // Handle delete employee
  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEmployee(employee.id);
      toastRef({ title: "Success", description: "Employee deleted successfully." });
      await fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toastRef({ title: "Error", description: "Failed to delete employee.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEmployee || !user?.company_id) {
      toastRef({ title: "Error", description: "Employee or company ID is missing.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateEmployee(selectedEmployee.id, newEmployeeData as UpdateEmployeeData);
      toastRef({ title: "Success", description: "Employee updated successfully." });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      setNewEmployeeData({
        staff_id: "",
        first_name: "",
        last_name: "",
        email: "",
        position: "",
        date_of_birth: "",
        date_hired: "",
        status: "active"
      });
      await fetchData(); // Refresh data
    } catch (error) {
      toastRef({
        title: "Error",
        description: "Failed to update employee.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Note: ExtensibleLayout doesn't accept user prop, so we don't need userForLayout


  if (isLoadingEmployees) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading employees...</span>
        </div>
      </ExtensibleLayout>
    );
  }

  // Show error state if there's an error
  if (employeesError) {
    return (
      <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading employees: {employeesError}</p>
            <div className="space-y-2">
              <Button onClick={fetchData}>Retry</Button>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://startup-flo-backend.onrender.com'}/hr/setup-module-access`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('sf_access_token')}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    const result = await response.json();
                    toastRef({ title: "Success", description: "HR module access setup completed. Please refresh the page." });
                  } catch (error) {
                    console.error("Setup failed:", error);
                    toastRef({ title: "Error", description: "Failed to setup HR module access.", variant: "destructive" });
                  }
                }}
              >
                Setup HR Access
              </Button>
            </div>
          </div>
        </div>
      </ExtensibleLayout>
    );
  }

  const stats = {
    total: employeesList.length,
    departments: departments.length,
    newHires: employeesList.filter(emp => new Date(emp.date_hired) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
    active: employeesList.filter(emp => emp.status === "active").length,
  };

  const getStatusBadge = (isActive?: boolean) => {
    if (isActive === undefined) return { variant: "outline" as const, className: "bg-gray-100 text-gray-800" };
    return isActive
      ? { variant: "default" as const, className: "bg-green-100 text-green-800" }
      : { variant: "secondary" as const, className: "bg-red-100 text-red-800" };
  };
  
  const hasActiveFilters = Object.values(filters).some(val => val !== "all" && val !== "" && val !== "first_name" && val !== "asc");

  const clearAllFilters = () => {
    setFilters({
      department: "all",
      status: "all",
      position: "all",
      sortBy: "first_name",
      sortOrder: "asc",
      hiredDateFrom: "",
      hiredDateTo: "",
    });
    setSearchTerm("");
  };

  const uniquePositions = Array.from(new Set(employeesList.map(emp => emp.position).filter(Boolean))) as string[];

  // Pagination logic
  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

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

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
            <p className="text-gray-600 mt-2">Manage your team members and their information</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={newEmployeeData.first_name || ""}
                      onChange={(e) => setNewEmployeeData(prev => ({ ...prev, first_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={newEmployeeData.last_name || ""}
                      onChange={(e) => setNewEmployeeData(prev => ({ ...prev, last_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmployeeData.email || ""}
                      onChange={(e) => setNewEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newEmployeeData.phone || ""}
                      onChange={(e) => setNewEmployeeData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={newEmployeeData.position || ""}
                      onChange={(e) => setNewEmployeeData(prev => ({ ...prev, position: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Status</Label>
                    <Select value={newEmployeeData.status || "active"} onValueChange={(value: "active" | "inactive" | "terminated") => setNewEmployeeData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={newEmployeeData.department_id || ""} onValueChange={(value) => setNewEmployeeData(prev => ({ ...prev, department_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {!Array.isArray(departments) || departments.length === 0 ? (
                          <SelectItem value="none" disabled>Loading departments...</SelectItem>
                        ) : (
                          departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={newEmployeeData.date_of_birth || ""}
                      onChange={(e) => setNewEmployeeData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_hired">Date Hired</Label>
                    <Input
                      id="date_hired"
                      type="date"
                      value={newEmployeeData.date_hired || ""}
                      onChange={(e) => setNewEmployeeData(prev => ({ ...prev, date_hired: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="staff_id">Staff ID</Label>
                    <Input
                      id="staff_id"
                      value={newEmployeeData.staff_id || ""}
                      onChange={(e) => setNewEmployeeData(prev => ({ ...prev, staff_id: e.target.value }))}
                      required
                      placeholder="Enter staff ID"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Employee
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_first_name">First Name</Label>
                  <Input
                    id="edit_first_name"
                    value={newEmployeeData.first_name || ""}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name">Last Name</Label>
                  <Input
                    id="edit_last_name"
                    value={newEmployeeData.last_name || ""}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={newEmployeeData.email || ""}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={newEmployeeData.phone || ""}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_job_title">Job Title</Label>
                  <Input
                    id="edit_job_title"
                    value={newEmployeeData.position || ""}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, position: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_role">Status</Label>
                  <Select value={newEmployeeData.status || "active"} onValueChange={(value: "active" | "inactive" | "terminated") => setNewEmployeeData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_department">Department</Label>
                  <Select value={newEmployeeData.department_id || ""} onValueChange={(value) => setNewEmployeeData(prev => ({ ...prev, department_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {!Array.isArray(departments) || departments.length === 0 ? (
                        <SelectItem value="none" disabled>Loading departments...</SelectItem>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                  <Input
                    id="edit_date_of_birth"
                    type="date"
                    value={newEmployeeData.date_of_birth || ""}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_date_hired">Date Hired</Label>
                  <Input
                    id="edit_date_hired"
                    type="date"
                    value={newEmployeeData.date_hired || ""}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, date_hired: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_staff_id">Staff ID</Label>
                  <Input
                    id="edit_staff_id"
                    value={newEmployeeData.staff_id || ""}
                    onChange={(e) => setNewEmployeeData(prev => ({ ...prev, staff_id: e.target.value }))}
                    required
                    placeholder="Enter staff ID"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Employee
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Employee Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {selectedEmployee.first_name?.[0] || 'U'}{selectedEmployee.last_name?.[0] || 'N'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedEmployee.first_name} {selectedEmployee.last_name}</h3>
                    <p className="text-gray-600">{selectedEmployee.position || 'No position set'}</p>
                    <Badge className={selectedEmployee.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {selectedEmployee.status === "active" ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Staff ID</Label>
                    <p className="text-sm">{selectedEmployee.staff_id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-sm">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-sm">{selectedEmployee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Department</Label>
                    <p className="text-sm">
                      {selectedEmployee.departments?.name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                    <p className="text-sm">{selectedEmployee.date_of_birth ? new Date(selectedEmployee.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date Hired</Label>
                    <p className="text-sm">{new Date(selectedEmployee.date_hired).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.departments}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newHires}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle>Employee List</CardTitle>
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
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={hasActiveFilters ? "bg-blue-50 border-blue-200" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Filters & Sorting</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Department Filter */}
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All departments</SelectItem>
                        {Array.isArray(departments) && departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Position Filter */}
                  <div>
                    <Label className="text-sm font-medium">Position</Label>
                    <Select value={filters.position} onValueChange={(value) => setFilters(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All positions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All positions</SelectItem>
                        {uniquePositions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <Label className="text-sm font-medium">Sort By</Label>
                    <div className="flex space-x-2">
                      <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first_name">First Name</SelectItem>
                          <SelectItem value="last_name">Last Name</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="position">Position</SelectItem>
                          <SelectItem value="date_hired">Join Date</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" }))}
                        className="px-3"
                      >
                        {filters.sortOrder === "asc" ? "↑" : "↓"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Date Range Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Hired Date From</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={filters.hiredDateFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, hiredDateFrom: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Hired Date To</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        value={filters.hiredDateTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, hiredDateTo: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="flex justify-between items-center pt-2 border-t text-sm text-gray-600">
                  <div>
                    Showing {filteredEmployees.length} of {employeesList.length} employees
                    {hasActiveFilters && (
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
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedEmployees.map((employee) => {
                const statusBadge = getStatusBadge(employee.status === "active");
                // Handle department field - it could be string or object
                const departmentName: string = employee.departments?.name || 'N/A';
                return (
                  <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {employee.first_name?.[0] || 'U'}{employee.last_name?.[0] || 'N'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-0.5">
                          <h3 className="font-medium text-gray-900 text-sm">{employee.first_name} {employee.last_name}</h3>
                          <Badge {...statusBadge} className={`text-xs ${statusBadge.className}`}>
                            {employee.status === "active" ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{employee.position || 'No position set'}</span>
                          <span>•</span>
                          <span>{departmentName}</span>
                          <span>•</span>
                          <span>Staff ID: {employee.staff_id || 'N/A'}</span>
                          <span>•</span>
                          <span>Joined: {new Date(employee.date_hired).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{employee.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewEmployee(employee)}
                        title="View Employee"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditEmployee(employee)}
                        title="Edit Employee"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteEmployee(employee)}
                        disabled={isDeleting}
                        title="Delete Employee"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {paginatedEmployees.length === 0 && filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || hasActiveFilters ? 'No employees found matching your criteria.' : 'No employees found.'}
                </div>
              )}
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
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
} 
