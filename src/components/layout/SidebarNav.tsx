import { 
  Home, Settings, ChevronDown, History, Users, Activity, Utensils, 
  Crown, Stethoscope, Weight, Footprints, Target, Trophy, Calendar,
  Camera, BarChart3, FileText, Dumbbell, Leaf, Brain
} from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/subscription";
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

const SidebarNav = () => {
  const { t } = useTranslation(['common', 'premium', 'clinician']);
  const { hasFullAccess, tier } = useSubscription();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(() => getCachedPremiumAccess());
  const [isClinicianOrPractitioner, setIsClinicianOrPractitioner] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const hookAccess = hasFullAccess || tier === 'pro' || tier === 'enterprise';
    setHasPremiumAccess(hookAccess);
  }, [hasFullAccess, tier]);

  useEffect(() => {
    checkClinicianRole();
  }, []);

  const checkClinicianRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['clinician', 'practitioner', 'admin']);
      setIsClinicianOrPractitioner(roles && roles.length > 0);
    } catch (error) {
      console.error('Error checking clinician role:', error);
    }
  };

  // History sub-items
  const historyItems = [
    { to: "/activity", icon: Activity, label: t('nav.activity') },
    { to: "/food", icon: Utensils, label: t('nav.food') },
    { to: "/weight", icon: Weight, label: t('nav_history.weight') },
    { to: "/step-count", icon: Footprints, label: t('nav_history.steps') },
    { to: "/fitness-goals", icon: Target, label: t('nav_history.goals') },
    { to: "/achievements", icon: Trophy, label: t('nav_history.achievements') },
    { to: "/progress-photos", icon: Camera, label: t('nav_history.photos') },
    { to: "/advanced-analytics", icon: BarChart3, label: t('nav_history.analytics') },
    { to: "/weekly-progress", icon: FileText, label: t('nav_history.reports') },
    { to: "/recovery", icon: Leaf, label: t('nav.recovery') },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-2" aria-label="Main navigation">
      <div className="space-y-1">
        {/* Today - Main Dashboard */}
        <NavLink
          to="/"
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-lg",
            "transition-all duration-200 hover:bg-sidebar-accent/50"
          )}
          activeClassName="bg-sidebar-accent font-medium"
        >
          <Home className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{t('nav_main.today')}</span>
        </NavLink>

        {/* History - Expandable Group */}
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-emerald-500" />
              <span>{t('nav_main.history')}</span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              historyOpen && "rotate-180"
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pl-4 pt-1">
            {historyItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "group flex items-center gap-3 px-4 py-2 rounded-lg",
                  "transition-all duration-200 hover:bg-sidebar-accent/50"
                )}
                activeClassName="bg-sidebar-accent font-medium"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground">
                  {label}
                </span>
              </NavLink>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Care Team */}
        <NavLink
          to="/care-team"
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-lg",
            "transition-all duration-200 hover:bg-sidebar-accent/50"
          )}
          activeClassName="bg-sidebar-accent font-medium"
        >
          <Users className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-medium">{t('nav_main.care_team')}</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={cn(
            "group flex items-center gap-3 px-4 py-3 rounded-lg",
            "transition-all duration-200 hover:bg-sidebar-accent/50"
          )}
          activeClassName="bg-sidebar-accent font-medium"
        >
          <Settings className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium">{t('settings')}</span>
        </NavLink>

        {/* Clinician Dashboard - Only for approved professionals */}
        {isClinicianOrPractitioner && (
          <div className="pt-2 mt-2 border-t border-border">
            <NavLink
              to="/clinician"
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-lg",
                "transition-all duration-200 hover:bg-primary/10"
              )}
              activeClassName="bg-primary/20 font-medium"
            >
              <Stethoscope className="h-5 w-5 text-teal-500" />
              <span className="text-sm font-medium text-teal-500">
                {t('clinician:clinician_dashboard')}
              </span>
            </NavLink>
          </div>
        )}

        {/* Premium Hub - Only for premium users */}
        {hasPremiumAccess && (
          <div className="pt-2 mt-2 border-t border-border">
            <NavLink
              to="/premium"
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-lg",
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
