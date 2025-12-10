import { Home, History, Users, Settings } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const MobileNav = () => {
  const { t } = useTranslation(['common']);

  // Core 4-tab navigation: Today | History | Care Team | Settings
  const navItems = [
    { to: "/", icon: Home, label: t('nav_main.today') },
    { to: "/history", icon: History, label: t('nav_main.history') },
    { to: "/care-team", icon: Users, label: t('nav_main.care_team') },
    { to: "/settings", icon: Settings, label: t('settings') },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[70px]",
              "transition-colors duration-200 text-muted-foreground"
            )}
            activeClassName="text-primary"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
