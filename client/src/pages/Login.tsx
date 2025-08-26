import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Linkedin, Mail, Lock, FileText, Sparkles, Users, Shield, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { signInWithEmail, signUpWithEmail, getAuthErrorMessage } from "../lib/auth";
import Footer from "../components/Footer";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthForm = z.infer<typeof authSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // If user is already authenticated, redirect to app
  useEffect(() => {
    if (!loading && user) {
      setLocation('/app');
    }
  }, [user, loading, setLocation]);

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    try {
      await signInWithEmail(data.email, data.password);
      toast({
        title: "Signed in",
        description: "Welcome back to Draftwell!",
      });
      // Redirect to app after successful sign in
      setLocation('/app');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">DW</span>
              </div>
              <h1 className="text-xl font-bold text-slate-800">Draftwell</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/signup')}
                data-testid="button-sign-up"
              >
                Sign Up
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setLocation('/')}
                data-testid="button-back-home"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sign-in Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <Card className="w-full max-w-md" data-testid="login-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-800">Sign in to your account</CardTitle>
            <CardDescription>
              Welcome back to Draftwell
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                {...form.register("email")}
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600" data-testid="error-email">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                {...form.register("password")}
                data-testid="input-password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600" data-testid="error-password">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setLocation('/signup')}
                className="font-medium text-purple-600 hover:text-purple-800 underline"
                data-testid="link-signup"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-slate-500">
        <p>© 2025 Draftwell. Built by Digital Art Dealers.</p>
      </footer>
    </div>
  );
}
