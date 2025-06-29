import React, { useState, useEffect, useCallback } from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { settingsSidebarSections } from '@/components/sidebars/SettingsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/apis';
import type { User, Department, Invitation } from '@/apis/types';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  UserCog,
  Users,
  Crown,
  Shield,
  User as UserIcon,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Mail,
  Calendar,
  Briefcase,
  UserPlus,
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

// Types for user roles
interface UserRole {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  role: string;
  department: string;
  assigned_date: string;
  assigned_by: string;
  is_active: boolean;
}

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  level: 'admin' | 'manager' | 'employee' | 'viewer';
  color: string;
  permissions_count: number;
}

const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    level: 'admin',
    color: 'bg-red-500',
    permissions_count: 50,
  },
  {
    id: '2',
    name: 'Company Admin',
    description: 'Company-wide administrative access',
    level: 'admin',
    color: 'bg-orange-500',
    permissions_count: 45,
  },
  {
    id: '3',
    name: 'Department Manager',
    description: 'Manage specific department and its employees',
    level: 'manager',
    color: 'bg-blue-500',
    permissions_count: 25,
  },
  {
    id: '4',
    name: 'Team Lead',
    description: 'Lead and manage team projects',
    level: 'manager',
    color: 'bg-purple-500',
    permissions_count: 15,
  },
  {
    id: '5',
    name: 'Senior Employee',
    description: 'Experienced employee with additional permissions',
    level: 'employee',
    color: 'bg-green-500',
    permissions_count: 12,
  },
  {
    id: '6',
    name: 'Employee',
    description: 'Standard employee access',
    level: 'employee',
    color: 'bg-gray-500',
    permissions_count: 8,
  },
  {
    id: '7',
    name: 'Viewer',
    description: 'Read-only access to basic information',
    level: 'viewer',
    color: 'bg-slate-500',
    permissions_count: 3,
  },
];

const getRoleIcon = (level: string) => {
  switch (level) {
    case 'admin':
      return <Crown className="h-4 w-4" />;
    case 'manager':
      return <Shield className="h-4 w-4" />;
    case 'employee':
      return <UserIcon className="h-4 w-4" />;
    case 'viewer':
      return <Users className="h-4 w-4" />;
    default:
      return <UserIcon className="h-4 w-4" />;
  }
};

const getRoleBadgeVariant = (level: string) => {
  switch (level) {
    case 'admin':
      return 'destructive';
    case 'manager':
      return 'default';
    case 'employee':
      return 'secondary';
    case 'viewer':
      return 'outline';
    default:
      return 'secondary';
  }
};

