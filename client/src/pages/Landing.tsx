import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { PenTool, Search, FileText, Copy, Calendar, Users, Sparkles, ArrowRight, LogIn, UserPlus } from "lucide-react";

export default function Landing() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && !showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2">
                Welcome back, {user.displayName || user.email?.split('@')[0]}!
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                Ready to create amazing
                <span className="text-blue-600 dark:text-blue-400"> LinkedIn content?</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Jump back into your content creation workflow. Your drafts are waiting!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6" data-testid="button-dashboard">
                <Link href="/app">
                  <FileText className="mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6" data-testid="button-new-post">
                <Link href="/app/post/new">
                  <PenTool className="mr-2 h-5 w-5" />
                  Create New Post
                </Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <PenTool className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">Rich Editor</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Write with markdown support, live preview, and smart formatting tools.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg">Smart Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Auto-save, duplicate posts, and organize your content with powerful filters.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Copy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">Easy Publishing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Copy to clipboard, export as files, and publish when you're ready.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Linkedraft</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowLogin(true)}
                data-testid="button-login"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
              <Button 
                onClick={() => setShowLogin(true)}
                data-testid="button-signup"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              Professional LinkedIn Content Creation
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Write better
              <span className="text-blue-600 dark:text-blue-400"> LinkedIn posts</span>
              <br />with ease
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Create, edit, and manage your LinkedIn content with powerful tools designed for professionals. 
              Write in markdown, track character limits, and publish when you're ready.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => setShowLogin(true)}
              data-testid="button-get-started-hero"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Start Writing Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => setShowLogin(true)}
              data-testid="button-sign-in-hero"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <PenTool className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Rich Text Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Write with markdown support, live preview, and formatting toolbar. 
                  Perfect for creating professional LinkedIn posts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Smart Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Filter posts by status, search through content, and keep your drafts organized. 
                  Never lose track of your ideas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Copy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Easy Publishing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Copy posts to clipboard, duplicate successful content, and export as text files. 
                  Streamline your publishing workflow.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            <div className="text-left space-y-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Built for LinkedIn Professionals
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                    <Calendar className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Character Counter</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Stay within LinkedIn's 3000 character limit with smart warnings
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-0.5">
                    <FileText className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Auto-Save</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Never lose your work with automatic saving as you type
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mt-0.5">
                    <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Content Management</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Organize drafts and published posts with powerful filtering
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ready to elevate your LinkedIn presence?
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Join professionals who use Linkedraft to create engaging LinkedIn content 
                  that drives meaningful connections and business growth.
                </p>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setShowLogin(true)}
                  data-testid="button-get-started-cta"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Start Creating Content
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Get Started</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLogin(false)}
                data-testid="button-close-login"
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Sign up or sign in to start creating amazing LinkedIn content.
              </p>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => window.location.href = '/login'}
                data-testid="button-continue-to-auth"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Continue to Authentication
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}