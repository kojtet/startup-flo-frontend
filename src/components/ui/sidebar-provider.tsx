import { createContext, useContext, useState, ReactNode, useMemo } from "react";

// Define a more specific type for sidebar data if possible, or use a generic
// For now, we'll keep it flexible but acknowledge it might need refinement
// based on actual data structures used.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SidebarDataType = any; 

interface SidebarContextType {
  currentSidebar: "main" | "module" | "detail";
  setSidebar: (sidebar: "main" | "module" | "detail") => void;
  sidebarData: SidebarDataType;
  setSidebarData: (data: SidebarDataType) => void;
  sidebarHistory: string[];
  pushSidebar: (sidebar: string, data?: SidebarDataType) => void;
  popSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [currentSidebar, setCurrentSidebar] = useState<"main" | "module" | "detail">("main");
  const [sidebarData, setSidebarData] = useState<SidebarDataType>(null);
  const [sidebarHistory, setSidebarHistory] = useState<string[]>(["main"]);

  const setSidebar = (sidebar: "main" | "module" | "detail") => {
    setCurrentSidebar(sidebar);
  };

  const pushSidebar = (sidebar: string, data?: SidebarDataType) => {
    setSidebarHistory(prev => [...prev, sidebar]);
    setCurrentSidebar(sidebar as "main" | "module" | "detail");
    if (data) setSidebarData(data);
  };

  const popSidebar = () => {
    if (sidebarHistory.length > 1) {
      const newHistory = [...sidebarHistory];
      newHistory.pop();
      setSidebarHistory(newHistory);
      setCurrentSidebar(newHistory[newHistory.length - 1] as "main" | "module" | "detail");
    }
  };

  const value = useMemo(() => ({
    currentSidebar,
    setSidebar,
    sidebarData,
    setSidebarData,
    sidebarHistory,
    pushSidebar,
    popSidebar
  }), [currentSidebar, sidebarData, sidebarHistory]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
