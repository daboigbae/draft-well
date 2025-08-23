import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Linkedin, Mail, Lock, FileText, Sparkles, Users, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { signInWithEmail, getAuthErrorMessage } from "../lib/auth";
import Footer from "../components/Footer";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      toast({
        title: "Signed in",
        description: "Welcome back to Linkedraft!",
      });
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-4xl space-y-16 lg:space-y-20">
        {/* Login Card */}
        <Card className="w-full max-w-md mx-auto" data-testid="login-card">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Linkedin className="text-white h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Linkedraft</CardTitle>
            <CardDescription>Closed Beta - Sign in to access</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...form.register("email")}
                    data-testid="input-email"
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600" data-testid="error-email">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    {...form.register("password")}
                    data-testid="input-password"
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600" data-testid="error-password">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? "Please wait..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* About Linkedraft */}
        <Card className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-sm border-slate-200">
          <CardContent className="p-8 lg:p-12">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6">
                The Complete LinkedIn Post Management Platform
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Linkedraft helps content creators and professionals draft, organize, and perfect their LinkedIn posts 
                with powerful features designed for social media excellence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12 lg:mb-16">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 lg:h-10 lg:w-10 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Rich Editor</h3>
                <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                  Markdown-powered editor with live preview and LinkedIn-style formatting
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 lg:h-10 lg:w-10 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Smart Tags</h3>
                <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                  Auto-complete tags from previous posts and organize content by topic
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 lg:h-10 lg:w-10 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">AI Vetting</h3>
                <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                  Mark and track posts reviewed or enhanced by AI tools
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 lg:h-10 lg:w-10 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">Real-time Sync</h3>
                <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                  Your posts sync across all devices with automatic saving
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setLocation('/app/release-notes')}
                  className="text-sm lg:text-base text-slate-500 hover:text-slate-700 hover:underline cursor-pointer font-medium"
                  data-testid="button-release-notes"
                >
                  v1.1.1 Release Notes
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-sm lg:text-base text-slate-500">Closed Beta</span>
              </div>
              <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">
                Built with React, TypeScript, and Firebase for professionals who take their LinkedIn presence seriously.
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
