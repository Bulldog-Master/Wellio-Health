import { Bell, User, Search } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { CartButton } from "../cart/CartButton";
import { Input } from "../ui/input";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Header = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common']);
  const { data: unreadCount } = useUnreadNotificationCount();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">W</span>
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">Wellio</span>
        </div>

        {/* Search Bar - Desktop only */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <CartButton />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/notifications")}
            className="relative h-9 w-9"
            aria-label={t('notifications')}
          >
            <Bell className="h-5 w-5" />
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
            className="h-9 w-9"
            aria-label={t('profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;