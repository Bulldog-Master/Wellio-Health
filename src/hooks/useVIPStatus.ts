import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VIPPass {
  id: string;
  user_id: string;
  granted_by: string | null;
  reason: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export const useVIPStatus = () => {
  const [isVIP, setIsVIP] = useState(false);
  const [vipPass, setVipPass] = useState<VIPPass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkVIPStatus();
  }, []);

  const checkVIPStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check using the secure database function
      const { data: hasVIP } = await supabase.rpc('has_active_vip', {
        _user_id: user.id
      });

      setIsVIP(hasVIP || false);

      // Also fetch VIP pass details if available
      const { data: passData } = await supabase
        .from('vip_passes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (passData) {
        setVipPass(passData as VIPPass);
      }
    } catch (error) {
      console.error('Error checking VIP status:', error);
      setIsVIP(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { isVIP, vipPass, isLoading, refetch: checkVIPStatus };
};
