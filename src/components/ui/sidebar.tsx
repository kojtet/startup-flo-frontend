
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Contact,
  Wallet,
  Archive,
  ShoppingCart,
  FileArchive,
  GitPullRequest,
  Settings
} from "lucide-react";
import { ExtensibleSidebar, SidebarSection } from "@/components/ui/extensible-sidebar";

const mainNavSections: SidebarSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    title: "Core Modules",
    items: [
      { label: "HR", href: "/hr", icon: Users },
      { label: "Projects", href: "/projects", icon: Briefcase },
      { label: "CRM", href: "/crm", icon: Contact },
      { label: "Finance", href: "/finance", icon: Wallet },
    ]
  },
  {
    title: "Operations",
    items: [
      { label: "Assets", href: "/assets", icon: Archive },
      { label: "Procurement", href: "/procurement", icon: ShoppingCart },
      { label: "Files", href: "/files", icon: FileArchive },
      { label: "Approvals", href: "/approval-flows", icon: GitPullRequest },
    ]
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ]
  }
];

export function Sidebar() {
  return (
    <ExtensibleSidebar 
      sections={mainNavSections}
      // Removed showLogo={true}
      width="md"
      isMainSidebar={true}
    />
  );
}
