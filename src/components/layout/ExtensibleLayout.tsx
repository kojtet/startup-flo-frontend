import React from 'react';
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar-provider";
import { ExtensibleSidebar, SidebarSection } from "@/components/ui/extensible-sidebar";
import { Navbar } from "./Navbar";
import { 
  LayoutDashboard,
  Users as UsersIcon,
  Briefcase,
  Contact,
  Wallet,
  Archive,
  ShoppingCart,
  FileArchive,
  GitPullRequest,
  Settings as SettingsIcon
} from "lucide-react";

interface ExtensibleLayoutProps {
  children: React.ReactNode;
  moduleSidebar?: SidebarSection[];
  moduleTitle?: string;
  // Removed onBackToMain prop
}

function LayoutContent({ children, moduleSidebar, moduleTitle }: ExtensibleLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Global Header - Fixed and covers everything with proper spacing */}
      <Navbar onMobileMenuToggle={handleMobileMenuToggle} />

      {/* Main Sidebar - Always visible on desktop, fixed width */}
      <div className={`${mobileSidebarOpen ? "block" : "hidden"} md:block pt-[60px]`}>
        <ExtensibleSidebar
          sections={[
            {
              items: [
                { label: "Dashboard", href: "/", icon: LayoutDashboard },
                { label: "HR", href: "/hr", icon: UsersIcon },
                { label: "Projects", href: "/projects", icon: Briefcase },
                { label: "CRM", href: "/crm", icon: Contact },
                { label: "Finance", href: "/finance", icon: Wallet },
                { label: "Assets", href: "/assets", icon: Archive },
                { label: "Vendors", href: "/procurement", icon: ShoppingCart },
                { label: "Files", href: "/files", icon: FileArchive },
                { label: "Approvals", href: "/approval-flows", icon: GitPullRequest },
                { label: "Settings", href: "/settings", icon: SettingsIcon },
              ]
            }
          ]}
          width="sm"
          isMainSidebar={true}
        />
      </div>

      {/* Module Sidebar - Only visible when moduleSidebar is provided */}
      {moduleSidebar && (
        <div className="hidden md:block pt-[60px]">
          <ExtensibleSidebar
            sections={moduleSidebar}
            // Removed showLogo={false}
            title={moduleTitle}
            width="md"
            isMainSidebar={false}
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden pt-[60px]">
        <main className="flex-1 overflow-y-auto p-6 ml-3">
          {children}
        </main>
      </div>
    </div>
  );
}

export function ExtensibleLayout(props: ExtensibleLayoutProps) {
  return (
    <SidebarProvider>
      <LayoutContent {...props} />
    </SidebarProvider>
  );
}
