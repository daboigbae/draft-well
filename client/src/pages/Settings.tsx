import { useState, useEffect } from 'react';
import { Crown, CreditCard, Check, Zap, Calendar, FileSpreadsheet, MessageSquare, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/use-auth';
import { getUserSubscription, getCurrentUsage } from '../lib/subscription';
import { createCheckoutSession, createCustomerPortalSession } from '../lib/stripe';
import { PLANS, type UserSubscription, type UsageRecord, getPlanById } from '../types/subscription';
import { useToast } from '../hooks/use-toast';
import { logout, reauthenticateUser, deleteUserAccount, getAuthErrorMessage } from '../lib/auth';
import AppLayout from './AppLayout';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UsageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [verifyingSubscription, setVerifyingSubscription] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadSubscriptionData();
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid && !verifyingSubscription) {
      // Check if user returned from successful Stripe checkout
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success');
      const sessionId = urlParams.get('session_id');
      const canceled = urlParams.get('canceled');
      
      if (success && sessionId) {
        verifySubscription(sessionId);
      } else if (canceled) {
        // Clear the canceled parameter from URL after showing message briefly
        setTimeout(() => {
          window.history.replaceState({}, '', '/app/account');
        }, 3000);
      }
    }
  }, [user?.uid]); // Remove verifyingSubscription dependency to prevent loop

  const loadSubscriptionData = async () => {
    if (!user?.uid) return;

    try {
      const userSubscription = await getUserSubscription(user.uid);
      const userUsage = await getCurrentUsage(user.uid);
      
      setSubscription(userSubscription);
      setUsage(userUsage);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifySubscription = async (sessionId: string) => {
    if (!user?.uid || verifyingSubscription) return;
    
    setVerifyingSubscription(true);
    
    // Always clear URL parameters first to prevent loops
    window.history.replaceState({}, '', '/app/account');
    
    try {
      // TODO: Implement subscription verification using Firebase Functions
      // This should call a Firebase Function instead of a local API endpoint
      console.warn('Subscription verification not implemented - needs Firebase Function');
      
      toast({
        title: 'Feature Not Available',
        description: 'Subscription verification is not yet implemented. Please contact support.',
        variant: 'destructive'
      });
      
      // For now, just reload subscription data
      await loadSubscriptionData();
      
    } catch (error) {
      console.error('Error verifying subscription:', error);
      toast({
        title: 'Verification Failed',
        description: 'Failed to verify your subscription. Please try again or contact support.',
        variant: 'destructive'
      });
    } finally {
      setVerifyingSubscription(false);
    }
  };

  const handleUpgrade = async (planType: 'starter' | 'pro') => {
    if (!user?.uid) return;

    console.log('Subscription data:', subscription); // Debug log

    // For existing subscribers, use customer portal to manage upgrades
    if (subscription && subscription.status === 'active' && subscription.stripeCustomerId) {
      setUpgrading(planType);
      try {
        await createCustomerPortalSession();
      } catch (error: any) {
        toast({
          title: 'Portal Access Failed',
          description: error.message || 'Failed to access customer portal',
          variant: 'destructive'
        });
      } finally {
        setUpgrading(null);
      }
      return;
    }

    // For existing paid subscribers without stripeCustomerId, show message
    if (subscription && subscription.status === 'active' && subscription.planType !== 'free' && !subscription.stripeCustomerId) {
      toast({
        title: 'Use Customer Portal',
        description: 'Please use the direct customer portal link to manage your subscription: billing.stripe.com',
        variant: 'default'
      });
      return;
    }

    // For new subscribers, use checkout flow
    setUpgrading(planType);
    try {
      await createCheckoutSession();
    } catch (error: any) {
      toast({
        title: 'Upgrade failed',
        description: error.message || 'Failed to start upgrade process',
        variant: 'destructive'
      });
    } finally {
      setUpgrading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription?.stripeCustomerId) {
      toast({
        title: 'Error',
        description: 'No customer ID found. Please contact support.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createCustomerPortalSession();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open subscription management',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.uid) return;

    setDeleting(true);
    
    try {
      // First, try to reauthenticate the user
      await reauthenticateUser(deletePassword);
      
      // Delete the Firebase Auth account
      await deleteUserAccount();
      
      // Logout (this should happen automatically after account deletion)
      await logout();
      
      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Account deletion failed",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeletePassword('');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentPlan = subscription ? getPlanById(subscription.planType) : PLANS[0];
  const currentUsage = usage?.ratingsUsed || 0;
  
  // Calculate token display based on reportTokens and plan
  const getTokenDisplay = () => {
    if (!subscription) return '0/2';
    
    const reportTokens = subscription.reportTokens ?? 0;
    
    switch (subscription.planType) {
      case 'free':
        return `${reportTokens}/2`;
      case 'starter':
        return `${reportTokens}/20`;
      case 'pro':
        return 'Unlimited';
      default:
        return `${reportTokens}/2`;
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 p-8" data-testid="settings-page">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Account</h1>
            <p className="text-slate-600">Manage your subscription and account settings</p>
          </div>

          {/* Current Plan Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-indigo-600" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                    <Badge variant={currentPlan.id === 'free' ? 'secondary' : 'default'}>
                      {currentPlan.id === 'free' ? 'Free' : `$${currentPlan.price}/month`}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mb-4">
                    {subscription?.planType === 'pro'
                      ? 'Unlimited AI ratings available'
                      : subscription?.planType === 'free'
                      ? `${getTokenDisplay()} AI ratings available (2 per week)`
                      : `${getTokenDisplay()} AI ratings available`
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      {subscription?.planType === 'pro'
                        ? 'Unlimited AI ratings'
                        : `${getTokenDisplay()} AI ratings`
                      }
                    </Badge>
                    {currentPlan.features.postReminders && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        Post reminders
                      </Badge>
                    )}
                    {currentPlan.features.advancedAiFeedback && (
                      <Badge variant="outline" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Advanced AI feedback
                      </Badge>
                    )}
                    {currentPlan.features.csvExport && (
                      <Badge variant="outline" className="text-xs">
                        <FileSpreadsheet className="w-3 h-3 mr-1" />
                        CSV export
                      </Badge>
                    )}
                  </div>
                </div>
                {subscription?.planType !== 'free' && subscription?.stripeCustomerId && (
                  <Button 
                    variant="outline" 
                    onClick={handleManageSubscription}
                    data-testid="button-manage-subscription"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>


          {/* Success/Cancel Messages */}
          {verifyingSubscription && (
            <Alert className="mb-6">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <AlertDescription>
                Activating your subscription...
              </AlertDescription>
            </Alert>
          )}
          
          {new URLSearchParams(window.location.search).get('success') && !verifyingSubscription && (
            <Alert className="mb-6">
              <Check className="h-4 w-4" />
              <AlertDescription>
                Payment completed! Your subscription is being activated.
              </AlertDescription>
            </Alert>
          )}

          {new URLSearchParams(window.location.search).get('canceled') && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Subscription upgrade was canceled. You can try again anytime.
              </AlertDescription>
            </Alert>
          )}

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Signed in as {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      data-testid="button-delete-account"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Delete Account Permanently
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.</p>
                        <p><strong>This includes:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>All your LinkedIn posts and drafts</li>
                          <li>Your AI ratings and feedback</li>
                          <li>Your hashtag collections</li>
                          <li>Your account settings and preferences</li>
                        </ul>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Enter your password to confirm:</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Your account password"
                            data-testid="input-delete-password"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        disabled={!deletePassword || deleting}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="button-confirm-delete"
                      >
                        {deleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Account'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}