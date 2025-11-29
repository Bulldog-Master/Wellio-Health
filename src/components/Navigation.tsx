import { Home, Utensils, Activity, Users, Settings, MessageSquare, Dumbbell } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Dashboard", color: "text-[hsl(var(--nav-icon-1))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-1))]" },
    { to: "/feed", icon: MessageSquare, label: "Feed", color: "text-[hsl(var(--nav-icon-2))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-2))]" },
    { to: "/workout", icon: Dumbbell, label: "Workout", color: "text-[hsl(var(--nav-icon-4))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-4))]" },
    { to: "/food", icon: Utensils, label: "Nutrition", color: "text-[hsl(var(--nav-icon-5))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-5))]" },
    { to: "/socials", icon: Users, label: "Social", color: "text-[hsl(var(--nav-icon-7))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-7))]" },
    { to: "/settings", icon: Settings, label: "Settings", color: "text-[hsl(var(--nav-icon-6))]", hoverColor: "group-hover:drop-shadow-[0_0_8px_hsl(var(--nav-icon-6))]" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:relative md:border-0 md:bg-transparent"
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="flex justify-around md:flex-col md:gap-2 md:p-4">
        {navItems.map(({ to, icon: Icon, label, color, hoverColor }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "group flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 md:px-4 md:py-3",
              "transition-all duration-300 ease-out",
              "md:rounded-lg md:hover:bg-sidebar-accent/50"
            )}
            activeClassName="font-medium md:bg-sidebar-accent/30"
            aria-label={`Navigate to ${label}`}
          >
            <Icon 
              className={cn(
                "w-5 h-5 transition-all duration-300",
                color,
                hoverColor
              )} 
              aria-hidden="true" 
            />
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
