import React, { createContext, useContext, ReactNode } from 'react';

interface SubscriptionContextType {
  shouldShowUpgrade: boolean;
  getSubscriptionBadgeInfo: () => { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  // For now, we'll use a simple implementation
  // In a real app, this would check the user's subscription status
  const shouldShowUpgrade = false; // Set to true to show upgrade prompts
  
  const getSubscriptionBadgeInfo = () => {
    return {
      text: 'Free',
      variant: 'secondary' as const
    };
  };

  const value: SubscriptionContextType = {
    shouldShowUpgrade,
    getSubscriptionBadgeInfo,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (ctx === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
} 