import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { getUserSubscription, getCurrentUsage, canUserUseAiRating, subscribeToUserSubscription } from '../lib/subscription';
import { createCheckoutSession } from '../lib/stripe';
import { getPlanById } from '../types/subscription';
import { useToast } from '../hooks/use-toast';

export default function UsageIndicator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({
    current: 0,
    limit: 0 as number | 'unlimited',
    planName: 'Free',
    planType: 'free' as 'free' | 'starter' | 'pro',
    canUse: true
  });

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Set up real-time subscription listener
    const unsubscribe = subscribeToUserSubscription(user.uid, async (subscription) => {
      try {
        if (subscription) {
          const plan = getPlanById(subscription.planType);
          const reportTokens = subscription.reportTokens ?? plan.features.aiRatingsPerMonth;
          
          // For pro plan, check if reportTokens indicates unlimited (999999)
          const isUnlimited = reportTokens === 999999 || reportTokens === 'unlimited';
          
          // Check quota in real-time
          const quotaCheck = await canUserUseAiRating(user.uid);
          
          setUsage({
            current: isUnlimited ? 999999 : (reportTokens as number), // Show remaining tokens, not used tokens
            limit: isUnlimited ? 'unlimited' : plan.features.aiRatingsPerMonth,
            planName: plan.name,
            planType: subscription.planType,
            canUse: quotaCheck.canUse
          });
        } else {
          // No subscription found, set to free plan defaults
          setUsage({
            current: 2,
            limit: 2,
            planName: 'Free',
            planType: 'free',
            canUse: true
          });
        }
      } catch (error) {
        console.error('Failed to update usage from subscription:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [user?.uid]);


  const handleUpgrade = async (planType: 'starter' | 'pro') => {
    if (!user?.uid) return;
    
    try {
      await createCheckoutSession(planType, user.uid);
    } catch (error: any) {
      toast({
        title: 'Upgrade failed',
        description: error.message || 'Failed to start upgrade process',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" data-testid="usage-indicator-loading">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-12 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
        
        <div className="mb-3">
          <div className="h-2 bg-gray-200 rounded-full w-full animate-pulse" />
        </div>
        
        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
    );
  }

  const isUnlimited = usage.limit === 'unlimited';
  
  // For the new token system, check reportTokens directly
  const reportTokens = usage.current; // This is now the remaining tokens
  const totalTokens = usage.limit as number;
  
  // Calculate percentage based on remaining tokens (full bar = all tokens available)
  const percentage = isUnlimited ? 100 : Math.max((reportTokens / totalTokens) * 100, 0);
  const isNearLimit = !isUnlimited && reportTokens <= 3 && reportTokens > 0; // Show warning when 3 or fewer tokens left
  const isAtLimit = !usage.canUse;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" data-testid="usage-indicator">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span className="font-medium text-slate-700">Rating Credits</span>
          <Badge variant="outline" className="text-xs">
            {usage.planName}
          </Badge>
        </div>
        
        {!isUnlimited && (
          <span className="text-sm text-slate-600" data-testid="usage-count">
            {usage.current} / {usage.limit}
          </span>
        )}
        
        {isUnlimited && (
          <span className="text-sm text-slate-600" data-testid="usage-count">
            Unlimited
          </span>
        )}
      </div>

      {!isUnlimited && (
        <div className="mb-3">
          <Progress 
            value={percentage} 
            className="h-2"
            data-testid="usage-progress"
          />
        </div>
      )}

      {isAtLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-3">
          <p className="text-sm text-amber-800 mb-2">
            You've used all your AI rating tokens.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {usage.planType === 'free' && (
              <Button 
                size="sm" 
                onClick={() => handleUpgrade('starter')}
                className="bg-indigo-600 hover:bg-indigo-700 flex-1 sm:flex-none"
                data-testid="button-upgrade-starter"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Upgrade to Starter
              </Button>
            )}
            {(usage.planType === 'free' || usage.planType === 'starter') && (
              <Button 
                size="sm" 
                variant={usage.planType === 'starter' ? 'default' : 'outline'}
                onClick={() => handleUpgrade('pro')}
                className="flex-1 sm:flex-none"
                data-testid="button-upgrade-pro"
              >
                Go Pro
              </Button>
            )}
          </div>
        </div>
      )}

      {isNearLimit && !isAtLimit && usage.planType === 'starter' && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-3">
          <p className="text-sm text-orange-800 mb-2">
            You're close to your token limit. Consider upgrading for unlimited ratings.
          </p>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleUpgrade('pro')}
            data-testid="button-upgrade-near-limit"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Upgrade to Pro
          </Button>
        </div>
      )}

      {usage.planName === 'Free' && !isAtLimit && (
        <div className="text-xs text-slate-500">
          Resets monthly. 
          <button 
            className="text-indigo-600 hover:text-indigo-700 ml-1 underline"
            onClick={() => handleUpgrade('starter')}
            data-testid="button-upgrade-free"
          >
            Upgrade for more
          </button>
        </div>
      )}
    </div>
  );
}