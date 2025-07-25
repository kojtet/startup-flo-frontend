import React, { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './AuthContext';
import { SubscriptionProvider } from './SubscriptionContext';

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
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 