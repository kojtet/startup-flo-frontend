import React from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { financeSidebarSections } from '@/components/sidebars/FinanceSidebar';
import { CategoriesSection } from '@/sections/finance/categories';

export default function CategoriesPage() {
  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting">
      <CategoriesSection />
    </ExtensibleLayout>
  );
}
