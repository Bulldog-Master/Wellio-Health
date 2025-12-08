import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Settings,
  Users,
  Newspaper,
  MapPin,
  Leaf,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/activity', icon: Dumbbell, labelKey: 'nav.activity' },
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { path: '/food', icon: Utensils, labelKey: 'nav.food' },
  { path: '/connect', icon: Users, labelKey: 'nav.connect' },
  { path: '/news', icon: Newspaper, labelKey: 'nav.news' },
  { path: '/locations', icon: MapPin, labelKey: 'nav.locations' },
  { path: '/recovery', icon: Leaf, labelKey: 'nav.recovery' },
  { path: '/professional', icon: Briefcase, labelKey: 'nav.professional' },
  { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export const Navigation = () => {
  const { t } = useTranslation('common');
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
          location.pathname.startsWith(item.path + '/');
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
