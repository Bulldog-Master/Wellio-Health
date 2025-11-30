import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Bell, CreditCard, HelpCircle, ArrowLeft, ChevronRight, Heart, Crown, Gift, Award, Sparkles, Users } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SettingsMenu = () => {
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const [referralStats, setReferralStats] = useState({
    points: 0,
    totalReferrals: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_points')
        .eq('id', user.id)
        .single();

      const { data: referralsData } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', user.id);

      setReferralStats({
        points: profile?.referral_points || 0,
        totalReferrals: referralsData?.length || 0,
        activeUsers: referralsData?.filter(r => r.status === 'completed').length || 0
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsItems = [
    {
      title: "Subscription",
      description: `Current plan: ${tier.toUpperCase()} - Manage your subscription`,
      icon: Crown,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/subscription",
      badge: tier !== 'free' ? tier : undefined,
    },
    {
      title: "Referral Program",
      description: loading 
        ? "Loading your referral stats..." 
        : `${referralStats.points} points • ${referralStats.totalReferrals} referrals • ${referralStats.activeUsers} active`,
      icon: Users,
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-500",
      path: "/referral",
      badge: referralStats.points > 0 ? `${referralStats.points} pts` : undefined,
      badgeVariant: "secondary" as const,
    },
    {
      title: "Rewards Store",
      description: loading
        ? "Browse rewards..."
        : `Spend your ${referralStats.points} points on premium rewards`,
      icon: Gift,
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      path: "/rewards",
      badge: referralStats.points >= 500 ? "Can Redeem!" : undefined,
      badgeVariant: "default" as const,
    },
    {
      title: "Privacy & Security",
      description: "Control your privacy settings and security options",
      icon: Shield,
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
      path: "/settings/privacy-security",
    },
    {
      title: "Close Friends",
      description: "Manage who can see your close friends stories",
      icon: Heart,
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-500",
      path: "/settings/close-friends",
    },
    {
      title: "Trusted Devices",
      description: "Manage devices that can skip 2FA verification",
      icon: Shield,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/settings/trusted-devices",
    },
    {
      title: "Orders & Payments",
      description: "View your orders and manage payment methods",
      icon: CreditCard,
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      path: "/settings/orders-payments",
    },
    {
      title: "Notifications",
      description: "Configure your notification preferences",
      icon: Bell,
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      path: "/settings/notifications",
    },
    {
      title: "Support",
      description: "Get help and contact support",
      icon: HelpCircle,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/settings/support",
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Account preferences and configuration</p>
        </div>
      </div>

      <div className="grid gap-4">
        {settingsItems.map((item) => (
          <Card
            key={item.path}
            className="p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${item.iconBg} rounded-xl transition-all duration-300 group-hover:scale-110`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant || "outline"} 
                      className="mt-2 inline-block capitalize"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SettingsMenu;
