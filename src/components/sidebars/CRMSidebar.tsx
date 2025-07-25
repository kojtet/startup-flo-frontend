import { 
  Inbox, 
  Users2, 
  Briefcase, 
  List, 
  Send, 
  BarChart2,
  Tag,
  Building,
  Calendar,
  FileText
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const crmSidebarSections: SidebarSection[] = [
  {
    title: "Sales Pipeline",
    items: [
      { label: "Leads Inbox", href: "/crm/leads", icon: Inbox, badge: "5" },
      { label: "Lead Categories", href: "/crm/categories", icon: Tag },
      { label: "Contacts", href: "/crm/contacts", icon: Users2 },
      { label: "Accounts", href: "/crm/accounts", icon: Building },
      { label: "Opportunities", href: "/crm/opportunities", icon: Briefcase },
    ],
  },
  {
    title: "Customer Engagement",
    items: [
      { label: "Activities", href: "/crm/activities", icon: Calendar },
      { label: "Notes", href: "/crm/notes", icon: FileText },
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
