import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useProCheckout, ProTier, BillingPeriod } from '../hooks/useProCheckout';
import { Loader2, Crown } from 'lucide-react';

interface ProUpgradeButtonProps {
  tier: ProTier;
  billingPeriod?: BillingPeriod;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function ProUpgradeButton({
  tier,
  billingPeriod = 'monthly',
  variant = 'default',
  size = 'default',
  className,
  children,
}: ProUpgradeButtonProps) {
  const { t } = useTranslation(['subscription']);
  const { startCheckout, isLoading } = useProCheckout();

  const handleClick = () => {
    startCheckout(tier, billingPeriod);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Crown className="h-4 w-4 mr-2" />
      )}
      {children || t('subscribe_now')}
    </Button>
  );
}
