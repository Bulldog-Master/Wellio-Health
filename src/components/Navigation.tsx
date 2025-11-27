import { Home, Utensils, Gift, Activity, FileHeart, Sparkles, Users, Trophy, Ruler, PieChart, CalendarRange, Compass, Video, Target, TrendingUp, MessageSquare, Bell, Search } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";

const Navigation = () => {
  const { data: unreadCount } = useUnreadNotificationCount();

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard", color: "text-nav-icon-1" },
    { to: "/feed", icon: MessageSquare, label: "Feed", color: "text-secondary" },
    { to: "/search", icon: Search, label: "Search", color: "text-primary" },
    { to: "/notifications", icon: Bell, label: "Notifications", color: "text-warning" },
    { to: "/discover", icon: Compass, label: "Discover", color: "text-nav-icon-15" },
    { to: "/challenges", icon: Target, label: "Challenges", color: "text-success" },
    { to: "/leaderboard", icon: TrendingUp, label: "Leaderboard", color: "text-primary" },
    { to: "/trainer/marketplace", icon: Users, label: "Trainers", color: "text-nav-icon-14" },
    { to: "/creator/hub", icon: Video, label: "Creator Hub", color: "text-nav-icon-16" },
    { to: "/food", icon: Utensils, label: "Food", color: "text-nav-icon-2" },
    { to: "/activity", icon: Activity, label: "Activity", color: "text-nav-icon-4" },
    { to: "/achievements", icon: Trophy, label: "Achievements", color: "text-warning" },
    { to: "/body-measurements", icon: Ruler, label: "Measurements", color: "text-nav-icon-10" },
    { to: "/macros", icon: PieChart, label: "Macros", color: "text-nav-icon-12" },
    { to: "/workout-programs", icon: CalendarRange, label: "Programs", color: "text-nav-icon-13" },
    { to: "/medical", icon: FileHeart, label: "Health", color: "text-nav-icon-5" },
    { to: "/insights", icon: Sparkles, label: "AI Insights", color: "text-nav-icon-6" },
    { to: "/socials", icon: Users, label: "Socials", color: "text-nav-icon-7" },
    { to: "/referral", icon: Gift, label: "Referral", color: "text-nav-icon-9" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:relative md:border-0 md:bg-transparent">
      <div className="flex justify-around md:flex-col md:gap-2 md:p-4">
        {navItems.map(({ to, icon: Icon, label, color }) => {
          const isNotifications = to === "/notifications";
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 md:px-4 md:py-3 relative",
                "text-muted-foreground hover:text-sidebar-foreground transition-smooth",
                "md:rounded-lg md:hover:bg-sidebar-accent"
              )}
              activeClassName="text-sidebar-foreground font-medium md:bg-sidebar-accent"
            >
              <Icon className={cn("w-5 h-5", color)} />
              {isNotifications && unreadCount && unreadCount > 0 && (
                <Badge variant="destructive" className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center p-0 text-xs md:top-2 md:right-2">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
              <span className="text-xs md:text-sm">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
