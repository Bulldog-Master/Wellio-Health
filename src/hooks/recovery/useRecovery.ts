import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { RecoverySession, RecoveryFormData, defaultFormData, therapies } from '@/components/recovery/types';

export const useRecovery = () => {
  const { t } = useTranslation(['recovery', 'common']);
  const [sessions, setSessions] = useState<RecoverySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<RecoveryFormData>(defaultFormData);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('recovery_sessions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions((data as unknown as RecoverySession[]) || []);
    } catch (error) {
      console.error('Error fetching recovery sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogSession = async () => {
    if (!formData.selectedTherapy || !formData.duration) {
      toast.error(t('common:validation_error'));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('recovery_sessions' as any)
        .insert({
          user_id: user.id,
          therapy_type: formData.selectedTherapy,
          duration_minutes: parseInt(formData.duration),
          intensity: formData.intensity,
          temperature: formData.temperature || null,
          location: formData.location || null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast.success(t('session_logged'), { description: t('session_logged_desc') });
      setDialogOpen(false);
      resetForm();
      fetchSessions();
    } catch (error) {
      console.error('Error logging session:', error);
      toast.error(t('common:error'));
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
  };

  const getTherapyInfo = (therapyId: string) => {
    return therapies.find(t => t.id === therapyId);
  };

  const getTherapyName = (therapyId: string) => {
    const therapy = getTherapyInfo(therapyId);
    return therapy ? t(therapy.nameKey) : therapyId;
  };

  // Calculate stats
  const thisWeekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.session_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  return {
    sessions,
    isLoading,
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleLogSession,
    getTherapyInfo,
    getTherapyName,
    thisWeekSessions,
    totalMinutes,
  };
};
