import React, { useState, useEffect, useCallback } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { settingsSidebarSections } from '@/components/sidebars/SettingsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/apis';
import type { User, CreateUserData, UpdateUserData, Department } from '@/apis/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  UserPlus,
  Download,
  Upload,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface EmployeeFormData extends Partial<CreateUserData> {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  department_id?: string;
  hire_date?: string;
  is_active: boolean;
}

const EmployeeForm = ({ 
  formData, 
  setFormData,
  departments,
  isEdit = false
}: { 
  formData: EmployeeFormData;
  setFormData: (data: EmployeeFormData) => void;
  departments: Department[];
  isEdit?: boolean;
}) => (
  <div className="grid gap-4 py-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name *</Label>
        <Input
          id="first-name"
          placeholder="Enter first name"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name *</Label>
        <Input
          id="last-name"
          placeholder="Enter last name"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
        />
      </div>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="email">Email *</Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter email address"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        disabled={isEdit}
      />
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="Enter phone number"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="job-title">Job Title</Label>
        <Input
          id="job-title"
          placeholder="Enter job title"
          value={formData.job_title || ''}
          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
        />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select 
          value={formData.department_id || ''} 
          onValueChange={(value) => setFormData({ ...formData, department_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hire-date">Hire Date</Label>
        <Input
          id="hire-date"
          type="date"
          value={formData.hire_date || ''}
          onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
        />
      </div>
    </div>
  </div>
);

const EmployeesPage = () => {
  const { user, companyId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_title: '',
    department_id: '',
    hire_date: '',
    is_active: true,
  });

  const loadEmployees = useCallback(async () => {
    if (companyId) {
      setLoading(true);
      try {
        const fetchedEmployees = await api.user.getCompanyUsers(companyId);
        setEmployees(fetchedEmployees || []);
      } catch (err) {
        const error = err as Error;
        console.error("Failed to load employees:", error.message);
        toast({ 
          title: "Error", 
          description: "Failed to load employees.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    }
  }, [companyId]);

  const loadDepartments = useCallback(async () => {
    if (companyId) {
      try {
        const fetchedDepartments = await api.departments.getCompanyDepartments(companyId);
        setDepartments(fetchedDepartments || []);
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    }
  }, [companyId]);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [loadEmployees, loadDepartments]);

  const handleAddEmployee = async () => {
    try {
      if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
        toast({
          title: 'Validation Error',
          description: 'First name, last name, and email are required',
          variant: 'destructive',
        });
        return;
      }

      if (!companyId) {
        toast({
          title: 'Error',
          description: 'No company ID available',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      
      const employeeData: CreateUserData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        job_title: formData.job_title,
        department_id: formData.department_id,
        company_id: companyId,
        role: 'employee',
        is_active: formData.is_active,
      };
      
      await api.user.createUser(employeeData);
      
      toast({
        title: 'Success',
        description: 'Employee added successfully',
      });
      
      setShowAddDialog(false);
      resetForm();
      loadEmployees();
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Error',
        description: error.message || 'Failed to add employee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async () => {
    try {
      if (!selectedEmployee || !formData.first_name.trim() || !formData.last_name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'First name and last name are required',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      
      const updateData: UpdateUserData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        job_title: formData.job_title,
        department_id: formData.department_id,
        is_active: formData.is_active,
      };
      
      await api.user.updateUser(selectedEmployee.id, updateData);
      
      toast({
        title: 'Success',
        description: 'Employee updated successfully',
      });
      
      setShowEditDialog(false);
      resetForm();
      loadEmployees();
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee: User) => {
    try {
      setLoading(true);
      await api.user.deleteUser(employee.id);
      
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      
      loadEmployees();
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete employee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (employee: User) => {
    setSelectedEmployee(employee);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || '',
      job_title: employee.job_title || '',
      department_id: employee.department_id || '',
      hire_date: employee.hire_date || '',
      is_active: employee.is_active,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      job_title: '',
      department_id: '',
      hire_date: '',
      is_active: true,
    });
    setSelectedEmployee(null);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.job_title && employee.job_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = !filterDepartment || employee.department_id === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return 'No Department';
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  };

  return (
    <ExtensibleLayout 
      moduleSidebar={settingsSidebarSections}
      moduleTitle="Settings"
      user={{
        name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User',
        email: user?.email || '',
        role: user?.role || 'Employee',
        avatarUrl: user?.avatar_url
      }}
    >
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage your organization's employees
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Enter the employee's information below.
                  </DialogDescription>
                </DialogHeader>
                <EmployeeForm 
                  formData={formData} 
                  setFormData={setFormData}
                  departments={departments}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmployee} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Employee'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>
              A list of all employees in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading employees...
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={employee.avatar_url} />
                              <AvatarFallback>
                                {employee.first_name?.[0]}{employee.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {employee.first_name} {employee.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                            {getDepartmentName(employee.department_id)}
                          </div>
                        </TableCell>
                        <TableCell>{employee.job_title || 'Not specified'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                              {employee.email}
                            </div>
                            {employee.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                                {employee.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.is_active ? "default" : "secondary"}>
                            {employee.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {employee.first_name} {employee.last_name}? 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteEmployee(employee)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Employee Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update the employee's information below.
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm 
              formData={formData} 
              setFormData={setFormData}
              departments={departments}
              isEdit={true}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditEmployee} disabled={loading}>
                {loading ? 'Updating...' : 'Update Employee'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
};

export default EmployeesPage; 