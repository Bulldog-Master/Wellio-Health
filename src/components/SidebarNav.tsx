import { 
  Home, Utensils, Activity, Users, Settings, Sparkles, Heart, Crown, 
  Newspaper, MapPin, Handshake, Leaf, ShoppingBag, Briefcase,
  ChevronDown, Dumbbell, Store, MoreHorizontal
} from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const getCachedPremiumAccess = (): boolean => {
  try {
    const isVIP = localStorage.getItem('subscription_isVIP') === 'true';
    const isAdmin = localStorage.getItem('subscription_isAdmin') === 'true';
    const tier = localStorage.getItem('subscription_tier');
    return isVIP || isAdmin || tier === 'pro' || tier === 'enterprise';
  } catch {
    return false;
  }
};

interface NavGroup {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  color: string;
  showBadge?: boolean;
}

const SidebarNav = () => {
  const { t } = useTranslation(['common', 'premium']);
  const [showRewardsBadge, setShowRewardsBadge] = useState(false);
  const { hasFullAccess, tier } = useSubscription();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(() => getCachedPremiumAccess());
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    fitness: true,
    social: false,
    discover: false,
    more: false,
  });

  useEffect(() => {
    const hookAccess = hasFullAccess || tier === 'pro' || tier === 'enterprise';
    setHasPremiumAccess(hookAccess);
  }, [hasFullAccess, tier]);

  useEffect(() => {
    checkRewardsStatus();
  }, []);

  const checkRewardsStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_points')
        .eq('id', user.id)
        .single();
      const lastChecked = localStorage.getItem('lastCheckedRewards');
      const now = Date.now();
      const daysSinceCheck = lastChecked ? (now - parseInt(lastChecked)) / (1000 * 60 * 60 * 24) : 999;
      setShowRewardsBadge((profile?.referral_points || 0) > 0 || daysSinceCheck > 3);
    } catch (error) {
      console.error('Error checking rewards status:', error);
    }
  };

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navGroups: NavGroup[] = [
    {
      label: t('nav.fitness'),
      icon: Dumbbell,
      defaultOpen: true,
      items: [
        { to: "/", icon: Home, label: t('dashboard'), color: "text-primary" },
        { to: "/activity", icon: Activity, label: t('nav.activity'), color: "text-emerald-500" },
        { to: "/food", icon: Utensils, label: t('nav.food'), color: "text-orange-500" },
        { to: "/recovery", icon: Leaf, label: t('nav.recovery'), color: "text-green-500" },
      ]
    },
    {
      label: t('nav.social'),
      icon: Users,
      items: [
        { to: "/connect", icon: Users, label: t('nav.connect'), color: "text-blue-500" },
        { to: "/fundraisers", icon: Heart, label: t('nav.fundraisers'), color: "text-pink-500" },
      ]
    },
    {
      label: t('nav.discover'),
      icon: MapPin,
      items: [
        { to: "/locations", icon: MapPin, label: t('nav.wellness_directory'), color: "text-teal-500" },
        { to: "/news", icon: Newspaper, label: t('nav.news'), color: "text-violet-500" },
      ]
    },
    {
      label: t('nav.more'),
      icon: MoreHorizontal,
      items: [
        { to: "/professional", icon: Briefcase, label: t('nav.professional'), color: "text-indigo-500" },
        { to: "/products", icon: ShoppingBag, label: t('nav.shop'), color: "text-amber-500" },
        { to: "/sponsors", icon: Handshake, label: t('nav.sponsors'), color: "text-cyan-500" },
        { to: "/settings", icon: Settings, label: t('settings'), color: "text-gray-500", showBadge: showRewardsBadge },
      ]
    }
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-2" aria-label="Main navigation">
      <div className="space-y-1">
        {navGroups.map((group, groupIndex) => (
          <Collapsible
            key={group.label}
            open={openGroups[Object.keys(openGroups)[groupIndex]] ?? group.defaultOpen}
            onOpenChange={() => toggleGroup(Object.keys(openGroups)[groupIndex])}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors">
              <div className="flex items-center gap-2">
                <group.icon className="h-4 w-4" />
                <span>{group.label}</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                openGroups[Object.keys(openGroups)[groupIndex]] && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-2">
              {group.items.map(({ to, icon: Icon, label, color, showBadge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 rounded-lg",
                    "transition-all duration-200 hover:bg-sidebar-accent/50"
                  )}
                  activeClassName="bg-sidebar-accent font-medium"
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className={cn("h-5 w-5", color)} />
                    {showBadge && (
                      <div className="absolute -top-1 -right-1">
                        <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    {label}
                  </span>
                </NavLink>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}

        {/* Premium Hub */}
        {hasPremiumAccess && (
          <div className="pt-4 mt-4 border-t border-border">
            <NavLink
              to="/premium"
              className={cn(
                "group flex items-center gap-3 px-4 py-2.5 rounded-lg",
                "transition-all duration-200 hover:bg-primary/10"
              )}
              activeClassName="bg-primary/20 font-medium"
            >
              <Crown className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {t('premium:premium_hub')}
              </span>
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default SidebarNav;
