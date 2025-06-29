import React, { useState, useEffect, useCallback } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { settingsSidebarSections } from '@/components/sidebars/SettingsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/apis';
import type { Department, CreateDepartmentData, UpdateDepartmentData, User } from '@/apis/types';
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
  Building,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  Mail,
  Briefcase,
  User as UserIcon,
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

// Types for department data (extends the API Department type for UI purposes)
interface DepartmentUI extends Department {
  description?: string;
  manager_name?: string;
  manager_email?: string;
  manager_avatar?: string;
  employee_count: number;
  is_active: boolean;
}

interface DepartmentFormData {
  name: string;
}

// DepartmentForm component moved outside to prevent re-rendering
const DepartmentForm = ({ 
  formData, 
  setFormData 
}: { 
  formData: DepartmentFormData;
  setFormData: (data: DepartmentFormData) => void;
}) => (
  <div className="grid gap-4 py-4">
    <div className="space-y-2">
      <Label htmlFor="dept-name">Department Name *</Label>
      <Input
        id="dept-name"
        placeholder="Enter department name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
    </div>
  </div>
);

const DepartmentsPage = () => {
  const { user, companyId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentUI[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentUI | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
  });

  const loadDepartments = useCallback(async () => {
    if (companyId) {
      setLoading(true);
      try {
        const fetchedDepartments = await api.departments.getCompanyDepartments(companyId);
        
        // Transform API departments to UI departments
        const departmentsUI: DepartmentUI[] = fetchedDepartments.map(dept => ({
          ...dept,
          description: '',
          manager_name: dept.manager ? `${dept.manager.first_name} ${dept.manager.last_name}` : undefined,
          manager_email: dept.manager?.email,
          manager_avatar: (dept.manager as any)?.avatar_url,
          employee_count: 0, // This would need to be calculated from actual employee data
          is_active: true,
        }));
        
        setDepartments(departmentsUI);
        
        // Get company users (Note: this API might not exist yet)
        try {
          const fetchedUsers = await api.user.getCompanyUsers(companyId);
          setUsers(fetchedUsers || []);
        } catch (userError) {
          console.warn('Failed to fetch users:', userError);
          // Continue without users for now
          setUsers([]);
        }
      } catch (err) {
        const error = err as Error;
        console.error("Failed to load departments:", error.message || "Unknown error");
        toast({ 
          title: "Error", 
          description: error.message || "Failed to load departments.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    }
  }, [companyId]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleAddDepartment = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Department name is required',
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
      
      const departmentData: CreateDepartmentData = {
        name: formData.name,
        company_id: companyId,
      };
      
      const newApiDept = await api.departments.createDepartment(departmentData);

      // Transform API department to UI department
      const newDepartment: DepartmentUI = {
        ...newApiDept,
        description: '',
        manager_name: newApiDept.manager ? `${newApiDept.manager.first_name} ${newApiDept.manager.last_name}` : undefined,
        manager_email: newApiDept.manager?.email,
        manager_avatar: (newApiDept.manager as any)?.avatar_url,
        employee_count: 0,
        is_active: true,
      };

      setDepartments([...departments, newDepartment]);
      setShowAddDialog(false);
      setFormData({ name: '' });
      
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        title: 'Error',
        description: 'Failed to create department',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!selectedDepartment) return;

    try {
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Department name is required',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      
      const updateData: UpdateDepartmentData = {
        name: formData.name,
      };
      
      const updatedApiDept = await api.departments.updateDepartment(selectedDepartment.id, updateData);

      // Update departments list
      const updatedDepartments = departments.map(dept =>
        dept.id === selectedDepartment.id
          ? {
              ...updatedApiDept,
              description: dept.description,
              manager_name: updatedApiDept.manager ? `${updatedApiDept.manager.first_name} ${updatedApiDept.manager.last_name}` : undefined,
              manager_email: updatedApiDept.manager?.email,
              manager_avatar: (updatedApiDept.manager as any)?.avatar_url,
              employee_count: dept.employee_count,
              is_active: dept.is_active,
            }
          : dept
      );

      setDepartments(updatedDepartments);
      setShowEditDialog(false);
      setSelectedDepartment(null);
      setFormData({ name: '' });
      
      toast({
        title: 'Success',
        description: 'Department updated successfully',
      });
    } catch (error) {
      console.error('Error updating department:', error);
      toast({
        title: 'Error',
        description: 'Failed to update department',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (department: DepartmentUI) => {
    try {
      setLoading(true);
      
      await api.departments.deleteDepartment(department.id);

      setDepartments(departments.filter(dept => dept.id !== department.id));
      
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete department',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (department: DepartmentUI) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setSelectedDepartment(null);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (dept.manager_name && dept.manager_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              Manage your company departments and organizational structure
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>
                  Create a new department for your organization
                </DialogDescription>
              </DialogHeader>
              <DepartmentForm formData={formData} setFormData={setFormData} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDepartment} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Department'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
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

        {/* Departments Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.filter(d => d.is_active).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + dept.employee_count, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Managers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.filter(d => d.manager_id).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Departments</CardTitle>
            <CardDescription>
              A comprehensive list of all departments in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{department.name}</div>
                        {department.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {department.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {department.manager_name ? (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={department.manager_avatar} />
                            <AvatarFallback className="text-xs">
                              {department.manager_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{department.manager_name}</div>
                            <div className="text-xs text-muted-foreground">{department.manager_email}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No manager assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{department.employee_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={department.is_active ? 'default' : 'secondary'}>
                        {department.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(department.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(department)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Department
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (department.manager_email) {
                                window.location.href = `mailto:${department.manager_email}`;
                              }
                            }}
                            disabled={!department.manager_email}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Email Manager
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Department
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the "{department.name}" department? 
                                  This action cannot be undone and will affect {department.employee_count} employees.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteDepartment(department)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Department Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update department information and settings
              </DialogDescription>
            </DialogHeader>
            <DepartmentForm formData={formData} setFormData={setFormData} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditDepartment} disabled={loading}>
                {loading ? 'Updating...' : 'Update Department'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
};

export default DepartmentsPage; 
