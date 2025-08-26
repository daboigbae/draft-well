import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../hooks/use-auth';
import { getUserSubscription, getCurrentUsage } from '../lib/subscription';
import { type UserSubscription, type UsageRecord } from '../types/subscription';
import { useToast } from '../hooks/use-toast';
import { logout } from '../lib/auth';
import AppLayout from './AppLayout';
import UsageIndicator from '../components/UsageIndicator';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <AppLayout>
      <div className="flex-1 p-8" data-testid="settings-page">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Account</h1>
            <p className="text-slate-600">Manage your account settings</p>
          </div>

          {/* Credits Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageIndicator />
            </CardContent>
          </Card>

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