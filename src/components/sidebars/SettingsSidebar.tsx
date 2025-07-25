import { Settings, Building2, Users2, Shield, Bell, Palette, Globe, CreditCard } from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const settingsSidebarSections: SidebarSection[] = [
  {
    title: "Organization",
    items: [
      { label: "Departments", href: "/settings/departments", icon: Building2 },
      { label: "Access Control", href: "/settings/access-control", icon: Shield },
      { label: "User Roles", href: "/settings/roles", icon: Users2 },
    ]
  },
  {
    title: "Company Settings",
    items: [
      { label: "General", href: "/settings/general", icon: Settings },
      { label: "Notifications", href: "/settings/notifications", icon: Bell },
      { label: "Branding", href: "/settings/branding", icon: Palette },
      { label: "Integrations", href: "/settings/integrations", icon: Users2 },
    ]
  },
  {
    title: "Security & Privacy",
    items: [
      { label: "Security Settings", href: "/settings/security", icon: Users2 },
      { label: "API Keys", href: "/settings/api-keys", icon: Users2 },
      { label: "Data Management", href: "/settings/data", icon: Users2 },
    ]
  },
  {
    title: "Billing & Plans",
    items: [
      { label: "Subscription", href: "/settings/subscription", icon: CreditCard },
      { label: "Usage & Limits", href: "/settings/usage", icon: Globe },
      { label: "Email Settings", href: "/settings/email", icon: Users2 },
    ]
  }
];
