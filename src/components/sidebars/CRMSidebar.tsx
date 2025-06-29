import { 
  Inbox, 
  Users2, 
  Briefcase, 
  List, 
  Send, 
  BarChart2 
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const crmSidebarSections: SidebarSection[] = [
  {
    title: "Sales Pipeline",
    items: [
      { label: "Leads Inbox", href: "/crm/leads", icon: Inbox, badge: "5" },
      { label: "Contacts & Accounts", href: "/crm/contacts", icon: Users2 },
      { label: "Opportunities", href: "/crm/opportunities", icon: Briefcase },
    ],
  },
  {
    title: "Customer Engagement",
    items: [
      { label: "Activities & Notes", href: "/crm/activities", icon: List },
      { label: "Campaigns", href: "/crm/campaigns", icon: Send },
    ],
  },
  {
    title: "Reporting",
    items: [
      { label: "Sales Reports", href: "/crm/reports", icon: BarChart2 },
    ],
  },
];
