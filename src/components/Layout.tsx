import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
        <aside className="hidden md:block md:w-64 md:border-r md:border-border md:min-h-screen">
          <div className="sticky top-0 p-6">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
              Wellio
            </h1>
            <Navigation />
          </div>
        </aside>
        
        <main className="flex-1 pb-20 md:pb-0">
          <div className="p-4 md:p-8">
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
