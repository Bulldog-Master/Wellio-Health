import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Users, Gift, TrendingUp, Award, History, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ProgressToReward } from "@/components/ProgressToReward";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface ReferralStats {
  totalReferrals: number;
  activeUsers: number;
  rewardPoints: number;
  referralCode: string | null;
}

interface Referral {
  id: string;
  referred_email: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  reward_points: number;
}

const Referral = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation('referral');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeUsers: 0,
    rewardPoints: 0,
    referralCode: null,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const referralLink = stats.referralCode 
    ? `${window.location.origin}/auth?ref=${stats.referralCode}`
    : '';

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's referral code and points
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code, referral_points')
        .eq('id', user.id)
        .single();

      // Get referrals made by this user
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      const totalReferrals = referralsData?.length || 0;
      const activeUsers = referralsData?.filter(r => r.status === 'completed').length || 0;

      setStats({
        totalReferrals,
        activeUsers,
        rewardPoints: profile?.referral_points || 0,
        referralCode: profile?.referral_code || null,
      });

      setReferrals(referralsData || []);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralLink) return;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const shareReferral = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Our Fitness Community!",
          text: "Start your fitness journey with me - track workouts, nutrition, and health goals!",
          url: referralLink,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
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
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">{t('description')}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/rewards')}
              className="gap-2"
            >
              <Award className="w-4 h-4" />
              {t('rewards_store')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/points-history')}
              className="gap-2"
            >
              <History className="w-4 h-4" />
              {t('history')}
            </Button>
          </div>
        </div>
      </div>

      <Card className="p-8 bg-gradient-hero text-white shadow-glow-secondary">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-2">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">{t('hero_title')}</h2>
          <p className="text-white/90 max-w-md mx-auto">
            {t('hero_description')}
          </p>
        </div>
      </Card>

      {stats.referralCode && (
      <Card className="p-6 hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t('share_link')}</h2>
          <Badge variant="secondary" className="text-sm">{t('points_per_referral')}</Badge>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Input
            value={referralLink}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="gap-2 min-w-[100px] shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                {t('copied')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t('copy')}
              </>
            )}
          </Button>
          <Button
            onClick={shareReferral}
            className="gap-2 shrink-0"
          >
            <Share2 className="w-4 h-4" />
            {t('share')}
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {t('points_breakdown')}
        </p>
      </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">{t('total_referrals')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.totalReferrals}</p>
          <p className="text-sm text-muted-foreground">{t('friends_invited')}</p>
        </Card>

        <Card className="p-6 hover:shadow-xl transition-all bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-semibold">{t('reward_points')}</h3>
          </div>
          <p className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {stats.rewardPoints}
          </p>
          <ProgressToReward currentPoints={stats.rewardPoints} size="sm" showLabel={false} />
        </Card>

        <Card className="p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-success/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold">{t('active_users')}</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.activeUsers}</p>
          <p className="text-sm text-muted-foreground">{t('completed_onboarding')}</p>
        </Card>
      </div>

      {referrals.length > 0 && (
        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('recent_referrals')}</h3>
          <div className="space-y-3">
            {referrals.slice(0, 5).map((ref) => (
              <div key={ref.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div>
                  <p className="font-medium">{ref.referred_email || 'Pending'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ref.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    ref.status === 'completed' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {ref.status}
                  </span>
                  {ref.reward_points > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +{ref.reward_points} points
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">{t('how_it_works')}</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">{t('step1_title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('step1_description')}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">{t('step2_title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('step2_description')}
                <strong className="block mt-1 text-success">{t('step2_bonus')}</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">{t('step3_title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('step3_description')}
                <strong className="block mt-1 text-primary">{t('step3_total')}</strong>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          {t('rewards_title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background/50 rounded-lg">
            <h5 className="font-semibold text-primary mb-2">💎 {t('rewards_subscriptions')}</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {t('rewards_sub_1month')}</li>
              <li>• {t('rewards_sub_3months')}</li>
              <li>• {t('rewards_sub_1year')}</li>
            </ul>
          </div>
          <div className="p-4 bg-background/50 rounded-lg">
            <h5 className="font-semibold text-accent mb-2">🏆 {t('rewards_badges')}</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {t('rewards_badge_verified')}</li>
              <li>• {t('rewards_badge_elite')}</li>
              <li>• {t('rewards_badge_community')}</li>
            </ul>
          </div>
          <div className="p-4 bg-background/50 rounded-lg">
            <h5 className="font-semibold text-secondary mb-2">⚡ {t('rewards_features')}</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {t('rewards_feature_boost')}</li>
              <li>• {t('rewards_feature_templates')}</li>
              <li>• {t('rewards_feature_analytics')}</li>
            </ul>
          </div>
          <div className="p-4 bg-background/50 rounded-lg">
            <h5 className="font-semibold text-success mb-2">📈 {t('rewards_marketplace')}</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {t('rewards_market_featured')}</li>
              <li>• {t('rewards_market_priority')}</li>
              <li>• {t('rewards_market_premium')}</li>
            </ul>
          </div>
        </div>
        <Button
          onClick={() => navigate('/rewards')}
          className="w-full mt-4 gap-2"
          variant="outline"
        >
          <Award className="w-4 h-4" />
          {t('browse_rewards')}
        </Button>
      </Card>

      <Card className="p-6 bg-accent/5 border-accent/20">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">{t('special_benefits_title')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('special_benefits_description')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Referral;
