import { Home, User, Scale, Utensils, Dumbbell } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/weight", icon: Scale, label: "Weight" },
    { to: "/food", icon: Utensils, label: "Food" },
    { to: "/workout", icon: Dumbbell, label: "Workout" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:relative md:border-0 md:bg-transparent">
      <div className="flex justify-around md:flex-col md:gap-2 md:p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 md:px-4 md:py-3",
              "text-muted-foreground hover:text-primary transition-smooth",
              "md:rounded-lg md:hover:bg-secondary"
            )}
            activeClassName="text-primary font-medium md:bg-secondary"
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs md:text-sm">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
