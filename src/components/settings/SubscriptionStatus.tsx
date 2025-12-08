import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/subscription';
import { useTranslation } from 'react-i18next';

export const SubscriptionStatus = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'subscription', 'premium']);
  const { tier, subscription, isLoading, isVIP, isAdmin, hasFullAccess } = useSubscription();

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  // Show special card for Admin/VIP users
  if (hasFullAccess) {
    return (
      <Card className="p-6 border-primary bg-primary/5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">
                  {isAdmin ? t('subscription:admin_access') : t('subscription:vip_access')}
                </h3>
                <Badge className="bg-primary text-primary-foreground">
                  {isAdmin ? 'ADMIN' : 'VIP'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('subscription:all_features_unlocked')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">{t('subscription:feature_unlimited_workouts')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">{t('subscription:feature_ai_insights')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">{t('subscription:feature_all_premium')}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate('/subscription')}
        >
          {t('subscription:view_plans')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  const tierInfo = {
    free: {
      name: t('subscription:free_plan'),
      fullName: t('subscription:free_plan_full'),
      color: 'bg-secondary',
      features: [
        t('subscription:feature_basic_tracking'),
        t('subscription:feature_10_workouts'),
        t('subscription:feature_community_access')
      ],
      cta: t('subscription:upgrade_to_unlock'),
    },
    pro: {
      name: t('subscription:pro_plan'),
      fullName: t('subscription:pro_plan_full'),
      color: 'bg-gradient-primary',
      features: [
        t('subscription:feature_unlimited_workouts'),
        t('subscription:feature_ai_insights'),
        t('subscription:feature_trainer_marketplace')
      ],
      cta: t('subscription:youre_on_pro'),
    },
    enterprise: {
      name: t('subscription:enterprise_plan'),
      fullName: t('subscription:enterprise_plan_full'),
      color: 'bg-gradient-hero',
      features: [
        t('subscription:feature_everything_pro'),
        t('subscription:feature_live_sessions'),
        t('subscription:feature_priority_support')
      ],
      cta: t('subscription:enterprise_active'),
    },
  };

  const currentTier = tierInfo[tier as keyof typeof tierInfo] || tierInfo.free;
  const isFree = tier === 'free';

  return (
    <Card className={`p-6 ${isFree ? 'border-2' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {!isFree && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Crown className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {currentTier.fullName}
              </h3>
              <Badge className={currentTier.color}>
                {tier.toUpperCase()}
              </Badge>
            </div>
            {subscription?.status && (
              <p className="text-sm text-muted-foreground">
                {t('subscription:status')}: {subscription.status}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {currentTier.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>

      {isFree ? (
        <Button
          className="w-full bg-gradient-primary hover:opacity-90 gap-2"
          onClick={() => navigate('/subscription')}
        >
          <Crown className="w-4 h-4" />
          {t('subscription:upgrade_now')}
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate('/subscription')}
        >
          {t('subscription:manage_subscription')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </Card>
  );
};
