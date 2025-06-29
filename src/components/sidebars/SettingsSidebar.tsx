import { 
  Building, 
  Users, 
  Shield, 
  Settings,
  Bell,
  CreditCard,
  Database,
  Globe,
  Key,
  Mail,
  Palette,
  Zap,
  Lock,
  UserCog
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const settingsSidebarSections: SidebarSection[] = [
  {
    title: "Organization",
    items: [
      { label: "Departments", href: "/settings/departments", icon: Building },
      { label: "Access Control", href: "/settings/access-control", icon: Shield },
      { label: "User Roles", href: "/settings/roles", icon: UserCog },
    ]
  },
  {
    title: "Company Settings",
    items: [
      { label: "General", href: "/settings/general", icon: Settings },
      { label: "Notifications", href: "/settings/notifications", icon: Bell },
      { label: "Branding", href: "/settings/branding", icon: Palette },
      { label: "Integrations", href: "/settings/integrations", icon: Zap },
    ]
  },
  {
    title: "Security & Privacy",
    items: [
      { label: "Security Settings", href: "/settings/security", icon: Lock },
      { label: "API Keys", href: "/settings/api-keys", icon: Key },
      { label: "Data Management", href: "/settings/data", icon: Database },
    ]
  },
  {
    title: "Billing & Plans",
    items: [
      { label: "Subscription", href: "/settings/subscription", icon: CreditCard },
      { label: "Usage & Limits", href: "/settings/usage", icon: Globe },
      { label: "Email Settings", href: "/settings/email", icon: Mail },
    ]
  }
];
