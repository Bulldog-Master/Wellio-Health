import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, Crown, Sparkles, Zap, ArrowLeft } from 'lucide-react';

const Subscription = () => {
  const navigate = useNavigate();
  const { subscription, isLoading, tier } = useSubscription();

  const plans = [
    {
      name: 'Free',
      tier: 'free' as const,
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Basic workout logging',
        'Food tracking',
        'Progress photos',
        'Community feed',
        'Up to 10 workouts/month',
      ],
      icon: Zap,
      popular: false,
    },
    {
      name: 'Pro',
      tier: 'pro' as const,
      price: '$9.99',
      period: 'per month',
      description: 'For serious fitness enthusiasts',
      features: [
        'Everything in Free',
        'Unlimited workouts',
        'Trainer search & booking',
        'Custom challenges',
        'Advanced analytics',
        'AI-powered insights',
      ],
      icon: Crown,
      popular: true,
    },
    {
      name: 'Enterprise',
      tier: 'enterprise' as const,
      price: '$29.99',
      period: 'per month',
      description: 'Complete fitness solution',
      features: [
        'Everything in Pro',
        'Live workout sessions',
        'Priority support',
        'Custom workout programs',
        'Team collaboration',
        'API access',
      ],
      icon: Sparkles,
      popular: false,
    },
  ];

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
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Unlock your full potential with premium features
          </p>
          {subscription && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Current Plan: {tier.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = tier === plan.tier;

            return (
              <Card
                key={plan.tier}
                className={`relative p-8 ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
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
                  variant={isCurrentPlan ? 'secondary' : 'default'}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Coming Soon'}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Stripe payment integration will be added when you're ready to go live
          </p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
