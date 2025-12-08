import { useState, useCallback } from 'react';
import { MilestoneType } from '@/components/celebrations/MilestoneCelebration';
import { useSubscription } from '@/hooks/subscription';

interface MilestoneData {
  milestone: MilestoneType;
  points?: number;
  badgeName?: string;
}

export function useMilestoneCelebration() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneData | null>(null);
  const { hasFullAccess, hasFeature } = useSubscription();

  const celebrate = useCallback((milestone: MilestoneType, points?: number, badgeName?: string) => {
    // Only show celebrations for premium users
    const canCelebrate = hasFullAccess || hasFeature('milestone_celebrations');
    
    if (!canCelebrate) {
      console.log('Milestone celebrations require premium access');
      return false;
    }

    setCurrentMilestone({ milestone, points, badgeName });
    setIsOpen(true);
    return true;
  }, [hasFullAccess, hasFeature]);

  const closeCelebration = useCallback(() => {
    setIsOpen(false);
    // Clear milestone after animation
    setTimeout(() => setCurrentMilestone(null), 300);
  }, []);

  return {
    isOpen,
    currentMilestone,
    celebrate,
    closeCelebration,
  };
}
