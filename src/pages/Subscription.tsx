import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSubscription } from '@/hooks/subscription';
import { Check, Crown, Sparkles, Zap, ArrowLeft, Plus, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SubscriptionAddons } from '@/components/SubscriptionAddons';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

const Subscription = () => {
  const navigate = useNavigate();
  const { subscription, isLoading, tier, isVIP, isAdmin, hasFullAccess } = useSubscription();
  const { t } = useTranslation(['subscription', 'addons', 'payments', 'common']);
  const { addItem, hasItem } = useCartStore();

  const plans = [
    {
      name: t('free_plan'),
      tier: 'free' as const,
      price: 0,
      priceDisplay: '$0',
      period: t('forever'),
      description: t('free_description'),
      features: [
        t('feature_basic_workout'),
        t('feature_food_tracking'),
        t('feature_progress_photos'),
        t('feature_community_feed'),
        t('feature_workouts_limit'),
      ],
      icon: Zap,
      popular: false,
    },
    {
      name: t('pro_plan'),
      tier: 'pro' as const,
      price: 9.99,
      priceDisplay: '$9.99',
      period: t('per_month'),
      description: t('pro_description'),
      features: [
        t('feature_everything_free'),
        t('feature_unlimited_workouts'),
        t('feature_trainer_search'),
        t('feature_custom_challenges'),
        t('feature_advanced_analytics'),
        t('feature_ai_insights'),
      ],
      icon: Crown,
      popular: true,
    },
    {
      name: t('enterprise_plan'),
      tier: 'enterprise' as const,
      price: 29.99,
      priceDisplay: '$29.99',
      period: t('per_month'),
      description: t('enterprise_description'),
      features: [
        t('feature_everything_pro'),
        t('feature_live_sessions'),
        t('feature_priority_support'),
        t('feature_custom_programs'),
        t('feature_team_collaboration'),
        t('feature_api_access'),
      ],
      icon: Sparkles,
      popular: false,
    },
  ];

  const handleAddToCart = (plan: typeof plans[0]) => {
    if (plan.tier === 'free' || tier === plan.tier) return;
    
    addItem({
      id: `subscription-${plan.tier}`,
      type: 'subscription',
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billingCycle: 'monthly',
      metadata: { tier: plan.tier }
    });
    
    toast.success(t('common:added_to_cart'), {
      description: plan.name,
      position: 'top-center'
    });
  };

  const isInCart = (planTier: string) => {
    return hasItem(`subscription-${planTier}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{t('choose_plan')}</h1>
            <p className="text-muted-foreground text-lg">
              {t('unlock_potential')}
            </p>
            
            {/* Admin/VIP Full Access Banner */}
            {hasFullAccess && (
              <Card className="mt-6 p-6 border-primary bg-primary/5">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Crown className="w-8 h-8 text-primary" />
                  <h2 className="text-2xl font-bold text-primary">
                    {isAdmin ? t('admin_access') : t('vip_access')}
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  {t('full_access_description')}
                </p>
                <Badge className="mt-3 bg-primary text-primary-foreground px-4 py-1">
                  {t('all_features_unlocked')}
                </Badge>
              </Card>
            )}
            
            {!hasFullAccess && subscription && (
              <div className="mt-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {t('current_plan')}: {tier.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = tier === plan.tier;
            const inCart = isInCart(plan.tier);

            return (
              <Card
                key={plan.tier}
                className={`relative p-8 ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {t('most_popular')}
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.priceDisplay}</span>
                    <span className="text-muted-foreground ml-2">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan || inCart ? 'secondary' : 'default'}
                  disabled={isCurrentPlan || plan.tier === 'free'}
                  onClick={() => handleAddToCart(plan)}
                >
                  {isCurrentPlan ? (
                    t('current_plan')
                  ) : plan.tier === 'free' ? (
                    t('free_plan')
                  ) : inCart ? (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {t('common:in_cart')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('common:add_to_cart')}
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Add-ons Section */}
        <Separator className="my-12" />
        <SubscriptionAddons />

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            {t('stripe_integration')}
          </p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            {t('back_to_dashboard')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
