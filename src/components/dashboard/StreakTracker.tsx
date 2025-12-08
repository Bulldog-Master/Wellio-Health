import { Card } from "@/components/ui/card";
import { Flame, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, format, subDays } from "date-fns";
import { useTranslation } from "react-i18next";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
}

export const StreakTracker = () => {
  const { t } = useTranslation('common');
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoggedDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStreak();
  }, []);

  const calculateStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all weight logs ordered by date
      const { data: logs } = await supabase
        .from('weight_logs')
        .select('logged_at')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false });

      if (!logs || logs.length === 0) {
        setLoading(false);
        return;
      }

      // Get unique dates (ignore multiple logs per day)
      const uniqueDates = [...new Set(logs.map(log => 
        format(new Date(log.logged_at), 'yyyy-MM-dd')
      ))].sort().reverse();

      // Calculate current streak
      let currentStreak = 0;
      const today = format(new Date(), 'yyyy-MM-dd');
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
      
      // Check if logged today or yesterday
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i]);
          const previousDate = new Date(uniqueDates[i - 1]);
          const daysDiff = differenceInDays(previousDate, currentDate);
          
          if (daysDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const previousDate = new Date(uniqueDates[i - 1]);
        const daysDiff = differenceInDays(previousDate, currentDate);
        
        if (daysDiff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

      setStreak({
        currentStreak,
        longestStreak,
        lastLoggedDate: logs[0].logged_at,
      });
    } catch (error) {
      console.error('Error calculating streak:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card shadow-md border-2 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold">{t('streak_tracker')}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-destructive/10 rounded-lg">
            <div className="flex justify-center mb-2">
              <Flame className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-destructive">{streak.currentStreak}</p>
            <p className="text-sm text-muted-foreground">{t('day_streak')}</p>
          </div>

          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="flex justify-center mb-2">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">{streak.longestStreak}</p>
            <p className="text-sm text-muted-foreground">{t('best_streak')}</p>
          </div>
        </div>

        {streak.lastLoggedDate && (
          <p className="text-xs text-center text-muted-foreground">
            {t('last_logged')}: {format(new Date(streak.lastLoggedDate), "MMM d, yyyy")}
          </p>
        )}

        {streak.currentStreak === 0 && (
          <p className="text-sm text-center text-muted-foreground italic">
            {t('log_weight_start_streak')}
          </p>
        )}

        {streak.currentStreak >= 7 && (
          <p className="text-sm text-center font-semibold text-primary animate-pulse">
            🎉 {t('amazing_streak', { days: streak.currentStreak })}
          </p>
        )}
      </div>
    </Card>
  );
};