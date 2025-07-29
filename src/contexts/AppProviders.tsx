import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './AuthContext';
import { SubscriptionProvider } from './SubscriptionContext';
import { CompanyProvider } from './CompanyContext';
import { UserProvider } from './UserContext';
import { TimeFenceProvider } from './TimeFenceContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <UserProvider>
          <CompanyProvider>
            <SubscriptionProvider>
              <TimeFenceProvider>
                {children}
              </TimeFenceProvider>
            </SubscriptionProvider>
          </CompanyProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 