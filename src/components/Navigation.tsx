import { Home, Utensils, Activity, Users, Settings, Sparkles } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const Navigation = () => {
  const { t } = useTranslation('common');
  const [showRewardsBadge, setShowRewardsBadge] = useState(false);

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

      // Show badge if user has any points or if they haven't checked rewards recently
      const lastChecked = localStorage.getItem('lastCheckedRewards');
      const now = Date.now();
      const daysSinceCheck = lastChecked ? (now - parseInt(lastChecked)) / (1000 * 60 * 60 * 24) : 999;
      
      setShowRewardsBadge((profile?.referral_points || 0) > 0 || daysSinceCheck > 3);
    } catch (error) {
      console.error('Error checking rewards status:', error);
    }
  };

  const navItems = [
    { to: "/activity", icon: Activity, label: t('nav.activity'), color: "text-[hsl(var(--nav-icon-4))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-4))]" },
    { to: "/connect", icon: Users, label: t('nav.connect'), color: "text-[hsl(var(--nav-icon-2))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-2))]" },
    { to: "/", icon: Home, label: t('dashboard'), color: "text-[hsl(var(--nav-icon-1))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-1))]" },
    { to: "/food", icon: Utensils, label: t('nav.food'), color: "text-[hsl(var(--nav-icon-5))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-5))]" },
    { to: "/settings", icon: Settings, label: t('settings'), color: "text-[hsl(var(--nav-icon-6))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-6))]", showBadge: showRewardsBadge },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:relative md:border-0 md:bg-transparent"
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="flex justify-around md:flex-col md:gap-2 md:p-4">
        {navItems.map(({ to, icon: Icon, label, color, hoverColor, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "group relative flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 md:px-4 md:py-3",
              "transition-all duration-300 ease-out",
              "md:rounded-lg md:hover:bg-sidebar-accent/50"
            )}
            activeClassName="font-medium md:bg-sidebar-accent/30"
            aria-label={`Navigate to ${label}`}
          >
            <div className="relative">
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  color,
                  hoverColor
                )} 
                aria-hidden="true" 
              />
              {showBadge && (
                <div className="absolute -top-1 -right-1 w-2 h-2">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                </div>
              )}
            </div>
            <span className={cn(
              "text-xs md:text-sm transition-colors duration-300",
              "text-muted-foreground group-hover:text-foreground"
            )}>
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
