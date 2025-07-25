import React, { useState, useEffect } from "react";
import { ExtensibleLayout } from "@/components/layout/ExtensibleLayout";
import { useAuth } from "@/contexts/AuthContext";
import { procurementSidebarSections } from "@/components/sidebars/ProcurementSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { transformUserForLayout } from "@/lib/utils";
import {
  ShoppingCart,
  Plus,
  FileText,
  Truck,
  Package,
  CheckCircle,
  Loader2
} from "lucide-react";

export default function PurchaseOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Transform user for layout compatibility
  const layoutUser = transformUserForLayout(user);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <ExtensibleLayout
        moduleSidebar={procurementSidebarSections}
        moduleTitle="Procurement"
        user={layoutUser || { name: '', email: '', role: '', avatarUrl: undefined }}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </ExtensibleLayout>
    );
  }

  return (
    <ExtensibleLayout
      moduleSidebar={procurementSidebarSections}
      moduleTitle="Procurement"
      user={layoutUser || { name: '', email: '', role: '', avatarUrl: undefined }}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">
              Create and manage purchase orders with vendors
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create PO
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total POs</p>
                  <p className="text-xl font-bold">45</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">In Transit</p>
                  <p className="text-xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Delivered</p>
                  <p className="text-xl font-bold">25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">PO-2024-001</h4>
                  <p className="text-sm text-muted-foreground">Office Equipment • TechCorp Solutions • $125,000</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Delivered</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">PO-2024-002</h4>
                  <p className="text-sm text-muted-foreground">Furniture • Furniture World • $45,000</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">In Transit</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">PO-2024-003</h4>
                  <p className="text-sm text-muted-foreground">Office Supplies • Office Inc • $12,000</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">PO-2024-004</h4>
                  <p className="text-sm text-muted-foreground">Cleaning Services • Clean Pro • $8,000</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExtensibleLayout>
  );
}
