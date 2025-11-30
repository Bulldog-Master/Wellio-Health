import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useReferralCelebration = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ points: number; description: string } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkForNewPoints = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Subscribe to points transactions for this user
        const channel = supabase
          .channel('points_transactions_channel')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'points_transactions',
              filter: `user_id=eq.${user.id}`,
            },
            (payload: any) => {
              const transaction = payload.new;
              if (transaction.transaction_type === 'earned' && transaction.amount > 0) {
                setCelebrationData({
                  points: transaction.amount,
                  description: transaction.description,
                });
                setShowCelebration(true);
                
                // Refresh queries to update displayed points everywhere
                queryClient.invalidateQueries({ queryKey: ['user-points'] });
                queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error setting up points celebration:', error);
      }
    };

    checkForNewPoints();
  }, [queryClient]);

  const closeCelebration = () => {
    setShowCelebration(false);
    setTimeout(() => setCelebrationData(null), 300);
  };

  return { showCelebration, celebrationData, closeCelebration };
};
