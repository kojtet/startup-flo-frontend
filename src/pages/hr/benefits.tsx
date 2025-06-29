import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { hrSidebarSections } from "@/components/sidebars/HRSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, Heart, Shield, Plane, Users2 } from "lucide-react";

export default function BenefitsAdministration() {
  const user = {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Administrator",
    avatarUrl: undefined
  };

  const benefits = [
    { id: 1, name: "Health Insurance", type: "Medical", enrolled: 138, eligible: 145, cost: 125000, provider: "Blue Cross" },
    { id: 2, name: "Dental Coverage", type: "Dental", enrolled: 120, eligible: 145, cost: 35000, provider: "Delta Dental" },
    { id: 3, name: "Life Insurance", type: "Insurance", enrolled: 145, eligible: 145, cost: 18000, provider: "MetLife" },
    { id: 4, name: "PTO Package", type: "Time Off", enrolled: 145, eligible: 145, cost: 0, provider: "Internal" }
  ];

  const getEnrollmentRate = (enrolled: number, eligible: number) => {
    return Math.round((enrolled / eligible) * 100);
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Medical': return Heart;
      case 'Dental': return Heart;
      case 'Insurance': return Shield;
      case 'Time Off': return Plane;
      default: return Handshake;
    }
  };

  return (
    <ExtensibleLayout moduleSidebar={hrSidebarSections} moduleTitle="Human Resources" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Benefits Administration</h1>
            <p className="text-gray-600 mt-2">Manage employee benefits and enrollment</p>
          </div>
          <Button>
            <Handshake className="mr-2 h-4 w-4" />
            Add Benefit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Benefits</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{benefits.length}</div>
              <p className="text-xs text-muted-foreground">Active benefit plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Enrollment</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(benefits.reduce((acc, benefit) => acc + getEnrollmentRate(benefit.enrolled, benefit.eligible), 0) / benefits.length)}%
              </div>
              <p className="text-xs text-muted-foreground">Participation rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${benefits.reduce((acc, benefit) => acc + benefit.cost, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total benefits cost</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost per Employee</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Math.round(benefits.reduce((acc, benefit) => acc + benefit.cost, 0) / 145).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Average monthly</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {benefits.map((benefit) => {
            const IconComponent = getTypeIcon(benefit.type);
            const enrollmentRate = getEnrollmentRate(benefit.enrolled, benefit.eligible);
            
            return (
              <Card key={benefit.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{benefit.name}</CardTitle>
                        <p className="text-sm text-gray-500">{benefit.provider}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{benefit.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Enrolled</p>
                        <p className="text-xl font-bold text-green-600">
                          {benefit.enrolled}/{benefit.eligible}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Monthly Cost</p>
                        <p className="text-xl font-bold text-blue-600">
                          ${benefit.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Enrollment Rate</span>
                        <span className="font-medium">{enrollmentRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            enrollmentRate >= 90 ? 'bg-green-500' :
                            enrollmentRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${enrollmentRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Button variant="outline" size="sm">
                        View Enrolled
                      </Button>
                      <Button variant="outline" size="sm">
                        Manage Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ExtensibleLayout>
  );
} 