import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Utensils, Weight, Footprints, Target, Trophy, 
  Camera, BarChart3, FileText, Leaf, ChevronRight 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SEOHead } from '@/components/common';
import { cn } from '@/lib/utils';

const HistoryHub = () => {
  const { t } = useTranslation(['common']);
  const navigate = useNavigate();

  const historyItems = [
    { to: "/activity", icon: Activity, label: t('nav.activity'), description: t('nav_history.activity_desc'), color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { to: "/food", icon: Utensils, label: t('nav.food'), description: t('nav_history.food_desc'), color: "text-orange-500", bg: "bg-orange-500/10" },
    { to: "/weight", icon: Weight, label: t('nav_history.weight'), description: t('nav_history.weight_desc'), color: "text-blue-500", bg: "bg-blue-500/10" },
    { to: "/step-count", icon: Footprints, label: t('nav_history.steps'), description: t('nav_history.steps_desc'), color: "text-purple-500", bg: "bg-purple-500/10" },
    { to: "/fitness-goals", icon: Target, label: t('nav_history.goals'), description: t('nav_history.goals_desc'), color: "text-pink-500", bg: "bg-pink-500/10" },
    { to: "/achievements", icon: Trophy, label: t('nav_history.achievements'), description: t('nav_history.achievements_desc'), color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { to: "/progress-photos", icon: Camera, label: t('nav_history.photos'), description: t('nav_history.photos_desc'), color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { to: "/advanced-analytics", icon: BarChart3, label: t('nav_history.analytics'), description: t('nav_history.analytics_desc'), color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { to: "/weekly-progress", icon: FileText, label: t('nav_history.reports'), description: t('nav_history.reports_desc'), color: "text-teal-500", bg: "bg-teal-500/10" },
    { to: "/recovery", icon: Leaf, label: t('nav.recovery'), description: t('nav_history.recovery_desc'), color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <>
      <SEOHead 
        titleKey="common:nav_main.history"
        descriptionKey="common:nav_history.hub_desc"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('nav_main.history')}</h1>
          <p className="text-muted-foreground">{t('nav_history.hub_desc')}</p>
        </div>

        <div className="grid gap-3">
          {historyItems.map(({ to, icon: Icon, label, description, color, bg }) => (
            <Card 
              key={to}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(to)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={cn("p-3 rounded-xl", bg)}>
                  <Icon className={cn("h-6 w-6", color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{label}</h3>
                  <p className="text-sm text-muted-foreground truncate">{description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default HistoryHub;
