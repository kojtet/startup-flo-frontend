import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  variant?: "default" | "upgrade";
  hasNotification?: boolean; // For highlighting items with pending actions
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface ExtensibleSidebarProps {
  sections: SidebarSection[];
  // Removed showLogo prop
  title?: string;
  width?: "sm" | "md" | "lg";
  isMainSidebar?: boolean;
}

export function ExtensibleSidebar({
  sections,
  // Removed showLogo from destructuring
  title,
  width = "md",
  isMainSidebar = false
}: ExtensibleSidebarProps) {
  const router = useRouter();

  const widthClasses = {
    sm: "w-20",
    md: "w-64", 
    lg: "w-80"
  };

  const sidebarWidth = widthClasses[width];

  return (
    <div className={cn(
      "flex flex-col transition-all duration-200",
      sidebarWidth,
      isMainSidebar 
        ? "bg-gray-900 border border-gray-700 rounded-xl m-3 mr-0 h-[calc(100vh-5rem)]" 
        : "bg-white border-r border-gray-200 h-[calc(100vh-4rem)] ml-3"
    )}>
      {/* Header - Minimal design for module sidebar */}
      {title && !isMainSidebar && (
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">{title}</h2>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto",
        isMainSidebar ? "p-3 pt-6" : "p-3 space-y-1"
      )}>
        {sections.map((section, sectionIndex) => {
          // Skip upgrade section in main nav - it will be rendered separately at bottom
          if (section.items.some(item => item.variant === "upgrade")) {
            return null;
          }
          
          return (
            <div key={sectionIndex} className={!isMainSidebar ? "mb-4" : ""}>
              {section.title && !isMainSidebar && (
                <div className="mb-3">
                  <h3 className="text-xs font-medium text-gray-500 px-2 mb-2">
                    {section.title}
                  </h3>
                </div>
              )}
              <ul className={cn("space-y-1", isMainSidebar && "space-y-2")}>
                {section.items.map((item, itemIndex) => {
                  const isActive = router.pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <li key={itemIndex}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex transition-colors duration-150 group relative",
                          isMainSidebar 
                            ? "flex-col items-center p-2 text-xs font-medium rounded-lg" 
                            : "flex-row items-center space-x-3 px-3 py-2 text-sm rounded-md",
                          item.variant === "upgrade"
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                            : item.hasNotification && !isActive
                              ? isMainSidebar
                                ? "text-red-400 hover:text-red-300 bg-red-50/10"
                                : "text-red-700 bg-red-50 hover:bg-red-100 border-l-4 border-red-500"
                              : isActive
                                ? isMainSidebar 
                                  ? "text-white" 
                                  : "bg-gray-100 text-gray-900"
                                : isMainSidebar
                                  ? "text-gray-400 hover:text-white"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        {/* Icon - Minimal styling */}
                        <div className={cn(
                          "flex items-center justify-center",
                          isMainSidebar && isActive 
                            ? "bg-white rounded-lg p-2 mb-1" 
                            : isMainSidebar && item.hasNotification
                              ? "bg-red-100 rounded-lg p-2 mb-1"
                              : isMainSidebar 
                                ? "mb-1" 
                                : ""
                        )}>
                          <Icon className={cn(
                            "flex-shrink-0 h-4 w-4",
                            isActive && isMainSidebar 
                              ? "text-blue-600" 
                              : item.hasNotification && isMainSidebar
                                ? "text-red-600"
                                : ""
                          )} />
                        </div>
                        
                        {isMainSidebar ? (
                          <span className={cn(
                            "text-center leading-tight text-[10px] font-bold",
                            "px-1 whitespace-nowrap"
                          )}>
                            {item.label}
                          </span>
                        ) : (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && (
                              <span className={cn(
                                "px-2 py-0.5 text-xs rounded font-medium",
                                item.hasNotification
                                  ? "bg-red-500 text-white animate-pulse"
                                  : "bg-gray-100 text-gray-600"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Upgrade section at bottom */}
      {sections.some(section => section.items.some(item => item.variant === "upgrade")) && (
        <div className="p-3 mt-auto">
          {sections.map((section, sectionIndex) => {
            const upgradeItems = section.items.filter(item => item.variant === "upgrade");
            if (upgradeItems.length === 0) return null;
            
            return (
              <div key={`upgrade-${sectionIndex}`}>
                {section.title && (
                  <div className="mb-3">
                    <h3 className="text-xs font-medium text-gray-400 px-2 mb-2">
                      {section.title}
                    </h3>
                  </div>
                )}
                <ul className="space-y-2">
                  {upgradeItems.map((item, itemIndex) => {
                    const Icon = item.icon;
                    
                    return (
                      <li key={itemIndex}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex transition-colors duration-150 group",
                            "flex-col items-center p-2 text-xs font-medium rounded-lg",
                            "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
                          )}
                        >
                          {/* Icon */}
                          <div className={"mb-1"}>
                            <Icon className="flex-shrink-0 h-5 w-5" />
                          </div>
                          
                          <span className={cn(
                            "text-center leading-tight text-[10px] font-bold",
                            "px-1 whitespace-nowrap text-white"
                          )}>
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
