import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { settingsSidebarSections } from '@/components/sidebars/SettingsSidebar';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  // Tabs, // Unused
  // TabsContent, // Unused
  // TabsList, // Unused
  // TabsTrigger, // Unused
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  // Building, // Unused
  Shield,
  // Settings, // Unused
  // Mail, // Unused
  // Phone, // Unused
  Calendar,
  // MapPin, // Unused
  // Eye, // Unused
  // EyeOff, // Unused
  Save,
  UserPlus,
  Search,
  Filter,
  Download,
  // Upload, // Unused
  // User, // Unused
  // Lock, // Unused
  // CreditCard, // Unused
  // Bell, // Unused
  // Palette, // Unused
  // Languages, // Unused
  // Users as UsersIcon, // Duplicate, Users is already imported
  // Briefcase, // Unused
  // ShieldCheck, // Unused
  // FileText, // Unused
  // ExternalLink, // Unused
  // Info, // Unused
  // Edit3, // Unused
  // Trash2 as Trash2Icon, // Duplicate, Trash2 is already imported
  // PlusCircle, // Unused
  // Building2, // Unused
  // Settings2, // Unused
  // Mail as MailIcon, // Unused
  // PhoneCall, // Unused
  // MapPin as MapPinIcon, // Unused
  // Eye as EyeIcon, // Unused
  // EyeOff as EyeOffIcon, // Unused
  // UploadCloud, // Unused
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useUser } from '@/contexts/UserContext';
// import { api } from '@/apis'; // Unused
import type { 
  // Company, // Unused
  Department as ApiDepartment, // Used for contextDepartments
  User as AppUser, // Changed from AppUser to User to match context
  UpdateCompanyData, 
  UpdateProfileData, 
  // CreateDepartmentData, // Unused
  // UpdateDepartmentData, // Unused
  // CreateUserData, // Unused
  // UpdateUserData, // Unused
} from '@/apis/types';
import { ApiError } from '@/apis/core/errors';
import { useToast } from '@/hooks/use-toast';

// Types for our data structures
// interface Employee { // Unused local interface
//   id: string;
//   staff_id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone?: string;
//   job_title?: string;
//   department_id?: string;
//   department_name?: string;
//   hire_date?: string;
//   is_active: boolean;
//   avatar_url?: string;
// }

interface DepartmentUI {
  id: string;
  name: string;
  manager_id?: string;
  manager_name?: string;
  employee_count: number;
  created_at: string;
}

interface AccessRoleUI {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
}

