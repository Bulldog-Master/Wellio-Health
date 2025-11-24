import { ReactNode } from "react";
import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";
import { User } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <aside className="hidden md:block md:w-64 md:border-r md:border-sidebar-border md:min-h-screen bg-sidebar">
          <div className="sticky top-0 p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Wellio
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/profile")}
                  className="hover:bg-sidebar-accent"
                >
                  <User className="w-5 h-5" />
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
