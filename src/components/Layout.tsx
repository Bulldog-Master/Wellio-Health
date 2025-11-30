import { ReactNode } from "react";
import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { User, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadNotificationCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <aside className="hidden md:block md:w-64 md:border-r-2 md:border-sidebar-border md:min-h-screen bg-sidebar/95 backdrop-blur-sm shadow-lg">
          <div className="sticky top-0 p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold gradient-text">
                  Wellio
                </h1>
                <LanguageSwitcher />
              </div>
              <div className="flex items-center justify-end gap-1 pt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/notifications")}
                  className="hover:bg-sidebar-accent text-sidebar-foreground relative"
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
                  className="hover:bg-sidebar-accent text-sidebar-foreground"
                >
                  <User className="w-5 h-5" />
                </Button>
                <ThemeToggle />
              </div>
            </div>
            <div className="border-t-2 border-sidebar-border pt-6">
              <Navigation />
            </div>
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
      </div>
    </div>
  );
};

export default Layout;
