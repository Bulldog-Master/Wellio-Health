import { Home, User, Scale, Utensils, BookOpen, Dumbbell, Gift, Activity, CheckSquare, Stethoscope, FileHeart, Sparkles, Users, Trophy } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Dashboard", color: "text-nav-icon-1" },
    { to: "/food", icon: Utensils, label: "Food", color: "text-nav-icon-2" },
    { to: "/recipes", icon: BookOpen, label: "Recipes", color: "text-nav-icon-3" },
    { to: "/activity", icon: Activity, label: "Activity", color: "text-nav-icon-4" },
    { to: "/achievements", icon: Trophy, label: "Achievements", color: "text-warning" },
    { to: "/medical", icon: FileHeart, label: "Health", color: "text-nav-icon-5" },
    { to: "/insights", icon: Sparkles, label: "AI Insights", color: "text-nav-icon-6" },
    { to: "/socials", icon: Users, label: "Socials", color: "text-nav-icon-7" },
    { to: "/referral", icon: Gift, label: "Referral", color: "text-nav-icon-8" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:relative md:border-0 md:bg-transparent">
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
          >
            <Icon className={cn("w-5 h-5", color)} />
            <span className="text-xs md:text-sm">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
