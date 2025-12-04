import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Bell, CreditCard, HelpCircle, ArrowLeft, ChevronRight, Heart, Crown, Gift, Sparkles, Users, FileText, Megaphone, Dumbbell, Stethoscope, UserSearch } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProgressToReward } from "@/components/ProgressToReward";
import { useTranslation } from "react-i18next";

const SettingsMenu = () => {
  const navigate = useNavigate();
  const { tier, isAdmin, isVIP, hasFullAccess } = useSubscription();
  const { t } = useTranslation(['settings', 'admin', 'premium', 'medical', 'ads', 'professional']);
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
    // Admin panel - only shown to admins
    ...(isAdmin ? [{
      title: t('admin:admin_panel'),
      description: t('admin:admin_panel_desc'),
      icon: Shield,
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-500",
      path: "/admin/vip",
      badge: "Admin",
      badgeVariant: "default" as const,
    },
    {
      title: t('ads:admin.manage_ads'),
      description: t('settings:manage_ads_desc'),
      icon: Megaphone,
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-500",
      path: "/admin/ads",
      badge: "Admin",
      badgeVariant: "default" as const,
    }] : []),
    // Medical/Health - only for VIP/Admin or upgraded users
    ...(hasFullAccess ? [{
      title: t('medical:health'),
      description: t('medical:track_medications_tests'),
      icon: FileText,
      iconBg: "bg-teal-500/20",
      iconColor: "text-teal-500",
      path: "/medical",
      badge: isAdmin ? "Admin" : "VIP",
      badgeVariant: "secondary" as const,
    }] : []),
    {
      title: t('subscription'),
      description: hasFullAccess 
        ? (isVIP ? t('common:vip_access') : t('common:admin_access'))
        : t('subscription_desc', { tier: tier.toUpperCase() }),
      icon: Crown,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/subscription",
      badge: hasFullAccess ? (isVIP ? 'VIP' : 'Admin') : (tier !== 'free' ? tier : undefined),
    },
    {
      title: t('referral_program'),
      description: loading 
        ? t('referral_loading')
        : t('referral_stats', { 
            points: referralStats.points, 
            referrals: referralStats.totalReferrals, 
            active: referralStats.activeUsers 
          }),
      icon: Users,
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-500",
      path: "/referral",
      badge: referralStats.points > 0 ? `${referralStats.points} pts` : undefined,
      badgeVariant: "secondary" as const,
      showProgress: !loading && referralStats.points > 0,
      progressPoints: referralStats.points,
    },
    {
      title: t('rewards_store'),
      description: loading
        ? t('rewards_loading')
        : t('rewards_desc', { points: referralStats.points }),
      icon: Gift,
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      path: "/rewards",
      badge: referralStats.points >= 500 ? t('can_redeem') : undefined,
      badgeVariant: "default" as const,
    },
    {
      title: t('privacy_security'),
      description: t('privacy_security_desc'),
      icon: Shield,
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
      path: "/settings/privacy-security",
    },
    {
      title: t('close_friends'),
      description: t('close_friends_desc'),
      icon: Heart,
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-500",
      path: "/settings/close-friends",
    },
    {
      title: t('trusted_devices'),
      description: t('trusted_devices_desc'),
      icon: Shield,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/settings/trusted-devices",
    },
    {
      title: t('orders_payments'),
      description: t('orders_payments_desc'),
      icon: CreditCard,
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      path: "/settings/orders-payments",
    },
    {
      title: t('notifications'),
      description: t('notifications_desc'),
      icon: Bell,
      iconBg: "bg-secondary/20",
      iconColor: "text-secondary",
      path: "/settings/notifications",
    },
    {
      title: t('support'),
      description: t('support_desc'),
      icon: HelpCircle,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      path: "/settings/support",
    },
    // Trainer Marketplace - for premium users to find trainers
    ...(hasFullAccess ? [{
      title: t('settings:trainer_marketplace'),
      description: t('settings:trainer_marketplace_desc'),
      icon: UserSearch,
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-500",
      path: "/trainer/marketplace",
      badge: "Pro",
      badgeVariant: "secondary" as const,
    }] : []),
    // Professional Portals - for premium users
    ...(hasFullAccess ? [{
      title: t('professional:trainer_portal'),
      description: t('professional:trainer_portal_desc'),
      icon: Dumbbell,
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-500",
      path: "/trainer-portal",
      badge: "Pro",
      badgeVariant: "secondary" as const,
    },
    {
      title: t('professional:practitioner_portal'),
      description: t('professional:practitioner_portal_desc'),
      icon: Stethoscope,
      iconBg: "bg-cyan-500/20",
      iconColor: "text-cyan-500",
      path: "/practitioner-portal",
      badge: "Pro",
      badgeVariant: "secondary" as const,
    }] : []),
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
          <h1 className="text-3xl font-bold">{t('settings')}</h1>
          <p className="text-muted-foreground mt-1">{t('account_preferences')}</p>
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
                  {item.showProgress && item.progressPoints !== undefined && (
                    <div className="mt-3">
                      <ProgressToReward currentPoints={item.progressPoints} size="sm" />
                    </div>
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
