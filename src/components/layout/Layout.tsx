import { ReactNode } from "react";
import Header from "./Header";
import SidebarNav from "./SidebarNav";
import MobileNav from "./MobileNav";
import QuickActionsButton from "../QuickActionsButton";
import { CartDrawer } from "../cart/CartDrawer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-border/30 md:min-h-[calc(100vh-3.5rem)] bg-sidebar sticky top-14">
          <div className="flex flex-col h-full p-4">
            <SidebarNav />
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">W</span>
              </div>
              <span className="text-lg font-bold gradient-text">Wellio</span>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Floating Quick Actions Button */}
      <QuickActionsButton />
      
      {/* Global Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

export default Layout;