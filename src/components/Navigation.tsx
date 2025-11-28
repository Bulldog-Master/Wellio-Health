import { Home, Utensils, Activity, Users, Settings, MessageSquare, Dumbbell } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Dashboard", color: "text-nav-icon-1" },
    { to: "/feed", icon: MessageSquare, label: "Feed", color: "text-secondary" },
    { to: "/workout", icon: Dumbbell, label: "Workout", color: "text-nav-icon-4" },
    { to: "/food", icon: Utensils, label: "Nutrition", color: "text-nav-icon-2" },
    { to: "/socials", icon: Users, label: "Social", color: "text-nav-icon-7" },
    { to: "/settings", icon: Settings, label: "Settings", color: "text-muted-foreground" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:relative md:border-0 md:bg-transparent"
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="flex justify-around md:flex-col md:gap-2 md:p-4">
        {navItems.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 md:px-4 md:py-3",
              "text-muted-foreground hover:text-sidebar-foreground transition-smooth",
              "md:rounded-lg md:hover:bg-sidebar-accent"
            )}
            activeClassName="text-sidebar-foreground font-medium md:bg-sidebar-accent"
            aria-label={`Navigate to ${label}`}
          >
            <Icon className={cn("w-5 h-5", color)} aria-hidden="true" />
            <span className="text-xs md:text-sm">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
