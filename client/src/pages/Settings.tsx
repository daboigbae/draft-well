// COMMENTED OUT: Paid feature - Settings page with subscription management
// This page will be uncommented when implementing paid features

/*
import { useState, useEffect } from 'react';
import { Crown, CreditCard, Check, Zap, Calendar, FileSpreadsheet, MessageSquare, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../hooks/use-auth';
import { getUserSubscription, getCurrentUsage } from '../lib/subscription';
import { createCheckoutSession, createCustomerPortalSession } from '../lib/stripe';
import { PLANS, type UserSubscription, type UsageRecord, getPlanById } from '../types/subscription';
import { useToast } from '../hooks/use-toast';
import { logout } from '../lib/auth';
import AppLayout from './AppLayout';

export default function Settings() {
  // All the settings logic...
  // This component is commented out for free users
}
*/

// Simple settings page for free users
import { LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/use-auth';
import { useToast } from '../hooks/use-toast';
import { logout } from '../lib/auth';
import AppLayout from './AppLayout';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <AppLayout>
      <div className="flex-1 p-8" data-testid="settings-page">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Account</h1>
            <p className="text-slate-600">Manage your account settings</p>
          </div>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Signed in as {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={async () => {
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
                }}
                className="flex items-center gap-2"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}