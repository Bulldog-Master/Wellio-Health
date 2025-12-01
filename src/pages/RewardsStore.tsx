import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Crown, Zap, Award, TrendingUp, Clock, Check, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Json } from "@/integrations/supabase/types";

interface Reward {
  id: string;
  name: string;
  description: string;
  category: string;
  points_cost: number;
  duration_days: number | null;
  metadata: Json;
}

interface UserPoints {
  points: number;
  activeRewards: any[];
}

const RewardsStore = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation('rewards');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints>({ points: 0, activeRewards: [] });
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch rewards catalog
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_cost', { ascending: true });

      if (rewardsError) throw rewardsError;

      // Fetch user points
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_points')
        .eq('id', user.id)
        .single();

      // Fetch active redemptions
      const { data: redemptions } = await supabase
        .from('reward_redemptions')
        .select('*, rewards(*)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

      setRewards(rewardsData || []);
      setUserPoints({
        points: profile?.referral_points || 0,
        activeRewards: redemptions || []
      });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: "Error",
        description: "Failed to load rewards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setShowConfirm(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;

    setRedeeming(true);
    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        _reward_id: selectedReward.id
      });

      if (error) throw error;

      toast({
        title: "Success! 🎉",
        description: `You've redeemed ${selectedReward.name}!`,
      });

      // Refresh data
      await fetchData();
      setShowConfirm(false);
      setSelectedReward(null);
    } catch (error: any) {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem reward",
        variant: "destructive",
      });
    } finally {
      setRedeeming(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'subscription': return Crown;
      case 'badge': return Award;
      case 'feature': return Zap;
      case 'marketplace': return TrendingUp;
      default: return Gift;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'subscription': return 'text-primary';
      case 'badge': return 'text-accent';
      case 'feature': return 'text-secondary';
      case 'marketplace': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const filterRewardsByCategory = (category: string) => {
    return rewards.filter(r => r.category === category);
  };

  const canAfford = (cost: number) => userPoints.points >= cost;

  const hasActiveReward = (rewardId: string) => {
    return userPoints.activeRewards.some(r => r.reward_id === rewardId);
  };

  const RewardCard = ({ reward }: { reward: Reward }) => {
    const Icon = getCategoryIcon(reward.category);
    const affordable = canAfford(reward.points_cost);
    const active = hasActiveReward(reward.id);

    return (
      <Card className={`p-6 relative overflow-hidden transition-all hover:shadow-lg ${
        !affordable ? 'opacity-60' : ''
      } ${active ? 'border-success' : ''}`}>
        {active && (
          <Badge className="absolute top-3 right-3 bg-success">
            <Check className="w-3 h-3 mr-1" />
            {t('active')}
          </Badge>
        )}
        
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-card ${getCategoryColor(reward.category)}`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{reward.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary">{reward.points_cost} {t('pts')}</span>
                {reward.duration_days && (
                  <Badge variant="outline" className="ml-2">
                    <Clock className="w-3 h-3 mr-1" />
                    {reward.duration_days} {t('days')}
                  </Badge>
                )}
                {!reward.duration_days && (
                  <Badge variant="outline" className="ml-2">
                    {t('permanent')}
                  </Badge>
                )}
              </div>
              
              <Button
                onClick={() => handleRedeemClick(reward)}
                disabled={!affordable || active || redeeming}
                size="sm"
                className="gap-2"
              >
                {active ? (
                  <>
                    <Check className="w-4 h-4" />
                    {t('owned')}
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    {t('redeem')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('rewards_store')}</h1>
              <p className="text-muted-foreground">{t('spend_points')}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigate('/referral')}
          >
            {t('view_referrals')}
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-gradient-hero text-white shadow-glow-secondary">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 mb-1">{t('your_balance')}</p>
            <h2 className="text-4xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              {userPoints.points} {t('points')}
            </h2>
          </div>
          {userPoints.activeRewards.length > 0 && (
            <div className="text-right">
              <p className="text-white/80 mb-1">{t('active_rewards')}</p>
              <p className="text-2xl font-bold">{userPoints.activeRewards.length}</p>
            </div>
          )}
        </div>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">{t('all_rewards')}</TabsTrigger>
          <TabsTrigger value="subscription">{t('subscriptions')}</TabsTrigger>
          <TabsTrigger value="badge">{t('badges')}</TabsTrigger>
          <TabsTrigger value="feature">{t('features')}</TabsTrigger>
          <TabsTrigger value="marketplace">{t('marketplace')}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {rewards.map(reward => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </TabsContent>

        {['subscription', 'badge', 'feature', 'marketplace'].map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            {filterRewardsByCategory(category).length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <p>{t('no_rewards', { category })}</p>
              </Card>
            ) : (
              filterRewardsByCategory(category).map(reward => (
                <RewardCard key={reward.id} reward={reward} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirm_redemption')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirm_message')} <strong>{selectedReward?.name}</strong> {t('for_points')}{' '}
              <strong>{selectedReward?.points_cost} {t('points')}</strong>?
              {selectedReward?.duration_days && (
                <span className="block mt-2">
                  {t('reward_active_for')} {selectedReward.duration_days} {t('days')}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRedeem} disabled={redeeming}>
              {redeeming ? t('redeeming') : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RewardsStore;
