
import { 
  Archive, 
  Clipboard, 
  CalendarCheck2, 
  TrendingDown, 
  Tags 
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const assetsSidebarSections: SidebarSection[] = [
  {
    title: "Asset Management",
    items: [
      { label: "Asset Register", href: "/assets/register", icon: Archive },
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
