import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, User, Hash, Settings, Menu, X, FileText, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { logout } from "../lib/auth";
import { createPost } from "../lib/posts";
import { createFeedback } from "../lib/feedback";
import { PostStatus } from "../types/post";
import Footer from "../components/Footer";
import UsageIndicator from "../components/UsageIndicator";

interface AppLayoutProps {
  children: React.ReactNode;
}

const feedbackSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  text: z.string().min(10, "Feedback must be at least 10 characters long").max(1000, "Feedback must not exceed 1000 characters"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      email: user?.email || "",
      text: "",
    },
  });


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

  const onSubmitFeedback = async (data: FeedbackForm) => {
    try {
      await createFeedback(data);
      toast({
        title: "Feedback sent!",
        description: "Thank you for your feedback. We'll review it and get back to you if needed.",
      });
      setFeedbackDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Failed to send feedback",
        description: "There was an error sending your feedback. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-background" data-testid="app-layout">
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
        fixed inset-y-0 left-0 z-50
        w-80 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
      `} data-testid="sidebar">
        {/* Header */}
        <div className="p-6">
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
                  v3.1.0
                </button>
              </div>
            </div>
          </div>
          
          {/* Usage Indicator */}
          <div className="mb-4">
            <UsageIndicator />
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
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Additional Navigation */}
          <div className="px-6 mt-6 flex-1">
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
              Posts
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
              Hashtags
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
              <User className="mr-3 h-4 w-4" />
              Account
            </Button>
            <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start pl-12"
                  data-testid="button-send-feedback"
                >
                  <MessageSquare className="mr-3 h-3 w-3" />
                  Send Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Send Feedback</DialogTitle>
                  <DialogDescription>
                    Help us improve Draftwell by sharing your thoughts, suggestions, or reporting issues.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={form.handleSubmit(onSubmitFeedback)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback-email">Email</Label>
                    <Input
                      id="feedback-email"
                      type="email"
                      placeholder="your.email@example.com"
                      {...form.register("email")}
                      data-testid="input-feedback-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600" data-testid="error-feedback-email">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback-text">Feedback</Label>
                    <Textarea
                      id="feedback-text"
                      placeholder="Share your thoughts, suggestions, or report any issues..."
                      rows={4}
                      {...form.register("text")}
                      data-testid="textarea-feedback-text"
                    />
                    <div className="flex justify-between items-center">
                      {form.formState.errors.text && (
                        <p className="text-sm text-red-600" data-testid="error-feedback-text">
                          {form.formState.errors.text.message}
                        </p>
                      )}
                      <span className="text-xs text-slate-500 ml-auto">
                        {form.watch("text")?.length || 0}/1000
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFeedbackDialogOpen(false)}
                      data-testid="button-feedback-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      data-testid="button-feedback-submit"
                    >
                      {form.formState.isSubmitting ? "Sending..." : "Send Feedback"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100">
            <a 
              href="https://digitalartdealers.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-slate-600 text-center block transition-colors cursor-pointer"
              data-testid="link-digital-art-dealers"
            >
              Built by Digital Art Dealers
            </a>
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
          {desktopSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Main Content */}
      <div className={`min-h-screen flex flex-col pt-16 lg:pt-0 transition-all duration-300 ${
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