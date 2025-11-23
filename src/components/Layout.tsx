import { ReactNode } from "react";
import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <aside className="hidden md:block md:w-64 md:border-r md:border-border md:min-h-screen">
          <div className="sticky top-0 p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Wellio
              </h1>
              <ThemeToggle />
            </div>
            <Navigation />
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </aside>
        
        <main className="flex-1 pb-20 md:pb-0">
          <div className="p-4 md:p-8">
            <div className="flex justify-end mb-4 md:hidden">
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
