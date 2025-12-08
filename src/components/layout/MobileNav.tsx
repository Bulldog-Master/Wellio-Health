import { Home, Utensils, Activity, Users, Crown, MoreHorizontal } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/hooks/subscription";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SidebarNav from "./SidebarNav";

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

const MobileNav = () => {
  const { t } = useTranslation(['common', 'premium']);
  const { hasFullAccess, tier } = useSubscription();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(() => getCachedPremiumAccess());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hookAccess = hasFullAccess || tier === 'pro' || tier === 'enterprise';
    setHasPremiumAccess(hookAccess);
  }, [hasFullAccess, tier]);

  // Core 5 items for mobile bottom nav
  const coreNavItems = [
    { to: "/", icon: Home, label: t('dashboard') },
    { to: "/activity", icon: Activity, label: t('nav.activity') },
    { to: "/food", icon: Utensils, label: t('nav.food') },
    { to: "/connect", icon: Users, label: t('nav.connect') },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {coreNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px]",
              "transition-colors duration-200"
            )}
            activeClassName="text-primary"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium truncate">{label}</span>
          </NavLink>
        ))}

        {/* Premium Hub for premium users, or More menu for all */}
        {hasPremiumAccess ? (
          <NavLink
            to="/premium"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px]",
              "transition-colors duration-200"
            )}
            activeClassName="text-primary"
          >
            <Crown className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-medium text-primary">VIP</span>
          </NavLink>
        ) : null}

        {/* More menu - opens full navigation sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px]",
                "transition-colors duration-200 text-muted-foreground hover:text-foreground"
              )}
              aria-label={t('nav.more')}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('nav.more')}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
            <SheetHeader className="pb-4 border-b border-border">
              <SheetTitle className="text-left gradient-text">Wellio</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-full pb-20" onClick={() => setIsOpen(false)}>
              <SidebarNav />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileNav;