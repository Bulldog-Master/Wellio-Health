import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { parseWeight } from '@/lib/utils';
import { weightLogSchema, validateAndSanitize } from '@/lib/validation';

export interface WeightLog {
  id: string;
  weight_lbs: number;
  period: string;
  logged_at: string;
}

export const useWeightLogs = (preferredUnit: 'imperial' | 'metric') => {
  const { t } = useTranslation(['weight', 'common']);
  const { toast } = useToast();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);

  const fetchWeightLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: true });

      if (error) throw error;
      setWeightLogs(data || []);
    } catch (error) {
      console.error('Error fetching weight logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTargetWeight = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('target_weight, target_weight_unit')
        .eq('id', user.id)
        .single();

      if (profile?.target_weight) {
        const targetInLbs = profile.target_weight_unit === 'kg' 
          ? profile.target_weight * 2.20462 
          : profile.target_weight;
        setTargetWeight(targetInLbs);
      }
    } catch (error) {
      console.error('Error fetching target weight:', error);
    }
  };

  useEffect(() => {
    fetchWeightLogs();
    fetchTargetWeight();
  }, []);

  const handleLogWeight = async (weight: string, period: "morning" | "evening", selectedDate: Date) => {
    if (!weight) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('weight:auth_required'),
          description: t('weight:auth_required_desc'),
          variant: "destructive",
        });
        return false;
      }

      const weightLbs = parseWeight(weight, preferredUnit);

      const validation = validateAndSanitize(weightLogSchema, {
        weight_lbs: weightLbs,
        period: period,
      });

      if (validation.success === false) {
        toast({
          title: t('weight:validation_error'),
          description: validation.error,
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: user.id,
          weight_lbs: validation.data.weight_lbs,
          period: validation.data.period,
          logged_at: selectedDate.toISOString(),
        });

      if (error) throw error;

      const periodTranslated = period === 'morning' ? t('weight:morning').toLowerCase() : t('weight:evening').toLowerCase();
      toast({
        title: t('weight:weight_logged'),
        description: t('weight:weight_logged_desc', { period: periodTranslated }),
      });

      fetchWeightLogs();
      return true;
    } catch (error) {
      console.error('Error logging weight:', error);
      toast({
        title: t('weight:error'),
        description: t('weight:error_log'),
        variant: "destructive",
      });
      return false;
    }
  };

  const handleEditLog = async (log: WeightLog, newWeight: string) => {
    if (!newWeight) return false;
    
    try {
      const weightLbs = parseWeight(newWeight, preferredUnit);
      
      const { error } = await supabase
        .from('weight_logs')
        .update({ weight_lbs: weightLbs })
        .eq('id', log.id);

      if (error) throw error;

      toast({
        title: t('weight:weight_updated'),
        description: t('weight:weight_updated_desc'),
      });
      
      fetchWeightLogs();
      return true;
    } catch (error) {
      console.error('Error updating weight:', error);
      toast({
        title: t('weight:error'),
        description: t('weight:error_update'),
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: t('weight:weight_deleted'),
        description: t('weight:weight_deleted_desc'),
      });
      
      fetchWeightLogs();
      return true;
    } catch (error) {
      console.error('Error deleting weight:', error);
      toast({
        title: t('weight:error'),
        description: t('weight:error_delete'),
        variant: "destructive",
      });
      return false;
    }
  };

  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight_lbs : 0;

  const statistics = useMemo(() => {
    if (weightLogs.length === 0) return null;

    const firstWeight = weightLogs[0].weight_lbs;
    const lastWeight = weightLogs[weightLogs.length - 1].weight_lbs;
    const totalChange = lastWeight - firstWeight;
    
    const firstDate = new Date(weightLogs[0].logged_at);
    const lastDate = new Date(weightLogs[weightLogs.length - 1].logged_at);
    const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    const avgRatePerWeek = (totalChange / daysDiff) * 7;

    let progressPercentage = 0;
    if (targetWeight && firstWeight !== targetWeight) {
      const totalGoal = targetWeight - firstWeight;
      const achieved = lastWeight - firstWeight;
      progressPercentage = (achieved / totalGoal) * 100;
    }

    return {
      totalChange,
      avgRatePerWeek,
      progressPercentage,
      daysTracked: daysDiff,
    };
  }, [weightLogs, targetWeight]);

  return {
    weightLogs,
    isLoading,
    targetWeight,
    latestWeight,
    statistics,
    handleLogWeight,
    handleEditLog,
    handleDeleteLog,
    refetch: fetchWeightLogs,
  };
};
