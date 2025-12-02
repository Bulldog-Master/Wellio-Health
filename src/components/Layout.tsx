import { ReactNode } from "react";
import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { User, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import QuickActionsButton from "./QuickActionsButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadNotificationCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-border/30 md:min-h-screen bg-gradient-to-br from-primary/10 via-secondary/15 to-accent/10 dark:from-primary/20 dark:via-secondary/25 dark:to-accent/15">
          <div className="sticky top-0 flex flex-col h-screen p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h1 className="text-2xl font-bold gradient-text">
                Wellio
              </h1>
              <div className="flex items-center gap-0.5 shrink-0">
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/notifications")}
                  className="hover:bg-sidebar-accent text-sidebar-foreground relative h-8 w-8"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount && unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                  className="hover:bg-sidebar-accent text-sidebar-foreground h-8 w-8"
                >
                  <User className="w-4 h-4" />
                </Button>
                <ThemeToggle />
              </div>
            </div>
            
            <Navigation />
          </div>
        </aside>
        
        <main className="flex-1 pb-20 md:pb-0">
          <div className="p-4 md:p-8">
            <div className="flex justify-end gap-2 mb-4 md:hidden">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/notifications")}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
              >
                <User className="w-5 h-5" />
              </Button>
              <ThemeToggle />
            </div>
            {children}
          </div>
        </main>

        <div className="md:hidden">
          <Navigation />
        </div>

        {/* Floating Quick Actions Button */}
        <QuickActionsButton />
      </div>
    </div>
  );
};

export default Layout;
