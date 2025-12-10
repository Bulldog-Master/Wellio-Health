import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export type ProTier = 'coach_pro' | 'coach_team' | 'clinician_practice' | 'clinician_enterprise';
export type BillingPeriod = 'monthly' | 'yearly';

interface UseProCheckoutOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useProCheckout(options?: UseProCheckoutOptions) {
  const { t } = useTranslation(['subscription', 'common']);
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = async (tier: ProTier, billingPeriod: BillingPeriod = 'monthly') => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-pro-checkout', {
        body: { tier, billing_period: billingPeriod },
      });

      if (error) {
        console.error('Checkout error:', error);
        const errorMessage = error.message || t('common:error');
        toast.error(errorMessage);
        options?.onError?.(errorMessage);
        return null;
      }

      if (data?.url) {
        options?.onSuccess?.(data.url);
        // Redirect to Stripe checkout
        window.location.href = data.url;
        return data.url;
      }

      if (data?.error) {
        toast.error(data.error);
        options?.onError?.(data.error);
        return null;
      }

      return null;
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = t('common:error');
      toast.error(errorMessage);
      options?.onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startCheckout,
    isLoading,
  };
}
