import { useState, useEffect } from 'react';
import { Crown, CreditCard, Check, Zap, Calendar, FileSpreadsheet, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../hooks/use-auth';
import { getUserSubscription, getCurrentUsage } from '../lib/subscription';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createCheckoutSession, createCustomerPortalSession } from '../lib/stripe';
import { PLANS, type UserSubscription, type UsageRecord, getPlanById } from '../types/subscription';
import { useToast } from '../hooks/use-toast';
import AppLayout from './AppLayout';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UsageRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [verifyingSubscription, setVerifyingSubscription] = useState(false);

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
          window.history.replaceState({}, '', '/app/settings');
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
    window.history.replaceState({}, '', '/app/settings');
    
    try {
      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId: user.uid,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update Firestore with subscription data
        if (result.subscriptionData && user?.uid) {
          try {
            await setDoc(doc(db, 'subscriptions', user.uid), result.subscriptionData);
            console.log('Subscription updated in Firestore:', result.subscriptionData);
          } catch (firestoreError) {
            console.error('Error updating Firestore:', firestoreError);
          }
        }
        
        toast({
          title: 'Subscription Activated!',
          description: `Your ${result.planType} plan is now active.`,
        });
        
        // Reload subscription data to reflect changes
        await loadSubscriptionData();
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { planType: result.planType } 
        }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to verify subscription');
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      toast({
        title: 'Payment Successful',
        description: 'Your payment was processed, but there was an issue activating your subscription. Please refresh the page or contact support.',
        variant: 'destructive'
      });
    } finally {
      setVerifyingSubscription(false);
    }
  };

  const handleUpgrade = async (planType: 'starter' | 'pro') => {
    if (!user?.uid) return;

    // For existing subscribers, use customer portal to manage upgrades
    if (subscription && subscription.status === 'active' && subscription.stripeCustomerId) {
      setUpgrading(planType);
      try {
        await createCustomerPortalSession(subscription.stripeCustomerId);
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

    // For new subscribers, use checkout flow
    setUpgrading(planType);
    try {
      await createCheckoutSession(planType, user.uid);
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
    
    // Get default tokens based on plan if reportTokens is missing
    let reportTokens = subscription.reportTokens;
    if (reportTokens === undefined || reportTokens === null) {
      switch (subscription.planType) {
        case 'free':
          reportTokens = 2;
          break;
        case 'starter':
          reportTokens = 20;
          break;
        case 'pro':
          reportTokens = 999999;
          break;
        default:
          reportTokens = 2;
      }
    }
    
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
            <p className="text-slate-600">Manage your subscription and billing</p>
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

          {/* Upgrade Plans */}
          {subscription?.planType !== 'pro' && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Upgrade Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PLANS.slice(1).map((plan) => {
                  const isCurrentPlan = subscription?.planType === plan.id;
                  const shouldShow = subscription?.planType === 'free' || 
                    (subscription?.planType === 'starter' && plan.id === 'pro');
                  
                  if (!shouldShow) return null;

                  return (
                    <Card 
                      key={plan.id} 
                      className={`relative ${plan.id === 'pro' ? 'border-indigo-200 shadow-lg' : ''}`}
                    >
                      {plan.id === 'pro' && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-indigo-600 text-white">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{plan.name}</span>
                          <span className="text-2xl font-bold">${plan.price}/mo</span>
                        </CardTitle>
                        <CardDescription>
                          Perfect for {plan.id === 'starter' ? 'regular creators' : 'power users'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="text-sm">
                              {plan.features.aiRatingsPerMonth === 'unlimited'
                                ? 'Unlimited AI ratings'
                                : `${plan.features.aiRatingsPerMonth} AI ratings per month`
                              }
                            </span>
                          </li>
                          {plan.features.postReminders && (
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">7-day post reminders</span>
                            </li>
                          )}
                          {plan.features.advancedAiFeedback && (
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Advanced AI feedback & comparisons</span>
                            </li>
                          )}
                          {plan.features.csvExport && (
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Export drafts & ratings to CSV</span>
                            </li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          variant={plan.id === 'pro' ? 'default' : 'outline'}
                          onClick={() => handleUpgrade(plan.id as 'starter' | 'pro')}
                          disabled={upgrading === plan.id || isCurrentPlan}
                          data-testid={`button-upgrade-${plan.id}`}
                        >
                          {upgrading === plan.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </div>
                          ) : isCurrentPlan ? (
                            'Current Plan'
                          ) : (
                            `Upgrade to ${plan.name}`
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

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
        </div>
      </div>
    </AppLayout>
  );
}