const SettingsPage = () => {
  const { toast } = useToast(); // Keep toast
  const { user: authUser, companyId, /* updateUser: updateAuthUser // Unused */ } = useAuth();
  const { company, /* isLoading: isLoadingCompany, // Unused */ /* error: companyError, // Unused */ /* fetchCompany, // Unused */ /* updateCompany // Unused */ } = useCompany();
  const { userProfile: contextUser, /* isLoading: isLoadingUsers, // Unused */ /* error: usersError, // Unused */ /* fetchUsers, // Unused */ /* createUser, // Unused */ /* updateContextUser, // Unused */ /* deleteUser // Unused */ } = useUser();
  const { /* departments: contextDepartments, // Unused */ /* isLoading: isLoadingDepartments, // Unused */ /* error: departmentsError, // Unused */ /* fetchDepartments, // Unused */ /* createDepartment, // Unused */ /* updateDepartment: updateContextDepartment, // Unused */ /* deleteDepartment // Unused */ } = useCompany();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general"); // Default to general
  const [profileData, setProfileData] = useState<Partial<UpdateProfileData>>({}); // Keep
  const [companyData, setCompanyData] = useState<Partial<UpdateCompanyData>>({}); // Keep
  // const [showPassword, setShowPassword] = useState(false); // Unused
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Unused

  // const [isSheetOpen, setIsSheetOpen] = useState(false); // Unused
  // const [sheetMode, setSheetMode] = useState<"addEmployee" | "editEmployee" | "addDepartment" | "editDepartment">("addEmployee"); // Unused

  // const [currentEmployee, setCurrentEmployee] = useState<AppUser | null>(null); // Unused
  // const [employeeFormData, setEmployeeFormData] = useState<Partial<CreateUserData | UpdateUserData>>({}); // Unused

  // const [currentDepartment, setCurrentDepartment] = useState<DepartmentUI | null>(null); // Unused
  // const [departmentFormData, setDepartmentFormData] = useState<Partial<CreateDepartmentData | UpdateDepartmentData>>({}); // Unused
  
  const [departments, setDepartments] = useState<DepartmentUI[]>([]);
  const [employees, setEmployees] = useState<AppUser[]>([]);
  const [accessRoles, setAccessRoles] = useState<AccessRoleUI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentUI | null>(null);
  const [showEditDepartment, setShowEditDepartment] = useState(false); // Keep if edit functionality is there
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<AppUser | null>(null); // Keep if edit functionality is there
  const [showEditEmployee, setShowEditEmployee] = useState(false); // Keep if edit functionality is there


  const getCurrentSection = useCallback(() => {
    const hash = router.asPath.split("#")[1];
    if (hash) {
      setActiveTab(hash);
    }
  }, [router.asPath]);

  useEffect(() => {
    if (authUser) {
      setProfileData({
        first_name: authUser.first_name || "",
        last_name: authUser.last_name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        job_title: authUser.job_title || "",
      });
    }
    if (company) {
      setCompanyData({
        name: company.name || "",
        industry: company.industry || "",
        website: company.website || "",
        // Add other company fields
      });
    }
    // Note: fetchUsers and fetchDepartments are not available in the current context structure
    // This would need to be implemented in a UserManagementContext
    getCurrentSection();
  }, [authUser, company, companyId, getCurrentSection]);

  // Mock data for demonstration
  useEffect(() => {
    // Mock departments data since contextDepartments is not available
    setDepartments([
      { id: '1', name: 'Engineering', manager_id: 'emp-1', manager_name: 'John Doe', employee_count: 12, created_at: '2024-01-15' },
      { id: '2', name: 'Marketing', manager_id: 'emp-2', manager_name: 'Jane Smith', employee_count: 8, created_at: '2024-01-10' },
      { id: '3', name: 'Sales', manager_id: 'emp-3', manager_name: 'Bob Johnson', employee_count: 15, created_at: '2024-01-05' },
      { id: '4', name: 'HR', manager_id: 'emp-4', manager_name: 'Alice Wilson', employee_count: 5, created_at: '2024-01-12' },
    ]);

    // Mock employees data since contextUsers is not available
    setEmployees([
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1234567890',
        job_title: 'Senior Developer',
        department_id: '1', 
        created_at: '2024-01-15', 
        updated_at: '2024-01-15',
        is_active: true,
        role: 'employee',
      },
    ]);

    setAccessRoles([
      {
        id: '1',
        name: 'Admin',
        description: 'Full system access with all permissions',
        permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
        user_count: 2,
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Department management and reporting access',
        permissions: ['read', 'write', 'manage_team'],
        user_count: 5,
      },
      {
        id: '3',
        name: 'Employee',
        description: 'Basic access to personal data and company resources',
        permissions: ['read'],
        user_count: 25,
      },
    ]);
  }, []);

  const filteredEmployees = employees.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DepartmentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-muted-foreground">
            Manage your company departments and organizational structure
          </p>
        </div>
        <Dialog open={showAddDepartment} onOpenChange={setShowAddDepartment}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Create a new department for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dept-name" className="text-right">
                  Department Name
                </Label>
                <Input id="dept-name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dept-manager" className="text-right">
                  Manager
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">John Doe</SelectItem>
                    <SelectItem value="2">Jane Smith</SelectItem>
                    <SelectItem value="3">Bob Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dept-description" className="text-right">
                  Description
                </Label>
                <Textarea id="dept-description" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDepartment(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddDepartment(false)}>
                Create Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{dept.name}</CardTitle>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setShowEditDepartment(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Department</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the {dept.name} department? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {dept.employee_count} employees
                </div>
                {dept.manager_name && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Shield className="mr-2 h-4 w-4" />
                    Manager: {dept.manager_name}
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Created: {new Date(dept.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const EmployeesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
          <p className="text-muted-foreground">
            Manage employee information and access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Add a new employee to your organization
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emp-first-name">First Name</Label>
                    <Input id="emp-first-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-last-name">Last Name</Label>
                    <Input id="emp-last-name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emp-email">Email</Label>
                    <Input id="emp-email" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-phone">Phone</Label>
                    <Input id="emp-phone" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emp-job-title">Job Title</Label>
                    <Input id="emp-job-title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-department">Department</Label>
                    <Select>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-hire-date">Hire Date</Label>
                  <Input id="emp-hire-date" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddEmployee(false)}>
                  Add Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Staff ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
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
                <TableCell>N/A</TableCell>
                <TableCell>{(departments.find(d => d.id === employee.department_id))?.name || 'N/A'}</TableCell>
                <TableCell>{employee.job_title || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                    {employee.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowEditEmployee(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                          <AlertDialogAction>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const AccessControlTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Access Control</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-4">
        {accessRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{role.name}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {role.user_count} users assigned
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Permissions:</h4>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary">
                        {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const GeneralSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">General Settings</h2>
        <p className="text-muted-foreground">
          Configure your company settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="Acme Corporation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-industry">Industry</Label>
                <Input id="company-industry" defaultValue="Technology" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-email">Email</Label>
                <Input id="company-email" type="email" defaultValue="contact@acme.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone</Label>
                <Input id="company-phone" defaultValue="+1 (555) 123-4567" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Textarea id="company-address" defaultValue="123 Business Ave, Suite 100&#10;City, State 12345" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Configure system preferences and defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive email notifications for important updates
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <div className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </div>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                    <SelectItem value="cst">Central Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Get the current page based on the URL or activeTab
  const getCurrentPageContent = () => {
    switch (activeTab) {
      case 'departments':
        return <DepartmentsTab />;
      case 'employees':
        return <EmployeesTab />;
      case 'access':
        return <AccessControlTab />;
      case 'general':
      default:
        return <GeneralSettingsTab />;
    }
  };

  return (
    <ExtensibleLayout 
      moduleSidebar={settingsSidebarSections}
      moduleTitle="Settings"
      user={{
        name: authUser?.first_name && authUser?.last_name ? `${authUser.first_name} ${authUser.last_name}` : 'User',
        email: authUser?.email || '',
        role: authUser?.role || 'Employee',
        avatarUrl: authUser?.avatar_url
      }}
    >
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        
        {getCurrentPageContent()}
      </div>
    </ExtensibleLayout>
  );
};

export default SettingsPage;
