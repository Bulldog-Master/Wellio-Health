import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface SubscriptionGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const SubscriptionGate = ({ feature, children, fallback }: SubscriptionGateProps) => {
  const { hasFeature, isLoading, tier } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="p-8 text-center max-w-2xl mx-auto mt-8">
        <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
        <p className="text-muted-foreground mb-6">
          This feature is available on Pro and Enterprise plans. Your current plan: <strong>{tier.toUpperCase()}</strong>
        </p>
        <Button onClick={() => navigate('/subscription')}>
          Upgrade Now
        </Button>
      </Card>
    );
  }

  return <>{children}</>;
};
