import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, User, Hash, Settings, Menu, X, FileText } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { logout } from "../lib/auth";
import { createPost } from "../lib/posts";
import { PostStatus } from "../types/post";
import Footer from "../components/Footer";
import UsageIndicator from "../components/UsageIndicator";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();


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
            <span className="text-white text-sm font-bold">DW</span>
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
        ${desktopSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
        fixed lg:static inset-y-0 left-0 z-50
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
                <span className="text-white text-sm font-bold">DW</span>
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setLocation('/app/settings');
                setSidebarOpen(false);
              }}
              data-testid="button-user-account"
            >
              <User className="h-4 w-4" />
            </Button>
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
        <div className="px-6 py-4">
          <UsageIndicator />
        </div>
        
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          

          {/* Additional Navigation */}
          <div className="px-6 mt-6 pt-6">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setLocation('/app');
                setSidebarOpen(false); // Close mobile sidebar after navigation
              }}
              data-testid="button-all-posts"
            >
              <FileText className="mr-3 h-4 w-4" />
              All Posts
            </Button>
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
              data-testid="button-account"
            >
              <Settings className="mr-3 h-4 w-4" />
              Account
            </Button>
          </div>
        </div>
      </div>
      
      {/* Desktop Toggle Button */}
      <div className={`hidden lg:block fixed top-4 left-4 z-50 transition-all duration-300 ${
        desktopSidebarOpen ? 'translate-x-72' : 'translate-x-0'
      }`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white"
          data-testid="button-desktop-sidebar-toggle"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col pt-16 lg:pt-0 transition-all duration-300 ${
        desktopSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'
      }`} data-testid="main-content">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}