
import { 
  Wallet, 
  Tags, 
  ListOrdered, 
  ArrowLeftRight, 
  PieChart, 
  Receipt, 
  FilePieChart 
} from "lucide-react";
import { SidebarSection } from "@/components/ui/extensible-sidebar";

export const financeSidebarSections: SidebarSection[] = [
  {
    title: "Core Banking",
    items: [
      { label: "Accounts & Balances", href: "/finance/accounts-balances", icon: Wallet },
      { label: "Categories", href: "/finance/categories", icon: Tags },
      { label: "Transactions Ledger", href: "/finance/transactions-ledger", icon: ListOrdered },
      // { label: "Transfers", href: "/finance/transfers", icon: ArrowLeftRight },
    ]
  },
  {
    title: "Financial Planning",
    items: [
      { label: "Budgets & Goals", href: "/finance/budgets-goals", icon: PieChart },
    ]
  },
  {
    title: "Billing & Reporting",
    items: [
      { label: "Invoices & Bills", href: "/finance/invoices-bills", icon: Receipt },
      { label: "Financial Reports", href: "/finance/reports", icon: FilePieChart },
    ]
  }
];
