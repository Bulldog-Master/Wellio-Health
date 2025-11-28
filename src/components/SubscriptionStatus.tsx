import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionStatus = () => {
  const navigate = useNavigate();
  const { tier, subscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-muted rounded" />
      </Card>
    );
  }

  const tierInfo = {
    free: {
      name: 'Free',
      color: 'bg-secondary',
      features: ['Basic tracking', '10 workouts/month', 'Community access'],
      cta: 'Upgrade to unlock more',
    },
    pro: {
      name: 'Pro',
      color: 'bg-gradient-primary',
      features: ['Unlimited workouts', 'AI insights', 'Trainer marketplace'],
      cta: 'You\'re on Pro',
    },
    enterprise: {
      name: 'Enterprise',
      color: 'bg-gradient-hero',
      features: ['Everything in Pro', 'Live sessions', 'Priority support'],
      cta: 'Enterprise Active',
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
                {tier === 'free' ? 'Free Plan' : `${currentTier.name} Plan`}
              </h3>
              <Badge className={currentTier.color}>
                {tier.toUpperCase()}
              </Badge>
            </div>
            {subscription?.status && (
              <p className="text-sm text-muted-foreground">
                Status: {subscription.status}
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
          Upgrade Now
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => navigate('/subscription')}
        >
          Manage Subscription
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </Card>
  );
};
