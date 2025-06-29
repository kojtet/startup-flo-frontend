import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Menu, 
  LogOut, 
  User, 
  Settings as SettingsIcon,
  UserPlus,
  ChevronDown,
  Bell,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Search,
  Command,
  FileText,
  Users,
  DollarSign,
  Briefcase,
  Archive,
  ShoppingCart,
  GitPullRequest,
  LayoutDashboard,
  Hash,
  Plus,
  Sun,
  Moon,
  HelpCircle,
  Mail,
  Lock,
  CreditCard,
  Languages
} from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    companyId?: string;
  } | null;
}

export function Navbar({ onMobileMenuToggle, user }: NavbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { getSubscriptionBadgeInfo } = useSubscription();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  interface SearchItem {
    id: string;
    type: 'page' | 'action';
    label: string;
    href?: string;
    action?: string;
    icon: React.ElementType;
    description: string;
    category: string;
  }

  const [recentItems, setRecentItems] = useState<SearchItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(5);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  // Search commands and pages - memoized to prevent re-creation
  const searchItems = useMemo((): SearchItem[] => [
    { 
      id: 'dashboard',
      type: 'page' as const, 
      label: 'Dashboard', 
      href: '/', 
      icon: LayoutDashboard, 
      description: 'Overview and analytics',
      category: 'General'
    },
    { 
      id: 'hr',
      type: 'page' as const, 
      label: 'HR Management', 
      href: '/hr', 
      icon: Users, 
      description: 'Employee and team management',
      category: 'Management'
    },
    { 
      id: 'projects',
      type: 'page' as const, 
      label: 'Projects', 
      href: '/projects', 
      icon: Briefcase, 
      description: 'Project tracking and management',
      category: 'Operations'
    },
    { 
      id: 'crm',
      type: 'page' as const, 
      label: 'CRM', 
      href: '/crm', 
      icon: MessageSquare, 
      description: 'Customer relationship management',
      category: 'Sales'
    },
    { 
      id: 'finance',
      type: 'page' as const, 
      label: 'Finance', 
      href: '/finance', 
      icon: DollarSign, 
      description: 'Financial management and reporting',
      category: 'Finance'
    },
    { 
      id: 'assets',
      type: 'page' as const, 
      label: 'Assets', 
      href: '/assets', 
      icon: Archive, 
      description: 'Asset tracking and management',
      category: 'Operations'
    },
    { 
      id: 'procurement',
      type: 'page' as const, 
      label: 'Procurement', 
      href: '/procurement', 
      icon: ShoppingCart, 
      description: 'Vendor and purchasing management',
      category: 'Operations'
    },
    { 
      id: 'files',
      type: 'page' as const, 
      label: 'Files', 
      href: '/files', 
      icon: FileText, 
      description: 'Document management',
      category: 'General'
    },
    { 
      id: 'approvals',
      type: 'page' as const, 
      label: 'Approval Flows', 
      href: '/approval-flows', 
      icon: GitPullRequest, 
      description: 'Workflow approvals',
      category: 'Operations'
    },
    { 
      id: 'settings',
      type: 'page' as const, 
      label: 'Settings', 
      href: '/settings', 
      icon: SettingsIcon, 
      description: 'Application settings',
      category: 'General'
    },
    { 
      id: 'invite',
      type: 'action' as const, 
      label: 'Invite Team Member', 
      action: 'invite', 
      icon: UserPlus, 
      description: 'Send invitation to new team member',
      category: 'Actions'
    },
    { 
      id: 'new-project',
      type: 'action' as const, 
      label: 'Create New Project', 
      action: 'new-project', 
      icon: Plus, 
      description: 'Start a new project',
      category: 'Actions'
    },
    { 
      id: 'new-contact',
      type: 'action' as const, 
      label: 'Add New Contact', 
      action: 'new-contact', 
      icon: User, 
      description: 'Add contact to CRM',
      category: 'Actions'
    },
  ], []);

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    return searchQuery 
      ? searchItems.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : [];
  }, [searchQuery, searchItems]);

  // Group items by category for better organization
  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof filteredItems>);
  }, [filteredItems]);

  const handleItemSelect = useCallback((item: SearchItem) => {
    // Add to recent items
    setRecentItems(prev => {
      // Remove if already exists
      const filteredRecent = prev.filter(i => i.id !== item.id);
      return [item, ...filteredRecent].slice(0, 5);
    });
    
    if (item.type === 'page' && item.href) {
      router.push(item.href);
    } else if (item.type === 'action') {
      console.log('Action:', item.action);
      // Show success feedback for actions
      if (item.id === 'invite') {
        // Trigger invite modal or action
      }
    }
    setSearchOpen(false);
    setSearchQuery("");
  }, [router]);

  // Initialize recent items from localStorage
  useEffect(() => {
    const storedRecent = localStorage.getItem("recentSearches");
    if (storedRecent) {
      try {
        const parsedItems = JSON.parse(storedRecent);
        if (Array.isArray(parsedItems)) {
          setRecentItems(parsedItems);
        }
      } catch (e) {
        console.error("Failed to parse recent searches from localStorage", e);
        setRecentItems([]);
      }
    }
  }, []);

  // Save recent items to localStorage
  useEffect(() => {
    if (recentItems.length > 0) {
      localStorage.setItem("recentSearches", JSON.stringify(recentItems.slice(0, 5)));
    }
  }, [recentItems]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      
      // Escape to close search
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      
      // Arrow navigation in search
      if (searchOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        setSelectedIndex(prev => {
          const items = searchQuery ? filteredItems : recentItems.length > 0 ? recentItems : searchItems.slice(0, 6);
          const maxIndex = Math.min(7, items.length - 1);
          
          if (e.key === 'ArrowDown') {
            return prev >= maxIndex ? 0 : prev + 1;
          } else {
            return prev <= 0 ? maxIndex : prev - 1;
          }
        });
      }
      
      // Enter to select in search
      if (searchOpen && e.key === 'Enter') {
        const items = searchQuery ? filteredItems : recentItems.length > 0 ? recentItems : searchItems.slice(0, 6);
        if (items[selectedIndex]) {
          handleItemSelect(items[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, searchQuery, selectedIndex, filteredItems, recentItems, searchItems, handleItemSelect]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Dummy notifications data
  const notifications = [
    {
      id: 1,
      type: "success",
      icon: CheckCircle,
      title: "Project approved",
      message: "Your project proposal has been approved by the team lead",
      time: "2 minutes ago",
      unread: true
    },
    {
      id: 2,
      type: "warning",
      icon: AlertCircle,
      title: "Deadline approaching",
      message: "Project deadline is in 2 days. Please update your progress",
      time: "1 hour ago",
      unread: true
    },
    {
      id: 3,
      type: "info",
      icon: MessageSquare,
      title: "New message",
      message: "Sarah Johnson commented on your task",
      time: "3 hours ago",
      unread: false
    },
    {
      id: 4,
      type: "info",
      icon: Calendar,
      title: "Meeting reminder",
      message: "Team standup meeting in 30 minutes",
      time: "5 hours ago",
      unread: false
    },
    {
      id: 5,
      type: "success",
      icon: CheckCircle,
      title: "Invoice paid",
      message: "Invoice #INV-2024-001 has been successfully paid",
      time: "1 day ago",
      unread: false
    }
  ];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success": return "text-green-600";
      case "warning": return "text-amber-600";
      case "error": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  const markAllAsRead = () => {
    setUnreadNotifications(0);
  };

  const badgeInfo = getSubscriptionBadgeInfo();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2">
          {/* Left side - Logo & Mobile menu button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuToggle}
              className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-9 w-9 mr-1"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
            
            <div className="text-xl font-bold flex items-center">
              <span className="text-blue-600">Startup</span>
              <span className="text-gray-900 dark:text-white">Flo</span>
              <Badge variant={badgeInfo.variant} className="ml-2 hidden sm:flex">
                {badgeInfo.text}
              </Badge>
            </div>
          </div>

          {/* Center - Search (desktop) */}
          <div className="hidden md:flex flex-1 justify-center max-w-lg mx-4">
            <Button
              variant="outline"
              onClick={() => setSearchOpen(true)}
              className="w-full justify-between text-left text-gray-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 h-9 px-3 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">Search pages and commands...</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="hidden sm:inline-flex items-center rounded border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                  <Command className="h-3 w-3 mr-0.5" />K
                </kbd>
              </div>
            </Button>
          </div>

          {/* Right side - Actions and User menu */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search button (mobile) */}
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-9 w-9"
            >
              <Search className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Invite button */}
            <Button 
              variant="outline" 
              size="sm"
              className="hidden sm:flex items-center space-x-2 text-sm px-3 py-1.5 h-9 border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Team</span>
            </Button>

            {/* Help Center */}
            <Button 
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => router.push('/help')}
            >
              <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-9 w-9"
                >
                  <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center text-xs p-0 min-w-0"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-80 max-h-[28rem] overflow-y-auto" 
                align="end"
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadNotifications > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </Button>
                      <Badge variant="secondary" className="text-xs">
                        {unreadNotifications} new
                      </Badge>
                    </div>
                  )}
                </div>
                
                {notifications.map((notification) => {
                  const IconComponent = notification.icon;
                  return (
                    <div key={notification.id}>
                      <DropdownMenuItem className="flex items-start space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <div className={`mt-0.5 ${getNotificationColor(notification.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </p>
                            {notification.unread && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full ml-2"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="last:hidden" />
                    </div>
                  );
                })}
                
                <DropdownMenuItem 
                  className="px-4 py-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer font-medium"
                  onClick={() => router.push('/notifications')}
                >
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 h-9 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Avatar className="h-7 w-7">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name || 'User'} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium">
                          {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight truncate max-w-[100px]">
                        {user.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight truncate max-w-[100px]">
                        {user.role || 'User'}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email || 'No email'}</p>
                  </div>
                
                <DropdownMenuItem 
                  className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => router.push('/profile')}
                >
                  <User className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">View Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <SettingsIcon className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">Settings</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-48">
                      <DropdownMenuItem>
                        <User className="mr-3 h-4 w-4" />
                        Account
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Lock className="mr-3 h-4 w-4" />
                        Security
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="mr-3 h-4 w-4" />
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Languages className="mr-3 h-4 w-4" />
                        Language
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                
                <DropdownMenuItem className="flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <Mail className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Support</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="flex items-center px-4 py-2.5 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 h-9 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gray-300 text-gray-600 text-xs font-medium">
                    U
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-500 leading-tight">
                    Loading...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Command Palette */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent 
          className="max-w-2xl p-0 gap-0 overflow-hidden rounded-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center px-4 py-3">
              <Search className="h-4 w-4 text-gray-400 mr-3" />
              <Input
                placeholder="Search pages, commands, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent text-sm placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0 flex-1"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex items-center rounded border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 ml-2">
                ESC
              </kbd>
            </div>
          </div>

          <div className="max-h-[30rem] overflow-y-auto" ref={searchResultsRef}>
            {searchQuery ? (
              <>
                {Object.keys(groupedItems).length > 0 ? (
                  Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category} className="py-2">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {category}
                      </div>
                      {items.slice(0, 5).map((item, index) => {
                        const IconComponent = item.icon;
                        const isSelected = selectedIndex === index;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemSelect(item)}
                            className={cn(
                              "w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors duration-150",
                              isSelected 
                                ? "bg-gray-100 dark:bg-gray-800" 
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            )}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className="flex-shrink-0">
                              <IconComponent className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.label}
                                </p>
                                {item.type === 'page' && (
                                  <Hash className="h-3 w-3 text-gray-300 dark:text-gray-600" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {item.description}
                              </p>
                            </div>
                            {item.type === 'page' && (
                              <div className="flex-shrink-0">
                                <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                  Page
                                </div>
                              </div>
                            )}
                            {item.type === 'action' && (
                              <div className="flex-shrink-0">
                                <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                  Action
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No results found for "{searchQuery}"
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Try different keywords or check spelling
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-2">
                {recentItems.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Recent
                    </div>
                    {recentItems.map((item, index) => {
                      const IconComponent = item.icon;
                      const isSelected = selectedIndex === index;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className={cn(
                            "w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors duration-150",
                            isSelected 
                              ? "bg-gray-100 dark:bg-gray-800" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          )}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className="flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {item.category}
                          </div>
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quick Access
                    </div>
                    {searchItems.slice(0, 6).map((item, index) => {
                      const IconComponent = item.icon;
                      const isSelected = selectedIndex === index;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className={cn(
                            "w-full flex items-center space-x-3 px-4 py-2.5 text-left transition-colors duration-150",
                            isSelected 
                              ? "bg-gray-100 dark:bg-gray-800" 
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          )}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className="flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {item.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="inline-flex items-center rounded border border-gray-200 dark:border-gray-700 px-1.5 py-1 font-medium bg-white dark:bg-gray-800">
                    ↑↓
                  </kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="inline-flex items-center rounded border border-gray-200 dark:border-gray-700 px-1.5 py-1 font-medium bg-white dark:bg-gray-800">
                    ↵
                  </kbd>
                  <span>Select</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="inline-flex items-center rounded border border-gray-200 dark:border-gray-700 px-1.5 py-1 font-medium bg-white dark:bg-gray-800">
                  ESC
                </kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
