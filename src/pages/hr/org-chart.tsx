import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users2, UserPlus, Edit, Search, ChevronDown, ChevronRight, Phone, Mail, MapPin, Calendar, Plus } from "lucide-react";
import { useState } from "react";

interface Employee {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  department: string;
  team?: string;
  startDate: string;
  location: string;
  manager?: string;
  directReports?: number;
}

interface Team {
  id: string;
  name: string;
  lead: Employee;
  members: Employee[];
}

interface Department {
  id: string;
  name: string;
  head: Employee;
  teams: Team[];
  totalMembers: number;
}

export default function OrgChart() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  // Demo data with detailed employee information
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null); // Unused state
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>([]);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedDepartmentForTeam, setSelectedDepartmentForTeam] = useState<string>("");
  const [selectedTeamForEmployee, setSelectedTeamForEmployee] = useState<{ departmentId: string; teamId: string } | null>(null);
  
  const ceoData: Employee = {
    id: "ceo-1",
    name: "John Smith",
    title: "Chief Executive Officer",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    department: "Executive",
    startDate: "2018-01-15",
    location: "New York, NY",
    directReports: 3
  };

  const [orgData, setOrgData] = useState<Department[]>([
    {
      id: "eng",
      name: "Engineering",
      head: {
        id: "vp-eng",
        name: "Alice Johnson",
        title: "VP Engineering",
        email: "alice@company.com",
        phone: "+1 (555) 234-5678",
        department: "Engineering",
        startDate: "2019-03-01",
        location: "San Francisco, CA",
        manager: "John Smith",
        directReports: 3
      },
      totalMembers: 14,
      teams: [
        {
          id: "frontend",
          name: "Frontend Team",
          lead: {
            id: "lead-frontend",
            name: "Bob Wilson",
            title: "Frontend Team Lead",
            email: "bob.wilson@company.com",
            phone: "+1 (555) 345-6789",
            department: "Engineering",
            team: "Frontend Team",
            startDate: "2020-06-15",
            location: "San Francisco, CA",
            manager: "Alice Johnson",
            directReports: 5
          },
          members: [
            {
              id: "fe-1",
              name: "Emma Garcia",
              title: "Senior Frontend Developer",
              email: "emma.garcia@company.com",
              phone: "+1 (555) 456-7890",
              department: "Engineering",
              team: "Frontend Team",
              startDate: "2021-02-01",
              location: "Austin, TX",
              manager: "Bob Wilson"
            },
            {
              id: "fe-2",
              name: "Michael Chen",
              title: "Frontend Developer",
              email: "michael.chen@company.com",
              phone: "+1 (555) 567-8901",
              department: "Engineering",
              team: "Frontend Team",
              startDate: "2022-09-12",
              location: "Remote",
              manager: "Bob Wilson"
            },
            {
              id: "fe-3",
              name: "Sofia Rodriguez",
              title: "UI/UX Developer",
              email: "sofia.rodriguez@company.com",
              phone: "+1 (555) 678-9012",
              department: "Engineering",
              team: "Frontend Team",
              startDate: "2021-11-08",
              location: "Miami, FL",
              manager: "Bob Wilson"
            },
            {
              id: "fe-4",
              name: "James Park",
              title: "Frontend Developer",
              email: "james.park@company.com",
              phone: "+1 (555) 789-0123",
              department: "Engineering",
              team: "Frontend Team",
              startDate: "2023-01-16",
              location: "Seattle, WA",
              manager: "Bob Wilson"
            }
          ]
        },
        {
          id: "backend",
          name: "Backend Team",
          lead: {
            id: "lead-backend",
            name: "Carol Davis",
            title: "Backend Team Lead",
            email: "carol.davis@company.com",
            phone: "+1 (555) 890-1234",
            department: "Engineering",
            team: "Backend Team",
            startDate: "2019-08-20",
            location: "New York, NY",
            manager: "Alice Johnson",
            directReports: 6
          },
          members: [
            {
              id: "be-1",
              name: "David Kumar",
              title: "Senior Backend Developer",
              email: "david.kumar@company.com",
              phone: "+1 (555) 901-2345",
              department: "Engineering",
              team: "Backend Team",
              startDate: "2020-04-10",
              location: "Chicago, IL",
              manager: "Carol Davis"
            },
            {
              id: "be-2",
              name: "Lisa Thompson",
              title: "Backend Developer",
              email: "lisa.thompson@company.com",
              phone: "+1 (555) 012-3456",
              department: "Engineering",
              team: "Backend Team",
              startDate: "2021-07-25",
              location: "Denver, CO",
              manager: "Carol Davis"
            }
          ]
        },
        {
          id: "devops",
          name: "DevOps Team",
          lead: {
            id: "lead-devops",
            name: "David Brown",
            title: "DevOps Team Lead",
            email: "david.brown@company.com",
            phone: "+1 (555) 123-4567",
            department: "Engineering",
            team: "DevOps Team",
            startDate: "2020-01-10",
            location: "Portland, OR",
            manager: "Alice Johnson",
            directReports: 3
          },
          members: [
            {
              id: "do-1",
              name: "Kevin Zhang",
              title: "DevOps Engineer",
              email: "kevin.zhang@company.com",
              phone: "+1 (555) 234-5678",
              department: "Engineering",
              team: "DevOps Team",
              startDate: "2021-05-03",
              location: "San Jose, CA",
              manager: "David Brown"
            },
            {
              id: "do-2",
              name: "Amanda White",
              title: "Cloud Infrastructure Engineer",
              email: "amanda.white@company.com",
              phone: "+1 (555) 345-6789",
              department: "Engineering",
              team: "DevOps Team",
              startDate: "2022-03-21",
              location: "Atlanta, GA",
              manager: "David Brown"
            }
          ]
        }
      ]
    },
    {
      id: "marketing",
      name: "Marketing",
      head: {
        id: "vp-marketing",
        name: "Sarah Connor",
        title: "VP Marketing",
        email: "sarah@company.com",
        phone: "+1 (555) 456-7890",
        department: "Marketing",
        startDate: "2019-11-12",
        location: "Los Angeles, CA",
        manager: "John Smith",
        directReports: 2
      },
      totalMembers: 7,
      teams: [
        {
          id: "digital",
          name: "Digital Marketing",
          lead: {
            id: "lead-digital",
            name: "Mike Chen",
            title: "Digital Marketing Lead",
            email: "mike.chen@company.com",
            phone: "+1 (555) 567-8901",
            department: "Marketing",
            team: "Digital Marketing",
            startDate: "2020-09-07",
            location: "Los Angeles, CA",
            manager: "Sarah Connor",
            directReports: 4
          },
          members: [
            {
              id: "dm-1",
              name: "Rachel Green",
              title: "SEO Specialist",
              email: "rachel.green@company.com",
              phone: "+1 (555) 678-9012",
              department: "Marketing",
              team: "Digital Marketing",
              startDate: "2021-04-15",
              location: "Phoenix, AZ",
              manager: "Mike Chen"
            },
            {
              id: "dm-2",
              name: "Tom Anderson",
              title: "PPC Manager",
              email: "tom.anderson@company.com",
              phone: "+1 (555) 789-0123",
              department: "Marketing",
              team: "Digital Marketing",
              startDate: "2022-01-08",
              location: "Dallas, TX",
              manager: "Mike Chen"
            }
          ]
        },
        {
          id: "content",
          name: "Content Team",
          lead: {
            id: "lead-content",
            name: "Lisa Wang",
            title: "Content Team Lead",
            email: "lisa.wang@company.com",
            phone: "+1 (555) 890-1234",
            department: "Marketing",
            team: "Content Team",
            startDate: "2020-12-03",
            location: "Boston, MA",
            manager: "Sarah Connor",
            directReports: 3
          },
          members: [
            {
              id: "ct-1",
              name: "Alex Johnson",
              title: "Content Writer",
              email: "alex.johnson@company.com",
              phone: "+1 (555) 901-2345",
              department: "Marketing",
              team: "Content Team",
              startDate: "2021-08-20",
              location: "Nashville, TN",
              manager: "Lisa Wang"
            },
            {
              id: "ct-2",
              name: "Maria Santos",
              title: "Graphic Designer",
              email: "maria.santos@company.com",
              phone: "+1 (555) 012-3456",
              department: "Marketing",
              team: "Content Team",
              startDate: "2022-06-14",
              location: "Orlando, FL",
              manager: "Lisa Wang"
            }
          ]
        }
      ]
    },
    {
      id: "sales",
      name: "Sales",
      head: {
        id: "vp-sales",
        name: "Robert Taylor",
        title: "VP Sales",
        email: "robert@company.com",
        phone: "+1 (555) 123-4567",
        department: "Sales",
        startDate: "2018-07-30",
        location: "Chicago, IL",
        manager: "John Smith",
        directReports: 2
      },
      totalMembers: 14,
      teams: [
        {
          id: "enterprise",
          name: "Enterprise Sales",
          lead: {
            id: "lead-enterprise",
            name: "Emma Davis",
            title: "Enterprise Sales Lead",
            email: "emma.davis@company.com",
            phone: "+1 (555) 234-5678",
            department: "Sales",
            team: "Enterprise Sales",
            startDate: "2019-05-18",
            location: "New York, NY",
            manager: "Robert Taylor",
            directReports: 8
          },
          members: [
            {
              id: "es-1",
              name: "Chris Wilson",
              title: "Senior Account Executive",
              email: "chris.wilson@company.com",
              phone: "+1 (555) 345-6789",
              department: "Sales",
              team: "Enterprise Sales",
              startDate: "2020-02-14",
              location: "Boston, MA",
              manager: "Emma Davis"
            },
            {
              id: "es-2",
              name: "Nicole Brown",
              title: "Account Executive",
              email: "nicole.brown@company.com",
              phone: "+1 (555) 456-7890",
              department: "Sales",
              team: "Enterprise Sales",
              startDate: "2021-09-10",
              location: "Washington, DC",
              manager: "Emma Davis"
            }
          ]
        },
        {
          id: "smb",
          name: "SMB Sales",
          lead: {
            id: "lead-smb",
            name: "Tom Wilson",
            title: "SMB Sales Lead",
            email: "tom.wilson@company.com",
            phone: "+1 (555) 567-8901",
            department: "Sales",
            team: "SMB Sales",
            startDate: "2020-10-05",
            location: "Austin, TX",
            manager: "Robert Taylor",
            directReports: 6
          },
          members: [
            {
              id: "smb-1",
              name: "Sarah Lee",
              title: "Inside Sales Representative",
              email: "sarah.lee@company.com",
              phone: "+1 (555) 678-9012",
              department: "Sales",
              team: "SMB Sales",
              startDate: "2021-12-01",
              location: "Houston, TX",
              manager: "Tom Wilson"
            },
            {
              id: "smb-2",
              name: "Mark Johnson",
              title: "Sales Development Representative",
              email: "mark.johnson@company.com",
              phone: "+1 (555) 789-0123",
              department: "Sales",
              team: "SMB Sales",
              startDate: "2022-08-15",
              location: "San Antonio, TX",
              manager: "Tom Wilson"
            }
          ]
        }
      ]
    }
  ]);

  const toggleDepartmentExpansion = (departmentId: string) => {
    setExpandedDepartments(prev => 
      prev.includes(departmentId) 
        ? prev.filter(id => id !== departmentId)
        : [...prev, departmentId]
    );
  };

  // const handleEmployeeClick = (employee: Employee) => { // Unused function
  //   setSelectedEmployee(employee);
  // };

  const getAllEmployees = () => {
    const allEmployees: Employee[] = [ceoData];
    
    orgData.forEach(dept => {
      allEmployees.push(dept.head);
      dept.teams.forEach(team => {
        allEmployees.push(team.lead);
        allEmployees.push(...team.members);
      });
    });
    
    return allEmployees;
  };

  const filteredEmployees = getAllEmployees().filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployees = getAllEmployees().length;
  const totalTeams = orgData.reduce((acc, dept) => acc + dept.teams.length, 0);

  // Add functions
  const addDepartment = (formData: FormData) => {
    const name = formData.get('name') as string;
    const headName = formData.get('headName') as string;
    const headTitle = formData.get('headTitle') as string;
    const headEmail = formData.get('headEmail') as string;
    const headPhone = formData.get('headPhone') as string;
    const headLocation = formData.get('headLocation') as string;

    const newDepartment: Department = {
      id: `dept-${Date.now()}`,
      name,
      head: {
        id: `head-${Date.now()}`,
        name: headName,
        title: headTitle,
        email: headEmail,
        phone: headPhone,
        department: name,
        startDate: new Date().toISOString().split('T')[0],
        location: headLocation,
        manager: "John Smith",
        directReports: 0
      },
      teams: [],
      totalMembers: 1
    };

    setOrgData(prev => [...prev, newDepartment]);
    setShowAddDepartment(false);
  };

  const addTeam = (formData: FormData) => {
    const name = formData.get('name') as string;
    const leadName = formData.get('leadName') as string;
    const leadTitle = formData.get('leadTitle') as string;
    const leadEmail = formData.get('leadEmail') as string;
    const leadPhone = formData.get('leadPhone') as string;
    const leadLocation = formData.get('leadLocation') as string;

    const department = orgData.find(d => d.id === selectedDepartmentForTeam);
    if (!department) return;

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      lead: {
        id: `lead-${Date.now()}`,
        name: leadName,
        title: leadTitle,
        email: leadEmail,
        phone: leadPhone,
        department: department.name,
        team: name,
        startDate: new Date().toISOString().split('T')[0],
        location: leadLocation,
        manager: department.head.name,
        directReports: 0
      },
      members: []
    };

    setOrgData(prev => prev.map(dept => 
      dept.id === selectedDepartmentForTeam 
        ? { 
            ...dept, 
            teams: [...dept.teams, newTeam],
            totalMembers: dept.totalMembers + 1
          }
        : dept
    ));
    
    // Update department head's direct reports
    setOrgData(prev => prev.map(dept => 
      dept.id === selectedDepartmentForTeam 
        ? { 
            ...dept, 
            head: { ...dept.head, directReports: (dept.head.directReports || 0) + 1 }
          }
        : dept
    ));

    setShowAddTeam(false);
    setSelectedDepartmentForTeam("");
  };

  const addEmployee = (formData: FormData) => {
    const name = formData.get('name') as string;
    const title = formData.get('title') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const location = formData.get('location') as string;

    if (!selectedTeamForEmployee) return;

    const department = orgData.find(d => d.id === selectedTeamForEmployee.departmentId);
    const team = department?.teams.find(t => t.id === selectedTeamForEmployee.teamId);
    if (!department || !team) return;

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name,
      title,
      email,
      phone,
      department: department.name,
      team: team.name,
      startDate: new Date().toISOString().split('T')[0],
      location,
      manager: team.lead.name
    };

    setOrgData(prev => prev.map(dept => 
      dept.id === selectedTeamForEmployee.departmentId
        ? {
            ...dept,
            teams: dept.teams.map(t => 
              t.id === selectedTeamForEmployee.teamId
                ? { ...t, members: [...t.members, newEmployee] }
                : t
            ),
            totalMembers: dept.totalMembers + 1
          }
        : dept
    ));

    // Update team lead's direct reports
    setOrgData(prev => prev.map(dept => 
      dept.id === selectedTeamForEmployee.departmentId
        ? {
            ...dept,
            teams: dept.teams.map(t => 
              t.id === selectedTeamForEmployee.teamId
                ? { ...t, lead: { ...t.lead, directReports: (t.lead.directReports || 0) + 1 } }
                : t
            )
          }
        : dept
    ));

    setShowAddEmployee(false);
    setSelectedTeamForEmployee(null);
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
            <p className="text-gray-600 mt-2">View and manage your company's organizational structure</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex gap-2">
              <Dialog open={showAddDepartment} onOpenChange={setShowAddDepartment}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <AddDepartmentModal onSubmit={addDepartment} />
              </Dialog>
              <Dialog open={showAddTeam} onOpenChange={setShowAddTeam}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Team
                  </Button>
                </DialogTrigger>
                <AddTeamModal 
                  onSubmit={addTeam}
                  departments={orgData}
                  selectedDepartment={selectedDepartmentForTeam}
                  onDepartmentChange={setSelectedDepartmentForTeam}
                />
              </Dialog>
              <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <AddEmployeeModal 
                  onSubmit={addEmployee}
                  departments={orgData}
                  selectedTeam={selectedTeamForEmployee}
                  onTeamChange={setSelectedTeamForEmployee}
                />
              </Dialog>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Structure
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orgData.length}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeams}</div>
              <p className="text-xs text-muted-foreground">Total teams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Total employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leadership</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orgData.length + 1}</div>
              <p className="text-xs text-muted-foreground">C-level & VPs</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results ({filteredEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map(employee => (
                  <Dialog key={employee.id}>
                    <DialogTrigger asChild>
                      <div 
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        // onClick={() => handleEmployeeClick(employee)} // Removed as handleEmployeeClick is unused
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-600 text-white">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {employee.department}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    <EmployeeDetailsModal employee={employee} />
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CEO Card */}
        {!searchTerm && (
          <Card>
            <CardHeader>
              <CardTitle>Chief Executive Officer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-8">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="text-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
                      <Avatar className="w-16 h-16 mx-auto mb-2">
                        <AvatarFallback className="bg-blue-600 text-white text-xl">
                          {ceoData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-medium text-gray-900">{ceoData.name}</h3>
                      <p className="text-sm text-gray-500">{ceoData.title}</p>
                      <Badge className="mt-2">Executive Leadership</Badge>
                    </div>
                  </DialogTrigger>
                  <EmployeeDetailsModal employee={ceoData} />
                </Dialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Departments */}
        {!searchTerm && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orgData.map((department) => (
              <Card key={department.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleDepartmentExpansion(department.id)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      {department.name}
                    </div>
                    {expandedDepartments.includes(department.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-500">{department.totalMembers} total members</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Department Head */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="text-center pb-4 border-b cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                        <Avatar className="w-12 h-12 mx-auto mb-2">
                          <AvatarFallback className="bg-green-600 text-white">
                            {department.head.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <h4 className="font-medium text-gray-900">{department.head.name}</h4>
                        <p className="text-sm text-gray-500">{department.head.title}</p>
                        <Badge variant="outline" className="mt-1">Department Head</Badge>
                      </div>
                    </DialogTrigger>
                    <EmployeeDetailsModal employee={department.head} />
                  </Dialog>
                  
                                     {/* Teams */}
                   {expandedDepartments.includes(department.id) && (
                     <div className="space-y-3">
                       <div className="flex items-center justify-between">
                         <h5 className="font-medium text-gray-700">Teams</h5>
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => {
                             setSelectedDepartmentForTeam(department.id);
                             setShowAddTeam(true);
                           }}
                         >
                           <Plus className="mr-1 h-3 w-3" />
                           Add Team
                         </Button>
                       </div>
                      {department.teams.map((team) => (
                        <div key={team.id} className="space-y-2">
                                                     <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                             <div>
                               <p className="text-sm font-medium">{team.name}</p>
                               <p className="text-xs text-gray-500">Lead: {team.lead.name}</p>
                             </div>
                             <div className="flex items-center space-x-2">
                               <span className="text-sm text-gray-600">{team.members.length + 1} members</span>
                               <Button 
                                 size="sm" 
                                 variant="ghost"
                                 onClick={() => {
                                   setSelectedTeamForEmployee({ departmentId: department.id, teamId: team.id });
                                   setShowAddEmployee(true);
                                 }}
                               >
                                 <Plus className="h-3 w-3" />
                               </Button>
                             </div>
                           </div>
                          
                          {/* Team Members */}
                          <div className="ml-4 space-y-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-purple-600 text-white text-xs">
                                      {team.lead.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{team.lead.name}</span>
                                  <Badge variant="secondary" className="text-xs">Lead</Badge>
                                </div>
                              </DialogTrigger>
                              <EmployeeDetailsModal employee={team.lead} />
                            </Dialog>
                            
                            {team.members.map((member) => (
                              <Dialog key={member.id}>
                                <DialogTrigger asChild>
                                  <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="bg-gray-600 text-white text-xs">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{member.name}</span>
                                  </div>
                                </DialogTrigger>
                                <EmployeeDetailsModal employee={member} />
                              </Dialog>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ExtensibleLayout>
  );
}

// Employee Details Modal Component
function EmployeeDetailsModal({ employee }: { employee: Employee }) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-blue-600 text-white">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{employee.name}</h3>
            <p className="text-sm text-gray-500">{employee.title}</p>
          </div>
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{employee.email}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{employee.phone}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{employee.location}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">Started: {new Date(employee.startDate).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{employee.department}</span>
          {employee.team && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-sm">{employee.team}</span>
            </>
          )}
        </div>
        
        {employee.manager && (
          <div className="flex items-center space-x-3">
            <Users2 className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Reports to: {employee.manager}</span>
          </div>
        )}
        
        {employee.directReports && employee.directReports > 0 && (
          <div className="flex items-center space-x-3">
            <UserPlus className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Manages: {employee.directReports} direct reports</span>
          </div>
        )}
        
        <div className="pt-4 border-t">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

// Add Department Modal Component
function AddDepartmentModal({ onSubmit }: { onSubmit: (formData: FormData) => void }) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Department</DialogTitle>
      </DialogHeader>
      
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Department Name</Label>
          <Input id="name" name="name" required placeholder="e.g., Human Resources" />
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">Department Head Information</h4>
          
          <div className="space-y-2">
            <Label htmlFor="headName">Full Name</Label>
            <Input id="headName" name="headName" required placeholder="e.g., Jane Smith" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="headTitle">Job Title</Label>
            <Input id="headTitle" name="headTitle" required placeholder="e.g., VP Human Resources" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="headEmail">Email</Label>
            <Input id="headEmail" name="headEmail" type="email" required placeholder="jane.smith@company.com" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="headPhone">Phone</Label>
            <Input id="headPhone" name="headPhone" required placeholder="+1 (555) 123-4567" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="headLocation">Location</Label>
            <Input id="headLocation" name="headLocation" required placeholder="e.g., New York, NY" />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => {}}>Cancel</Button>
          <Button type="submit">Add Department</Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Add Team Modal Component
function AddTeamModal({ 
  onSubmit, 
  departments, 
  selectedDepartment, 
  onDepartmentChange 
}: { 
  onSubmit: (formData: FormData) => void;
  departments: Department[];
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
}) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Team</DialogTitle>
      </DialogHeader>
      
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select value={selectedDepartment} onValueChange={onDepartmentChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Team Name</Label>
          <Input id="name" name="name" required placeholder="e.g., Recruitment Team" />
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium">Team Lead Information</h4>
          
          <div className="space-y-2">
            <Label htmlFor="leadName">Full Name</Label>
            <Input id="leadName" name="leadName" required placeholder="e.g., John Doe" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leadTitle">Job Title</Label>
            <Input id="leadTitle" name="leadTitle" required placeholder="e.g., Recruitment Team Lead" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leadEmail">Email</Label>
            <Input id="leadEmail" name="leadEmail" type="email" required placeholder="john.doe@company.com" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leadPhone">Phone</Label>
            <Input id="leadPhone" name="leadPhone" required placeholder="+1 (555) 123-4567" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leadLocation">Location</Label>
            <Input id="leadLocation" name="leadLocation" required placeholder="e.g., San Francisco, CA" />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => {}}>Cancel</Button>
          <Button type="submit" disabled={!selectedDepartment}>Add Team</Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Add Employee Modal Component
function AddEmployeeModal({ 
  onSubmit, 
  departments, 
  selectedTeam, 
  onTeamChange 
}: { 
  onSubmit: (formData: FormData) => void;
  departments: Department[];
  selectedTeam: { departmentId: string; teamId: string } | null;
  onTeamChange: (value: { departmentId: string; teamId: string } | null) => void;
}) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Employee</DialogTitle>
      </DialogHeader>
      
      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="team">Team</Label>
          <Select 
            value={selectedTeam ? `${selectedTeam.departmentId}-${selectedTeam.teamId}` : ""} 
            onValueChange={(value) => {
              if (value) {
                const [departmentId, teamId] = value.split('-');
                onTeamChange({ departmentId, teamId });
              } else {
                onTeamChange(null);
              }
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => 
                dept.teams.map(team => (
                  <SelectItem key={`${dept.id}-${team.id}`} value={`${dept.id}-${team.id}`}>
                    {dept.name} - {team.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required placeholder="e.g., Sarah Johnson" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input id="title" name="title" required placeholder="e.g., Senior Recruiter" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="sarah.johnson@company.com" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required placeholder="+1 (555) 123-4567" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" required placeholder="e.g., Remote" />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => {}}>Cancel</Button>
          <Button type="submit" disabled={!selectedTeam}>Add Employee</Button>
        </div>
      </form>
    </DialogContent>
  );
} 
