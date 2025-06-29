
import { 
  Store, 
  FileQuestion, 
  ShoppingCart, 
  FileClock, 
  CreditCard
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const procurementSidebarSections: SidebarSection[] = [
  {
    title: "Vendor & Sourcing",
    items: [
      { label: "Vendors Directory", href: "/procurement/vendors", icon: Store },
      { label: "RFQs", href: "/procurement/rfqs", icon: FileQuestion },
    ]
  },
  {
    title: "Purchasing",
    items: [
      { label: "Purchase Orders", href: "/procurement/purchase-orders", icon: ShoppingCart },
      { label: "Contracts & Expiry", href: "/procurement/contracts", icon: FileClock },
    ]
  },
  {
    title: "Analytics",
    items: [
      { label: "Spend Reports", href: "/procurement/spend-reports", icon: CreditCard },
    ]
  }
];
