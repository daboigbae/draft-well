import { useState } from 'react';
import { User, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../hooks/use-auth';
import AppLayout from './AppLayout';

export default function Settings() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="flex-1 p-8" data-testid="settings">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800" data-testid="title-settings">Settings</h1>
            <p className="text-slate-600 mt-2">Manage your account and preferences</p>
          </div>

          {/* Account Information */}
          <Card data-testid="card-account">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Email</span>
                </div>
                <span className="text-slate-600" data-testid="text-email">{user?.email}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Account Type</span>
                </div>
                <Badge variant="secondary" data-testid="badge-account-type">
                  Beta User
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* App Information */}
          <Card data-testid="card-app-info">
            <CardHeader>
              <CardTitle>Application Information</CardTitle>
              <CardDescription>
                Details about your Draftwell experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Version</span>
                <span className="text-slate-600">v3.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Environment</span>
                <Badge variant="outline">Closed Beta</Badge>
              </div>
              
              <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">
                <p className="font-medium mb-2">About Draftwell</p>
                <p>
                  Draftwell is a comprehensive LinkedIn post management platform designed to help you create, 
                  organize, and optimize your professional content. Currently in closed beta, we're continuously 
                  improving based on user feedback.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}