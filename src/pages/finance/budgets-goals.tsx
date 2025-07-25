import React from 'react';
import { ExtensibleLayout } from '@/components/layout/ExtensibleLayout';
import { financeSidebarSections } from '@/components/sidebars/FinanceSidebar';
import { BudgetsSection } from '@/sections/finance/budgets';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDisplayName } from '@/lib/utils';

export default function BudgetsGoalsPage() {
  const { user: authUser } = useAuth();

  // Transform auth user to layout user format
  const user = authUser ? {
    name: getUserDisplayName(authUser),
    email: authUser.email,
    role: authUser.role || 'User',
    avatarUrl: authUser.avatar_url || undefined
  } : {
    name: '',
    email: '',
    role: '',
    avatarUrl: undefined
  };

  return (
    <ExtensibleLayout moduleSidebar={financeSidebarSections} moduleTitle="Finance & Accounting" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Budgets & Goals</h1>
          <p className="text-muted-foreground">
            Plan your finances with budgets and track spending
          </p>
        </div>

        <BudgetsSection />
      </div>
    </ExtensibleLayout>
  );
}
