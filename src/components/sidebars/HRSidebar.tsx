import {
  // Users, // Unused
  Briefcase,
  CalendarDays,
  DollarSign,
  // ClipboardList, // Unused
  // UserCheck, // Unused
  // BarChart3, // Unused
  FileText,
  // Building, // Unused
  Clock,
  Users2,
  ClipboardCheck, // Added for Onboarding Tracker
  Building2, // Added for Org Structure
  UserPlus, // Added for Recruitment
  Target, // Added for Shift Planning
  BadgeDollarSign, // Added for Salary Structures
  Handshake, // Added for Benefits Administration
  BarChart, // Added for Performance Reviews
  // GanttChartSquare, // Unused import
  // Settings, // Unused
  // LifeBuoy, // Unused
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const hrSidebarSections: SidebarSection[] = [
  {
    title: "People & Organization",
    items: [
      { label: "Employee Directory", href: "/hr/employees", icon: Users2 },
      { label: "Onboarding Tracker", href: "/hr/onboarding", icon: ClipboardCheck },
      { label: "Org Structure", href: "/hr/org-chart", icon: Building2 },
      // { label: "Teams Management", href: "/hr/teams", icon: GanttChartSquare },
      { label: "Recruitment", href: "/hr/recruitment", icon: UserPlus },
    ]
  },
  {
    title: "Time Management",
    items: [
      { label: "Attendance Log", href: "/hr/attendance", icon: Clock },
      { label: "Leave Management", href: "/hr/leave", icon: CalendarDays },
      { label: "Timesheets", href: "/hr/timesheets", icon: FileText },
      { label: "Shift Planning", href: "/hr/shifts", icon: Target },
    ]
  },
  {
    title: "Compensation",
    items: [
      { label: "Payroll Processing", href: "/hr/payroll", icon: DollarSign },
      { label: "Salary Structures", href: "/hr/salaries", icon: BadgeDollarSign },
      { label: "Benefits Administration", href: "/hr/benefits", icon: Handshake },
    ]
  },
  {
    title: "Performance & Development",
    items: [
      { label: "Performance Reviews", href: "/hr/performance", icon: BarChart },
      { label: "Career Development", href: "/hr/development", icon: Briefcase },
    ]
  }
];
