import React, { useState, useEffect, useCallback } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { settingsSidebarSections } from '@/components/sidebars/SettingsSidebar';
import { useAuth } from '@/contexts/AuthContext';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Settings,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Search,
  Filter,
  MoreHorizontal,
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

// Types for access control
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system: boolean;
  created_at: string;
}

interface UserPermission {
  user_id: string;
  user_name: string;
  user_email: string;
  role: string;
  permissions: string[];
  is_active: boolean;
}

const PERMISSION_CATEGORIES = [
  'User Management',
  'Department Management', 
  'Finance',
  'HR',
  'Projects',
  'CRM',
  'Assets',
  'Reports',
  'Settings'
];

const SAMPLE_PERMISSIONS: Permission[] = [
  { id: '1', name: 'users.create', description: 'Create new users', category: 'User Management' },
  { id: '2', name: 'users.read', description: 'View user information', category: 'User Management' },
  { id: '3', name: 'users.update', description: 'Update user information', category: 'User Management' },
  { id: '4', name: 'users.delete', description: 'Delete users', category: 'User Management' },
  { id: '5', name: 'departments.create', description: 'Create departments', category: 'Department Management' },
  { id: '6', name: 'departments.read', description: 'View departments', category: 'Department Management' },
  { id: '7', name: 'departments.update', description: 'Update departments', category: 'Department Management' },
  { id: '8', name: 'departments.delete', description: 'Delete departments', category: 'Department Management' },
  { id: '9', name: 'finance.read', description: 'View financial data', category: 'Finance' },
  { id: '10', name: 'finance.create', description: 'Create financial records', category: 'Finance' },
  { id: '11', name: 'hr.read', description: 'View HR information', category: 'HR' },
  { id: '12', name: 'hr.manage', description: 'Manage HR processes', category: 'HR' },
  { id: '13', name: 'projects.create', description: 'Create projects', category: 'Projects' },
  { id: '14', name: 'projects.manage', description: 'Manage projects', category: 'Projects' },
  { id: '15', name: 'reports.view', description: 'View reports', category: 'Reports' },
  { id: '16', name: 'settings.manage', description: 'Manage system settings', category: 'Settings' },
];

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const RoleForm = ({ 
  formData, 
  setFormData,
  permissions
}: { 
  formData: RoleFormData;
  setFormData: (data: RoleFormData) => void;
  permissions: Permission[];
}) => {
  const togglePermission = (permissionId: string) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter(id => id !== permissionId)
      : [...formData.permissions, permissionId];
    
    setFormData({ ...formData, permissions: newPermissions });
  };

  const toggleCategoryPermissions = (category: string) => {
    const categoryPermissions = permissions.filter(p => p.category === category).map(p => p.id);
    const allSelected = categoryPermissions.every(id => formData.permissions.includes(id));
    
    let newPermissions;
    if (allSelected) {
      // Remove all category permissions
      newPermissions = formData.permissions.filter(id => !categoryPermissions.includes(id));
    } else {
      // Add all category permissions
      newPermissions = [...new Set([...formData.permissions, ...categoryPermissions])];
    }
    
    setFormData({ ...formData, permissions: newPermissions });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="role-name">Role Name *</Label>
        <Input
          id="role-name"
          placeholder="Enter role name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role-description">Description</Label>
        <Textarea
          id="role-description"
          placeholder="Enter role description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="space-y-4">
        <Label>Permissions</Label>
        <div className="max-h-96 overflow-y-auto border rounded-md p-4">
          {PERMISSION_CATEGORIES.map(category => {
            const categoryPermissions = permissions.filter(p => p.category === category);
            const selectedCount = categoryPermissions.filter(p => formData.permissions.includes(p.id)).length;
            const allSelected = selectedCount === categoryPermissions.length;
            
            return (
              <div key={category} className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => toggleCategoryPermissions(category)}
                  />
                  <Label className="font-medium text-sm">
                    {category} ({selectedCount}/{categoryPermissions.length})
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  {categoryPermissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="flex-1">
                        <Label className="text-sm">{permission.name}</Label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AccessControlPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [permissions] = useState<Permission[]>(SAMPLE_PERMISSIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('roles');
  
  // Dialog states
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  // Form data
  const [roleFormData, setRoleFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
  });

  // Sample data initialization
  useEffect(() => {
    const sampleRoles: Role[] = [
      {
        id: '1',
        name: 'Administrator',
        description: 'Full system access',
        permissions: permissions.map(p => p.id),
        user_count: 2,
        is_system: true,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Department management access',
        permissions: ['1', '2', '3', '5', '6', '7', '11', '12', '13', '14', '15'],
        user_count: 5,
        is_system: false,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Employee',
        description: 'Basic employee access',
        permissions: ['2', '6', '11', '13', '15'],
        user_count: 25,
        is_system: true,
        created_at: new Date().toISOString(),
      },
    ];
    
    setRoles(sampleRoles);
    
    const sampleUserPermissions: UserPermission[] = [
      {
        user_id: '1',
        user_name: 'John Doe',
        user_email: 'john@company.com',
        role: 'Administrator',
        permissions: permissions.map(p => p.id),
        is_active: true,
      },
      {
        user_id: '2',
        user_name: 'Jane Smith',
        user_email: 'jane@company.com',
        role: 'Manager',
        permissions: ['1', '2', '3', '5', '6', '7', '11', '12', '13', '14', '15'],
        is_active: true,
      },
    ];
    
    setUserPermissions(sampleUserPermissions);
  }, [permissions]);

  const handleAddRole = async () => {
    try {
      if (!roleFormData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Role name is required',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      
      const newRole: Role = {
        id: Date.now().toString(),
        name: roleFormData.name,
        description: roleFormData.description,
        permissions: roleFormData.permissions,
        user_count: 0,
        is_system: false,
        created_at: new Date().toISOString(),
      };
      
      setRoles(prev => [...prev, newRole]);
      
      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
      
      setShowAddRoleDialog(false);
      resetRoleForm();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async () => {
    try {
      if (!selectedRole || !roleFormData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Role name is required',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id 
          ? {
              ...role,
              name: roleFormData.name,
              description: roleFormData.description,
              permissions: roleFormData.permissions,
            }
          : role
      ));
      
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
      
      setShowEditRoleDialog(false);
      resetRoleForm();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) {
      toast({
        title: 'Error',
        description: 'Cannot delete system roles',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setRoles(prev => prev.filter(r => r.id !== role.id));
      
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditRoleDialog = (role: Role) => {
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setShowEditRoleDialog(true);
  };

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setSelectedRole(null);
  };

  const getPermissionName = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUserPermissions = userPermissions.filter(user =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b">
          <Button
            variant={activeTab === 'roles' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('roles')}
            className="rounded-b-none"
          >
            <Shield className="mr-2 h-4 w-4" />
            Roles
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="rounded-b-none"
          >
            <Users className="mr-2 h-4 w-4" />
            User Permissions
          </Button>
        </div>

        {activeTab === 'roles' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>
              </div>
              <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetRoleForm(); setShowAddRoleDialog(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Role</DialogTitle>
                    <DialogDescription>
                      Create a new role with specific permissions.
                    </DialogDescription>
                  </DialogHeader>
                  <RoleForm 
                    formData={roleFormData} 
                    setFormData={setRoleFormData}
                    permissions={permissions}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRole} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Role'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {filteredRoles.map((role) => (
                <Card key={role.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{role.name}</span>
                          {role.is_system && (
                            <Badge variant="secondary">System</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditRoleDialog(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.is_system && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Role</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the role "{role.name}"? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteRole(role)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {role.user_count} users assigned
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Permissions ({role.permissions.length}):</h4>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 8).map((permissionId) => (
                            <Badge key={permissionId} variant="secondary" className="text-xs">
                              {getPermissionName(permissionId)}
                            </Badge>
                          ))}
                          {role.permissions.length > 8 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Permissions</CardTitle>
                <CardDescription>
                  View and manage individual user permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUserPermissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUserPermissions.map((userPerm) => (
                          <TableRow key={userPerm.user_id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{userPerm.user_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {userPerm.user_email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{userPerm.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {userPerm.permissions.slice(0, 3).map((permissionId) => (
                                  <Badge key={permissionId} variant="secondary" className="text-xs">
                                    {getPermissionName(permissionId)}
                                  </Badge>
                                ))}
                                {userPerm.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{userPerm.permissions.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {userPerm.is_active ? (
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                ) : (
                                  <UserX className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-sm">
                                  {userPerm.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
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
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    {userPerm.is_active ? (
                                      <>
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
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
          </div>
        )}

        {/* Edit Role Dialog */}
        <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update the role permissions and details.
              </DialogDescription>
            </DialogHeader>
            <RoleForm 
              formData={roleFormData} 
              setFormData={setRoleFormData}
              permissions={permissions}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRole} disabled={loading}>
                {loading ? 'Updating...' : 'Update Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ExtensibleLayout>
  );
};

export default AccessControlPage; 