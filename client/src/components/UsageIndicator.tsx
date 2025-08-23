import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { getUserSubscription, getCurrentUsage, canUserUseAiRating } from '../lib/subscription';
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
    canUse: true
  });

  useEffect(() => {
    if (user?.uid) {
      loadUsage();
    }
  }, [user?.uid]);

  const loadUsage = async () => {
    if (!user?.uid) return;
    
    try {
      const subscription = await getUserSubscription(user.uid);
      const currentUsage = await getCurrentUsage(user.uid);
      const quotaCheck = await canUserUseAiRating(user.uid);
      
      if (subscription) {
        const plan = getPlanById(subscription.planType);
        setUsage({
          current: currentUsage?.ratingsUsed || 0,
          limit: plan.features.aiRatingsPerMonth,
          planName: plan.name,
          canUse: quotaCheck.canUse
        });
      }
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        Loading usage...
      </div>
    );
  }

  const isUnlimited = usage.limit === 'unlimited';
  const percentage = isUnlimited ? 0 : Math.min((usage.current / (usage.limit as number)) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !usage.canUse;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" data-testid="usage-indicator">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span className="font-medium text-slate-700">AI Ratings</span>
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
            {usage.current} used
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
            You've reached your monthly limit of {usage.limit} AI ratings.
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleUpgrade('starter')}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-testid="button-upgrade-starter"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Upgrade to Starter
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleUpgrade('pro')}
              data-testid="button-upgrade-pro"
            >
              Go Pro
            </Button>
          </div>
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-3">
          <p className="text-sm text-orange-800 mb-2">
            You're close to your monthly limit. Consider upgrading for unlimited ratings.
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