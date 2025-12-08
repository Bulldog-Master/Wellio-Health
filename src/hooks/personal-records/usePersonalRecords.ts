import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import { PersonalRecord, PRHistory, PRFormData, defaultFormData } from "@/components/personal-records/types";

export const usePersonalRecords = () => {
  const { toast } = useToast();
  const { t } = useTranslation(['records', 'errors']);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [history, setHistory] = useState<Record<string, PRHistory[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: recordsData, error: recordsError } = await supabase
        .from("personal_records")
        .select("*")
        .eq("user_id", user.id)
        .order("achieved_at", { ascending: false });

      if (recordsError) throw recordsError;
      setRecords(recordsData || []);

      if (recordsData && recordsData.length > 0) {
        const historyMap: Record<string, PRHistory[]> = {};
        
        for (const record of recordsData) {
          const { data: historyData } = await supabase
            .from("pr_history")
            .select("*")
            .eq("pr_id", record.id)
            .order("achieved_at", { ascending: false })
            .limit(5);
          
          if (historyData) {
            historyMap[record.id] = historyData;
          }
        }
        
        setHistory(historyMap);
      }
    } catch (error: any) {
      toast({
        title: t('records:error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRecord = async (formData: PRFormData, editingRecord: PersonalRecord | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in");

      if (!formData.exercise_name || !formData.record_value) {
        toast({
          title: t('records:error'),
          description: t('records:name_value_required'),
          variant: "destructive",
        });
        return false;
      }

      const recordValue = parseFloat(formData.record_value);

      if (editingRecord) {
        const previousValue = editingRecord.record_value;
        
        if (recordValue > previousValue) {
          const improvement = ((recordValue - previousValue) / previousValue) * 100;
          
          await supabase.from("pr_history").insert({
            user_id: user.id,
            pr_id: editingRecord.id,
            previous_value: previousValue,
            new_value: recordValue,
            improvement_percentage: improvement,
          });

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        const { error } = await supabase
          .from("personal_records")
          .update({
            exercise_name: formData.exercise_name,
            exercise_category: formData.exercise_category,
            record_type: formData.record_type,
            record_value: recordValue,
            record_unit: formData.record_unit,
            notes: formData.notes || null,
            achieved_at: formData.achieved_at,
          })
          .eq("id", editingRecord.id);

        if (error) throw error;

        toast({
          title: recordValue > previousValue ? t('records:new_pr') : t('records:record_updated'),
          description: recordValue > previousValue 
            ? t('records:improvement_message', { percent: ((recordValue - previousValue) / previousValue * 100).toFixed(1) })
            : t('records:record_updated_message'),
        });
      } else {
        const { error } = await supabase
          .from("personal_records")
          .insert({
            user_id: user.id,
            exercise_name: formData.exercise_name,
            exercise_category: formData.exercise_category,
            record_type: formData.record_type,
            record_value: recordValue,
            record_unit: formData.record_unit,
            notes: formData.notes || null,
            achieved_at: formData.achieved_at,
          });

        if (error) throw error;

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast({
          title: t('records:new_pr'),
          description: t('records:keep_crushing'),
        });
      }

      return true;
    } catch (error: any) {
      toast({
        title: t('records:error'),
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from("personal_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: t('records:deleted'),
        description: t('records:record_removed'),
      });
    } catch (error: any) {
      toast({
        title: t('records:error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel('pr_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_records'
        },
        () => fetchRecords()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    records,
    history,
    loading,
    saveRecord,
    deleteRecord,
    fetchRecords
  };
};
