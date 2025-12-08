import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WeeklyReport {
  period: {
    start: string;
    end: string;
  };
  workouts: {
    total: number;
    totalMinutes: number;
    caloriesBurned: number;
    types: string[];
    avgPerDay: number;
  };
  nutrition: {
    mealsLogged: number;
    avgDailyCalories: number;
    avgDailyProtein: number;
  };
  activity: {
    totalSteps: number;
    avgDailySteps: number;
  };
  sleep: {
    avgHours: number | null;
  };
  bodyProgress: {
    weightChange: number | null;
  };
  highlights: string[];
}

export const useWeeklyReport = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['fitness', 'common']);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('common:authentication_required'));
        navigate('/auth');
        return;
      }

      const response = await supabase.functions.invoke('weekly-progress-report', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error(t('fitness:failed_to_load_report'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return { report, isLoading, fetchReport };
};
