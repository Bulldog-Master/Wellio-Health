import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubscriptionGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const SubscriptionGate = ({ feature, children, fallback }: SubscriptionGateProps) => {
  const { t } = useTranslation('subscription');
  const { hasFeature, isLoading, tier } = useSubscription();
  const navigate = useNavigate();
  const [hasRewardAccess, setHasRewardAccess] = useState(false);
  const [checkingRewards, setCheckingRewards] = useState(true);

  useEffect(() => {
    checkRewardAccess();
  }, []);

  const checkRewardAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for active pro subscription reward
      const { data } = await supabase.rpc('has_active_reward', {
        _user_id: user.id,
        _feature_type: 'pro_subscription'
      });

      setHasRewardAccess(data || false);
    } catch (error) {
      console.error('Error checking reward access:', error);
    } finally {
      setCheckingRewards(false);
    }
  };

  if (isLoading || checkingRewards) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access if user has the feature OR has an active reward
  if (!hasFeature(feature) && !hasRewardAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="p-8 text-center max-w-2xl mx-auto mt-8">
        <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">{t('premium_feature')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('premium_description')} <strong>{tier.toUpperCase()}</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/subscription')}>
            {t('upgrade_now')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/rewards')} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {t('use_points')}
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};
