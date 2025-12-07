import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface WearableData {
  id: string;
  device_name: string;
  steps: number | null;
  calories_burned: number | null;
  heart_rate: number | null;
  sleep_hours: number | null;
  data_date: string;
}

export interface WearableFormState {
  deviceName: string;
  customDevice: string;
  steps: string;
  caloriesBurned: string;
  heartRate: string;
  sleepHours: string;
  dataDate: string;
}

const initialFormState: WearableFormState = {
  deviceName: "fitbit",
  customDevice: "",
  steps: "",
  caloriesBurned: "",
  heartRate: "",
  sleepHours: "",
  dataDate: format(new Date(), 'yyyy-MM-dd'),
};

export const useWearableForm = () => {
  const { t } = useTranslation('fitness');
  const { t: tCommon } = useTranslation('common');
  const { toast } = useToast();
  const [wearableData, setWearableData] = useState<WearableData[]>([]);
  const [wearableForm, setWearableForm] = useState<WearableFormState>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  const commonDevices = [
    { value: "fitbit", label: "Fitbit" },
    { value: "apple_watch", label: "Apple Watch" },
    { value: "garmin", label: "Garmin" },
    { value: "samsung_health", label: "Samsung Health" },
    { value: "suunto", label: "Suunto" },
    { value: "whoop", label: "Whoop" },
    { value: "oura", label: "Oura Ring" },
    { value: "custom", label: t('custom_device') },
  ];

  const fetchWearableData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

      const { data, error } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_date', format(sevenDaysAgo, 'yyyy-MM-dd'))
        .order('data_date', { ascending: false });

      if (error) throw error;
      setWearableData(data || []);
    } catch (error) {
      console.error('Error fetching wearable data:', error);
    }
  };

  useEffect(() => {
    fetchWearableData();
  }, []);

  const handleSaveWearableData = async () => {
    if (!wearableForm.steps && !wearableForm.caloriesBurned && !wearableForm.heartRate && !wearableForm.sleepHours) {
      toast({
        title: t('no_data_entered'),
        description: t('enter_at_least_one_metric'),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('authentication_required'),
          description: t('login_to_save'),
          variant: "destructive",
        });
        return;
      }

      const deviceName = wearableForm.deviceName === "custom" 
        ? wearableForm.customDevice 
        : commonDevices.find(d => d.value === wearableForm.deviceName)?.label || wearableForm.deviceName;

      const { error } = await supabase
        .from('wearable_data')
        .insert({
          user_id: user.id,
          device_name: deviceName,
          steps: wearableForm.steps ? parseInt(wearableForm.steps) : null,
          calories_burned: wearableForm.caloriesBurned ? parseInt(wearableForm.caloriesBurned) : null,
          heart_rate: wearableForm.heartRate ? parseInt(wearableForm.heartRate) : null,
          sleep_hours: wearableForm.sleepHours ? parseFloat(wearableForm.sleepHours) : null,
          data_date: wearableForm.dataDate,
        });

      if (error) throw error;

      toast({
        title: t('data_saved'),
        description: t('wearable_data_logged'),
      });

      setWearableForm(initialFormState);
      fetchWearableData();
    } catch (error) {
      console.error('Error saving wearable data:', error);
      toast({
        title: tCommon('error'),
        description: t('failed_to_save_wearable'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    wearableData,
    wearableForm,
    setWearableForm,
    isSaving,
    commonDevices,
    handleSaveWearableData,
    refetch: fetchWearableData,
  };
};