const UserRolesPage = () => {
  const { user, companyId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roleTemplates] = useState<RoleTemplate[]>(ROLE_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [newRole, setNewRole] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('employee');
  const [isInviting, setIsInviting] = useState(false);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // Data fetching functions
  const loadUsers = useCallback(async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const fetchedUsers = await api.user.getCompanyUsers(companyId);
      
      // Transform User[] to UserRole[]
      const transformedUsers: UserRole[] = (fetchedUsers || []).map((apiUser: User) => ({
        id: apiUser.id,
        user_id: apiUser.id,
        user_name: `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.email,
        user_email: apiUser.email,
        user_avatar: apiUser.avatar_url,
        role: apiUser.role || 'employee',
        department: apiUser.department?.name || 'Unassigned',
        assigned_date: apiUser.created_at ? apiUser.created_at.split('T')[0] : new Date().toISOString().split('T')[0], // Convert to date string with fallback
        assigned_by: 'System', // Default value since API doesn't provide this
        is_active: apiUser.is_active ?? true,
      }));
      
      setUserRoles(transformedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const loadDepartments = useCallback(async () => {
    if (!companyId) return;
    
    try {
      const fetchedDepartments = await api.departments.getCompanyDepartments(companyId);
      setDepartments(fetchedDepartments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  }, [companyId]);

  const loadInvites = useCallback(async () => {
    if (!companyId) return;
    setLoadingInvites(true);
    try {
      const data = await api.invitations.getCompanyInvitations(companyId);
      setInvites(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load invites',
        variant: 'destructive',
      });
    } finally {
      setLoadingInvites(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadUsers();
    loadDepartments();
    loadInvites();
  }, [loadUsers, loadDepartments, loadInvites]);

  const handleAssignRole = async () => {
    if (!selectedUser || !newRole) {
      toast({
        title: 'Validation Error',
        description: 'Please select a user and role',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Update user role via API
      const updateData = {
        role: newRole.toLowerCase(), // API expects lowercase roles
      };
      
      await api.user.updateUserProfile(updateData, selectedUser.user_id);
      
      // Update local state
      setUserRoles(prev => prev.map(userRole => 
        userRole.id === selectedUser.id 
          ? {
              ...userRole,
              role: newRole,
              assigned_date: new Date().toISOString().split('T')[0],
              assigned_by: user?.first_name + ' ' + user?.last_name || 'Current User',
            }
          : userRole
      ));
      
      toast({
        title: 'Success',
        description: 'Role assigned successfully',
      });
      
      setShowAssignDialog(false);
      setSelectedUser(null);
      setNewRole('');
      
      // Refresh users list to ensure data consistency
      loadUsers();
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openAssignDialog = (userRole: UserRole) => {
    setSelectedUser(userRole);
    setNewRole(userRole.role);
    setShowAssignDialog(true);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteRole) {
      toast({
        title: 'Validation Error',
        description: 'Please enter email and select a role',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsInviting(true);
      // Get company ID from user context
      const companyId = user?.company_id || 'default-company';
      // Use the API service to send the invite
      await api.invitations.sendInvitation({
        email: inviteEmail,
        role: inviteRole as "admin" | "manager" | "employee",
        companyId: companyId,
      });
      toast({
        title: 'Success',
        description: `Invitation sent to ${inviteEmail}`,
      });
      // Reset form
      setInviteEmail('');
      setInviteRole('employee');
      setShowInviteDialog(false);
      // Refresh users list to show newly invited users when they accept
      setTimeout(() => {
        loadUsers();
      }, 1000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleTemplate = (roleName: string) => {
    return roleTemplates.find(template => template.name === roleName) || roleTemplates[5]; // Default to Employee
  };

  const filteredUserRoles = userRoles.filter(userRole => {
    const matchesSearch = 
      userRole.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userRole.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userRole.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || userRole.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || userRole.department === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const uniqueRoles = [...new Set(userRoles.map(ur => ur.role))];
  const uniqueDepartments = [...new Set(userRoles.map(ur => ur.department).filter(Boolean))];

  const getRoleStats = () => {
    const stats = roleTemplates.map(template => ({
      ...template,
      count: userRoles.filter(ur => ur.role === template.name).length,
    }));
    return stats;
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await api.invitations.deleteInvitation(inviteId);
      toast({ title: 'Success', description: 'Invite deleted.' });
      loadInvites();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete invite.', variant: 'destructive' });
    }
  };

  const handleExpireInvite = async (inviteId: string) => {
    try {
      await api.invitations.expireInvitation(inviteId);
      toast({ title: 'Success', description: 'Invite expired.' });
      loadInvites();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to expire invite.', variant: 'destructive' });
    }
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
            <h1 className="text-3xl font-bold tracking-tight">User Roles</h1>
            <p className="text-muted-foreground">
              Manage user role assignments and permissions
            </p>
          </div>
          <Button onClick={() => setShowInviteDialog(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Role Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {getRoleStats().map((stat) => {
            const roleTemplate = getRoleTemplate(stat.name);
            return (
              <Card key={stat.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <div className={`p-2 rounded-md ${roleTemplate.color} text-white`}>
                    {getRoleIcon(roleTemplate.level)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.permissions_count} permissions
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Assignments</CardTitle>
            <CardDescription>
              View and manage role assignments for all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead>Assigned By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading user roles...
                      </TableCell>
                    </TableRow>
                  ) : filteredUserRoles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No user roles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUserRoles.map((userRole) => {
                      const roleTemplate = getRoleTemplate(userRole.role);
                      return (
                        <TableRow key={userRole.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={userRole.user_avatar} />
                                <AvatarFallback>
                                  {userRole.user_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{userRole.user_name}</div>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Mail className="mr-1 h-3 w-3" />
                                  {userRole.user_email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className={`p-1.5 rounded-md ${roleTemplate.color} text-white`}>
                                {getRoleIcon(roleTemplate.level)}
                              </div>
                              <div>
                                <Badge variant={getRoleBadgeVariant(roleTemplate.level)}>
                                  {userRole.role}
                                </Badge>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {roleTemplate.permissions_count} permissions
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                              {userRole.department}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {new Date(userRole.assigned_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{userRole.assigned_by}</div>
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
                                <DropdownMenuItem onClick={() => openAssignDialog(userRole)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UserCog className="mr-2 h-4 w-4" />
                                  View Permissions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Role History
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Role Assignment Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Assign a new role to {selectedUser?.user_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-role">Select New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.name}>
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${template.color} text-white`}>
                            {getRoleIcon(template.level)}
                          </div>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {template.permissions_count} permissions
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newRole && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium">Role Description:</div>
                  <div className="text-sm text-muted-foreground">
                    {roleTemplates.find(t => t.name === newRole)?.description}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignRole} disabled={loading || !newRole}>
                {loading ? 'Assigning...' : 'Assign Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to a new team member
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {inviteRole && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium">Role Info:</div>
                  <div className="text-sm text-muted-foreground">
                    {inviteRole === 'admin' && 'Full administrative access to the system'}
                    {inviteRole === 'manager' && 'Manage team members and department operations'}
                    {inviteRole === 'employee' && 'Standard employee access with basic permissions'}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendInvite} disabled={isInviting || !inviteEmail || !inviteRole}>
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pending Company Invites</CardTitle>
            <CardDescription>
              View all pending invitations for your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited At</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingInvites ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading invites...
                      </TableCell>
                    </TableRow>
                  ) : invites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No invites found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell>{invite.email}</TableCell>
                        <TableCell>{invite.role}</TableCell>
                        <TableCell>{invite.status}</TableCell>
                        <TableCell>{new Date(invite.created_at).toLocaleString()}</TableCell>
                        <TableCell>{new Date(invite.expires_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteInvite(invite.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={() => handleExpireInvite(invite.id)}
                            disabled={invite.status !== 'pending'}
                          >
                            Expire
                          </Button>
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
    </ExtensibleLayout>
  );
};

export default UserRolesPage; 