import React from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { financeSidebarSections } from '@/components/sidebars/FinanceSidebar';
import { TransactionsSection } from '@/sections/finance/transactions';

export default function TransactionsLedgerPage() {
  return (
    <ExtensibleLayout sidebarSections={financeSidebarSections}>
      <div className="container mx-auto py-6">
        <TransactionsSection />
      </div>
    </ExtensibleLayout>
  );
}
