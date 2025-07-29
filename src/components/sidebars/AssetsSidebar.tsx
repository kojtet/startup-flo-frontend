
import { 
  Archive, 
  Clipboard, 
  CalendarCheck2, 
  TrendingDown, 
  Tags,
  BarChart3,
  List
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const assetsSidebarSections: SidebarSection[] = [
  {
    title: "Asset Management",
    items: [
      { label: "Overview", href: "/assets", icon: BarChart3 },
      { label: "Asset Register", href: "/assets/register", icon: List },
      { label: "Assignments", href: "/assets/assignments", icon: Clipboard },
      { label: "Categories", href: "/assets/categories", icon: Tags },
    ]
  },
  {
    title: "Maintenance & Reporting",
    items: [
      { label: "Maintenance Calendar", href: "/assets/maintenance-calendar", icon: CalendarCheck2 },
      { label: "Depreciation Report", href: "/assets/depreciation-report", icon: TrendingDown },
    ]
  }
];
