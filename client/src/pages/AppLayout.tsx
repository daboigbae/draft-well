import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Linkedin, Plus, Search, User, LogOut, Hash, Settings, Menu, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { logout } from "../lib/auth";
import { createPost } from "../lib/posts";
import { PostStatus } from "../types/post";
import Footer from "../components/Footer";
import UsageIndicator from "../components/UsageIndicator";

interface AppLayoutProps {
  children: React.ReactNode;
  onFilterChange?: (filter: PostStatus | "all") => void;
  onTagFilterChange?: (tag: string | null) => void;
  onSearchChange?: (query: string) => void;
  postCounts?: {
    all: number;
    draft: number;
    published: number;
  };
  allTags?: string[];
  currentFilter?: PostStatus | "all";
  currentTagFilter?: string | null;
}

export default function AppLayout({ 
  children, 
  onFilterChange,
  onTagFilterChange,
  onSearchChange, 
  postCounts = { all: 0, draft: 0, published: 0 },
  allTags = [],
  currentFilter = "all",
  currentTagFilter = null
}: AppLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  const handleNewPost = async () => {
    if (!user) return;

    try {
      const postId = await createPost(user.uid, {
        title: "Untitled Post",
        body: "",
        tags: [],
        status: "draft",
        scheduledAt: null,
        aiRated: false,
      });
      setLocation(`/app/post/${postId}`);
    } catch (error) {
      toast({
        title: "Failed to create post",
        description: "There was an error creating your new post.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    }
  };

  const filterButtons = [
    { key: "all" as const, label: "All Posts", count: postCounts.all },
    { key: "draft" as const, label: "Drafts", count: postCounts.draft },
    { key: "published" as const, label: "Published", count: postCounts.published },
  ];

  return (
    <div className="min-h-screen bg-background flex" data-testid="app-layout">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLocation('/app')}
            className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
            data-testid="button-logo-mobile"
          >
            <Linkedin className="text-white h-4 w-4" />
          </button>
          <button 
            onClick={() => setLocation('/app')}
            className="text-lg font-bold text-slate-800"
            data-testid="button-home-mobile"
          >
            Draftwell
          </button>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-600"
          data-testid="button-menu-toggle"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out overflow-hidden
      `} data-testid="sidebar">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLocation('/app')}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                data-testid="button-logo"
              >
                <Linkedin className="text-white h-4 w-4" />
              </button>
              <div>
                <button 
                  onClick={() => setLocation('/app')}
                  className="text-xl font-bold text-slate-800 hover:text-slate-600 cursor-pointer"
                  data-testid="button-home"
                >
                  Draftwell
                </button>
                <button
                  onClick={() => setLocation('/app/release-notes')}
                  className="text-xs text-slate-500 hover:text-slate-700 hover:underline cursor-pointer block"
                  data-testid="button-version"
                >
                  v3.0.0
                </button>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-user-menu">
                  <User className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full justify-start"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Button
            onClick={handleNewPost}
            className="w-full flex items-center justify-center gap-2"
            data-testid="button-new-post"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Usage Indicator in Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <UsageIndicator />
        </div>
        
        {/* Search - only show if onSearchChange prop is provided */}
        {onSearchChange && (
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search posts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>
        )}
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Filter Tabs - only show if onFilterChange prop is provided */}
          {onFilterChange && (
            <div className="px-6 py-4">
              <nav className="space-y-1">
                {filterButtons.map((filter) => (
                  <Button
                    key={filter.key}
                    variant={currentFilter === filter.key ? "default" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => {
                      onFilterChange(filter.key);
                      setLocation('/app');
                      setSidebarOpen(false); // Close mobile sidebar after selection
                    }}
                    data-testid={`button-filter-${filter.key}`}
                  >
                    <span>{filter.label}</span>
                    <Badge 
                      variant={currentFilter === filter.key ? "secondary" : "outline"}
                      className="ml-2"
                    >
                      {filter.count}
                    </Badge>
                  </Button>
                ))}
              </nav>
            </div>
          )}
          
          {/* Tag Filter */}
          {onFilterChange && allTags.length > 0 && (
            <div className="px-6 mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Filter by Tag</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                <Button
                  variant={currentTagFilter === null ? "default" : "ghost"}
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    onTagFilterChange?.(null);
                    setSidebarOpen(false); // Close mobile sidebar after selection
                  }}
                  data-testid="button-tag-all"
                >
                  All Tags
                </Button>
                {allTags.slice(0, 10).map((tag) => (
                  <Button
                    key={tag}
                    variant={currentTagFilter === tag ? "default" : "ghost"}
                    className="w-full justify-start text-xs"
                    onClick={() => {
                      onTagFilterChange?.(tag);
                      setSidebarOpen(false); // Close mobile sidebar after selection
                    }}
                    data-testid={`button-tag-${tag}`}
                  >
                    {tag}
                  </Button>
                ))}
                {allTags.length > 10 && (
                  <p className="text-xs text-slate-500 px-3 py-1">
                    +{allTags.length - 10} more tags
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Navigation */}
          <div className="px-6 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setLocation('/app/hashtag-collections');
                setSidebarOpen(false); // Close mobile sidebar after navigation
              }}
              data-testid="button-hashtag-collections"
            >
              <Hash className="mr-3 h-4 w-4" />
              Hashtag Collections
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setLocation('/app/settings');
                setSidebarOpen(false); // Close mobile sidebar after navigation
              }}
              data-testid="button-settings"
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 pt-16 lg:pt-0" data-testid="main-content">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}