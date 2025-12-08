import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import type { TimerInterval, TimerSettings } from "@/types/timer.types";
import { DEFAULT_TIMER_SETTINGS } from "@/types/timer.types";
import type { Json } from "@/integrations/supabase/types";

interface UseTimerQueriesProps {
  currentFolderId: string | null;
  selectedTimerIds: string[];
  setSelectedTimerIds: (ids: string[]) => void;
  setIsSelectMoveMode: (mode: boolean) => void;
  setIsFolderSelectionOpen: (open: boolean) => void;
  setDeleteFolderId: (id: string | null) => void;
  timerName: string;
  intervals: TimerInterval[];
  repeatCount: number;
  timerSettings: TimerSettings;
  setTimerName: (name: string) => void;
  setIntervals: (intervals: TimerInterval[]) => void;
  setRepeatCount: (count: number) => void;
  setTimerSettings: (settings: TimerSettings) => void;
  setIsNewTimerOpen: (open: boolean) => void;
  setInterimHoursInput: (val: string) => void;
  setInterimMinsInput: (val: string) => void;
  setInterimSecsInput: (val: string) => void;
  setInterimRepsInput: (val: string) => void;
  setInterimSetsInput: (val: string) => void;
}

export const useTimerQueries = ({
  currentFolderId,
  selectedTimerIds,
  setSelectedTimerIds,
  setIsSelectMoveMode,
  setIsFolderSelectionOpen,
  setDeleteFolderId,
  timerName,
  intervals,
  repeatCount,
  timerSettings,
  setTimerName,
  setIntervals,
  setRepeatCount,
  setTimerSettings,
  setIsNewTimerOpen,
  setInterimHoursInput,
  setInterimMinsInput,
  setInterimSecsInput,
  setInterimRepsInput,
  setInterimSetsInput,
}: UseTimerQueriesProps) => {
  const { t } = useTranslation(['timer']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timers = [] } = useQuery({
    queryKey: ["interval-timers", currentFolderId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("interval_timers")
        .select("*")
        .eq("user_id", user.id);

      if (currentFolderId) {
        query = query.eq("folder_id", currentFolderId);
      } else {
        query = query.is("folder_id", null);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: folders = [] } = useQuery({
    queryKey: ["timer-folders"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("timer_folders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const moveTimersMutation = useMutation({
    mutationFn: async (folderId: string | null) => {
      const { error } = await supabase
        .from("interval_timers")
        .update({ folder_id: folderId })
        .in("id", selectedTimerIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interval-timers"] });
      toast({
        title: t('toast_success'),
        description: t('toast_timers_moved', { count: selectedTimerIds.length }),
      });
      setSelectedTimerIds([]);
      setIsSelectMoveMode(false);
      setIsFolderSelectionOpen(false);
    },
    onError: (error) => {
      toast({
        title: t('toast_error'),
        description: t('toast_move_failed'),
        variant: "destructive",
      });
      console.error("Error moving timers:", error);
    },
  });

  const saveTimerMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("interval_timers")
        .insert({
          name: timerName,
          user_id: user.id,
          text_to_speech: timerSettings.textToSpeech,
          countdown_beeps: timerSettings.countdownBeeps,
          use_for_notifications: timerSettings.useForNotifications,
          use_interim_interval: timerSettings.useInterimInterval,
          interim_interval_seconds: timerSettings.interimIntervalSeconds,
          end_with_interim: timerSettings.endWithInterval,
          show_line_numbers: timerSettings.showLineNumbers,
          show_elapsed_time: timerSettings.showElapsedTime,
          include_reps: timerSettings.isRepBased,
          include_sets: false,
          intervals: intervals as unknown as Json,
          repeat_count: repeatCount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interval-timers"] });
      toast({
        title: t('toast_timer_saved'),
        description: t('toast_timer_saved_desc', { name: timerName }),
      });
      setIsNewTimerOpen(false);
      resetTimerForm();
    },
    onError: (error) => {
      toast({
        title: t('toast_error'),
        description: t('toast_save_failed'),
        variant: "destructive",
      });
      console.error("Error saving timer:", error);
    },
  });

  const deleteTimerMutation = useMutation({
    mutationFn: async (timerId: string) => {
      const { error } = await supabase
        .from("interval_timers")
        .delete()
        .eq("id", timerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interval-timers"] });
      toast({
        title: t('toast_timer_deleted'),
        description: t('toast_timer_deleted_desc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('toast_error'),
        description: t('toast_delete_failed'),
        variant: "destructive",
      });
      console.error("Error deleting timer:", error);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      const { error: timersError } = await supabase
        .from("interval_timers")
        .delete()
        .eq("folder_id", folderId);

      if (timersError) throw timersError;

      const { error: folderError } = await supabase
        .from("timer_folders")
        .delete()
        .eq("id", folderId);

      if (folderError) throw folderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interval-timers"] });
      queryClient.invalidateQueries({ queryKey: ["timer-folders"] });
      toast({
        title: t('toast_folder_deleted'),
        description: t('toast_folder_deleted_desc'),
      });
      setDeleteFolderId(null);
    },
    onError: (error) => {
      toast({
        title: t('toast_error'),
        description: t('toast_folder_delete_failed'),
        variant: "destructive",
      });
      console.error("Error deleting folder:", error);
      setDeleteFolderId(null);
    },
  });

  const resetTimerForm = () => {
    setTimerName("New Timer");
    setIntervals([]);
    setRepeatCount(1);
    setTimerSettings(DEFAULT_TIMER_SETTINGS);
    setInterimHoursInput("0");
    setInterimMinsInput("0");
    setInterimSecsInput("10");
    setInterimRepsInput("1");
    setInterimSetsInput("1");
  };

  return {
    timers,
    folders,
    moveTimersMutation,
    saveTimerMutation,
    deleteTimerMutation,
    deleteFolderMutation,
    resetTimerForm,
  };
};
