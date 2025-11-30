import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check, Users, Gift, TrendingUp, Award, History } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Referral Program</h1>
            <p className="text-muted-foreground">Invite friends and earn rewards together</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/rewards')}
            className="gap-2"
          >
            <Award className="w-4 h-4" />
            Rewards Store
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/points-history')}
            className="gap-2"
          >
            <History className="w-4 h-4" />
            History
          </Button>
        </div>
      </div>

      <Card className="p-8 bg-gradient-hero text-white shadow-glow-secondary">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-2">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Grow Your Fitness Network</h2>
          <p className="text-white/90 max-w-md mx-auto">
            Whether you're a trainer, creator, or fitness enthusiast - grow your community and earn rewards!
          </p>
        </div>
      </Card>

      {stats.referralCode && (
        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="gap-2 min-w-[100px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={shareReferral}
              className="w-full gap-2 bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              <Share2 className="w-4 h-4" />
              Share Referral Link
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-card shadow-md text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Total Referrals</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalReferrals}</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-3">
            <Gift className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="font-semibold mb-2">Reward Points</h3>
          <p className="text-3xl font-bold text-secondary">{stats.rewardPoints}</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-3">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-accent">{stats.activeUsers}</p>
        </Card>
      </div>

      {referrals.length > 0 && (
        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-4">Recent Referrals</h3>
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
        <h3 className="text-lg font-semibold mb-4">How It Works</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Share Your Link</h4>
              <p className="text-sm text-muted-foreground">
                Copy your unique referral link and share it with friends, clients, or followers via social media, email, or messaging apps.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/10 text-secondary font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">They Sign Up & Join</h4>
              <p className="text-sm text-muted-foreground">
                When someone uses your link to create an account, they'll be connected to your referral network automatically.
                <strong className="block mt-1 text-success">You get 50 points, they get 25 points!</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">Earn Rewards Together</h4>
              <p className="text-sm text-muted-foreground">
                When they complete onboarding, you get 100 more points and they get 50 points!
                <strong className="block mt-1 text-primary">Total: 150 points per active referral</strong>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          What Can You Get With Points?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background/50 rounded-lg">
            <h5 className="font-semibold text-primary mb-2">💎 Subscriptions</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 1 Month Pro: <strong>500 pts</strong></li>
              <li>• 3 Months Pro: <strong>1,000 pts</strong></li>
              <li>• 1 Year Pro: <strong>5,000 pts</strong></li>
            </ul>
          </div>
          <div className="p-4 bg-background/50 rounded-lg">
            <h5 className="font-semibold text-accent mb-2">🏆 Badges</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Verified Badge: <strong>100 pts</strong></li>
              <li>• Elite Trainer: <strong>1,000 pts</strong></li>
              <li>• Community Leader: <strong>2,000 pts</strong></li>
            </ul>
          </div>
          <div className="p-4 bg-background/50 rounded-lg">
            <h5 className="font-semibold text-secondary mb-2">⚡ Features</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Profile Boost: <strong>200 pts</strong></li>
              <li>• Premium Templates: <strong>500 pts</strong></li>
              <li>• Advanced Analytics: <strong>1,000 pts</strong></li>
            </ul>
          </div>
          <div className="p-4 bg-background/50 rounded-lg">
            <h5 className="font-semibold text-success mb-2">📈 Marketplace</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Featured Trainer: <strong>300 pts</strong></li>
              <li>• Priority Listing: <strong>500 pts</strong></li>
              <li>• Premium Status: <strong>1,000 pts</strong></li>
            </ul>
          </div>
        </div>
        <Button
          onClick={() => navigate('/rewards')}
          className="w-full mt-4 gap-2"
          variant="outline"
        >
          <Award className="w-4 h-4" />
          Browse All Rewards
        </Button>
      </Card>

      <Card className="p-6 bg-accent/5 border-accent/20">
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 text-accent mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">Special Benefits for Trainers & Creators</h4>
            <p className="text-sm text-muted-foreground">
              Build your network faster! Trainers can use referrals to grow their client base, while creators can expand their community. 
              Higher referral counts unlock premium features and visibility boosts.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Referral;
