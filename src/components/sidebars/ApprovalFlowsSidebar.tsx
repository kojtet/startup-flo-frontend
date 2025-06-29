import { 
  FileText,
  Settings, 
  Inbox, 
  CheckCircle, // Changed from CheckSquare, imported CheckCircle
  BarChart2 // Changed from BarChart3, imported BarChart2
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const approvalFlowsSidebarSections: SidebarSection[] = [
  {
    title: "Flow Management",
    items: [
      { label: "Templates", href: "/approval-flows/templates", icon: FileText },
      { label: "Steps Builder", href: "/approval-flows/steps-builder", icon: Settings },
    ],
  },
  {
    title: "Requests",
    items: [
      { label: "Inbox", href: "/approval-flows/inbox", icon: Inbox, badge: "12" },
      { label: "My Approvals", href: "/approval-flows/my-approvals", icon: CheckCircle },
    ],
  },
  {
    title: "Insights",
    items: [
      { label: "Analytics", href: "/approval-flows/analytics", icon: BarChart2 },
    ],
  },
];
