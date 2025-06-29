
import { 
  Folder, 
  Share2, 
  Network, 
  History, 
  Trash2 
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const filesSidebarSections: SidebarSection[] = [
  {
    title: "Personal Space",
    items: [
      { label: "My Files", href: "/files/my-files", icon: Folder },
      { label: "Shared with Me", href: "/files/shared", icon: Share2 },
    ]
  },
  {
    title: "Company Storage",
    items: [
      { label: "Company Folders", href: "/files/company-folders", icon: Network },
    ]
  },
  {
    title: "Utilities",
    items: [
      { label: "Recent", href: "/files/recent", icon: History },
      { label: "Trash", href: "/files/trash", icon: Trash2 },
    ]
  }
];
