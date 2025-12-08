import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/subscription';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubscriptionGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

// Map feature names to addon keys
const featureToAddonMap: Record<string, string> = {
  'trainer_portal': 'trainer_access',
  'practitioner_portal': 'practitioner_access',
  'ai_coach': 'ai_coach',
  'ai_analytics': 'ai_analytics',
  'ai_nutrition': 'ai_nutrition',
  'recovery_tracking': 'recovery_tracking',
  'live_sessions': 'live_sessions',
  'ai_workout_plan': 'ai_coach',
  'ai_voice_companion': 'ai_coach',
};

export const SubscriptionGate = ({ feature, children, fallback }: SubscriptionGateProps) => {
  const { t } = useTranslation('subscription');
  const { hasFeature, isLoading, tier, hasFullAccess, isVIP, isAdmin } = useSubscription();
  const navigate = useNavigate();
  const [hasRewardAccess, setHasRewardAccess] = useState(false);
  const [hasAddonAccess, setHasAddonAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAccess(false);
        return;
      }

      // Check for active pro subscription reward
      const { data: rewardData } = await supabase.rpc('has_active_reward', {
        _user_id: user.id,
        _feature_type: 'pro_subscription'
      });

      setHasRewardAccess(rewardData || false);

      // Check for addon access
      const addonKey = featureToAddonMap[feature];
      if (addonKey) {
        const { data: addonData } = await supabase
          .from('user_addons')
          .select('id, subscription_addons!inner(addon_key)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .eq('subscription_addons.addon_key', addonKey)
          .maybeSingle();

        setHasAddonAccess(!!addonData);
      }
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  if (isLoading || checkingAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow access if user has VIP/Admin status, the feature, addon, OR has an active reward
  if (hasFullAccess || hasFeature(feature) || hasRewardAccess || hasAddonAccess) {
    return <>{children}</>;
  }

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
};