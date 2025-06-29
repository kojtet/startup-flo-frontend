import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { CompanyProvider } from './CompanyContext';
import { SubscriptionProvider } from './SubscriptionContext';
import { ProjectsProvider } from './ProjectsContext';
import { CRMProvider } from './CRMContext';
import { HRProvider } from './HRContext';
import { FinanceProvider } from './FinanceContext';
import { VendorProvider } from './VendorContext';
import { AssetsProvider } from './AssetsContext';
import { Toaster } from '@/components/ui/toaster';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <CompanyProvider>
          <SubscriptionProvider>
            <ProjectsProvider>
              <CRMProvider>
                <HRProvider>
                  <FinanceProvider>
                    <VendorProvider>
                      <AssetsProvider>
                        {children}
                        <Toaster />
                      </AssetsProvider>
                    </VendorProvider>
                  </FinanceProvider>
                </HRProvider>
              </CRMProvider>
            </ProjectsProvider>
          </SubscriptionProvider>
        </CompanyProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default AppProviders;
