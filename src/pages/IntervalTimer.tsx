import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Hooks
import { useTimerState } from "@/hooks/timer/useTimerState";
import { useTimerQueries } from "@/hooks/timer/useTimerQueries";
import { useTimerPlayback } from "@/hooks/timer/useTimerPlayback";

// Components
import { TimerHeader, TimerContent, TimerPlaybackView, LibraryMenuSheet, FolderMenuSheet } from "@/components/timer";
import { 
  ColorPickerDialog, 
  CreateFolderDialog, 
  DeleteFolderDialog, 
  FolderSelectionDialog, 
  SoundPickerDialog,
  InterimIntervalDialog,
  NewTimerDialog,
  EditIntervalDialog,
} from "@/components/timer/dialogs";

// Types
import type { TimerInterval, IntervalTimerData } from "@/types/timer.types";

const IntervalTimer = () => {
  const { t } = useTranslation(['timer']);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use extracted state hook
  const state = useTimerState();
  
  // Local view state
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const [isPlaybackView, setIsPlaybackView] = useState(false);

  // Use extracted queries hook
  const {
    timers,
    folders,
    moveTimersMutation,
    saveTimerMutation,
    deleteTimerMutation,
    deleteFolderMutation,
  } = useTimerQueries({
    currentFolderId: state.currentFolderId,
    selectedTimerIds: state.selectedTimerIds,
    setSelectedTimerIds: state.setSelectedTimerIds,
    setIsSelectMoveMode: state.setIsSelectMoveMode,
    setIsFolderSelectionOpen: state.setIsFolderSelectionOpen,
    setDeleteFolderId: state.setDeleteFolderId,
    timerName: state.timerName,
    intervals: state.intervals,
    repeatCount: state.repeatCount,
    timerSettings: state.timerSettings,
    setTimerName: state.setTimerName,
    setIntervals: state.setIntervals,
    setRepeatCount: state.setRepeatCount,
    setTimerSettings: state.setTimerSettings,
    setIsNewTimerOpen: state.setIsNewTimerOpen,
    setInterimHoursInput: state.setInterimHoursInput,
    setInterimMinsInput: state.setInterimMinsInput,
    setInterimSecsInput: state.setInterimSecsInput,
    setInterimRepsInput: state.setInterimRepsInput,
    setInterimSetsInput: state.setInterimSetsInput,
  });

  // Use extracted playback hook
  const playback = useTimerPlayback({
    intervals: state.intervals,
    repeatCount: state.repeatCount,
    timerSettings: state.timerSettings,
  });

  // Event handlers
  const handleTimerSelect = (timer: IntervalTimerData) => {
    state.setTimerName(timer.name);
    setSelectedTimerId(timer.id);
    const timerIntervals = (timer.intervals || []) as TimerInterval[];
    state.setIntervals(timerIntervals);
    state.setRepeatCount(timer.repeat_count || 1);
    playback.selectTimer(timerIntervals);
    setIsPlaybackView(true);
  };

  const handleEditInterval = (interval: TimerInterval) => {
    state.setEditingIntervalId(interval.id);
    state.setEditIntervalName(interval.name);
    const totalSeconds = interval.duration;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    state.setEditIntervalHours(hours.toString());
    state.setEditIntervalMinutes(minutes.toString());
    state.setEditIntervalSeconds(seconds.toString());
    state.setEditIntervalColor(interval.color || "#3B82F6");
    state.setEditIntervalSound(interval.sound || "beep");
    state.setEditIntervalReps(interval.reps || 1);
    state.setEditIntervalRepBased(interval.repBased || false);
    state.setIsEditIntervalOpen(true);
  };

  const handleCreateFolder = async () => {
    if (!state.folderName.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("timer_folders")
        .insert([{ name: state.folderName, user_id: user.id }]);
      if (error) throw error;
      toast({ title: t('toast_success'), description: t('toast_folder_created') });
      state.setFolderName("");
      state.setIsFolderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["timer-folders"] });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({ title: t('toast_error'), description: t('toast_folder_create_failed'), variant: "destructive" });
    }
  };

  const handleTimerCheckToggle = (timerId: string) => {
    if (state.selectedTimerIds.includes(timerId)) {
      state.setSelectedTimerIds(state.selectedTimerIds.filter(id => id !== timerId));
    } else {
      state.setSelectedTimerIds([...state.selectedTimerIds, timerId]);
    }
  };

  const handleSoundSelect = (soundId: string) => {
    playback.playSound(soundId);
    if (state.soundPickerType === 'interval') {
      state.setTimerSettings({ ...state.timerSettings, intervalCompleteSound: soundId });
    } else if (state.soundPickerType === 'timer') {
      state.setTimerSettings({ ...state.timerSettings, timerCompleteSound: soundId });
    } else if (state.soundPickerType === 'doublebeep') {
      state.setTimerSettings({ ...state.timerSettings, doubleBeepSound: soundId });
    }
    state.setIsSoundPickerOpen(false);
  };

  const handleInterimColorSelect = (colorId: string) => {
    state.setTimerSettings({ ...state.timerSettings, interimColor: colorId });
    state.setIsColorPickerOpen(false);
  };

  const handleInterimSoundSelect = (soundId: string) => {
    playback.playSound(soundId);
    state.setTimerSettings({ ...state.timerSettings, interimSound: soundId });
    state.setIsInterimSoundPickerOpen(false);
  };

  // If in playback view, show that instead
  if (isPlaybackView && state.intervals.length > 0) {
    return (
      <TimerPlaybackView
        timerName={state.timerName}
        intervals={state.intervals}
        currentIntervalIndex={playback.currentIntervalIndex}
        remainingSeconds={playback.remainingSeconds}
        isRunning={playback.isRunning}
        currentRepeat={playback.currentRepeat}
        repeatCount={state.repeatCount}
        isSessionComplete={playback.isSessionComplete}
        timerSettings={state.timerSettings}
        onBack={() => {
          setIsPlaybackView(false);
          playback.resetPlayback();
        }}
        onPrevious={playback.handlePreviousInterval}
        onNext={playback.handleNextInterval}
        onTogglePlayPause={() => playback.setIsRunning(!playback.isRunning)}
        onReset={playback.resetPlayback}
        formatTime={playback.formatTime}
        calculateTotalRemainingTime={playback.calculateTotalRemainingTime}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <TimerHeader
        currentFolderId={state.currentFolderId}
        setCurrentFolderId={state.setCurrentFolderId}
        isSelectMoveMode={state.isSelectMoveMode}
        selectedTimerIds={state.selectedTimerIds}
        onCancelSelectMove={() => {
          state.setIsSelectMoveMode(false);
          state.setSelectedTimerIds([]);
        }}
        onMoveSelected={() => state.setIsFolderSelectionOpen(true)}
        onOpenNewTimer={() => state.setIsNewTimerOpen(true)}
        onOpenNewFolder={() => state.setIsFolderDialogOpen(true)}
        onOpenLibraryMenu={() => state.setIsLibraryMenuOpen(true)}
      />

      {/* Content */}
      <TimerContent
        currentFolderId={state.currentFolderId}
        folders={folders}
        timers={timers}
        isSelectMoveMode={state.isSelectMoveMode}
        isMoveMode={state.isMoveMode}
        selectedTimerIds={state.selectedTimerIds}
        selectedMoveTimerId={state.selectedMoveTimerId}
        draggedTimerIndex={state.draggedTimerIndex}
        onFolderClick={(folderId) => state.setCurrentFolderId(folderId)}
        onFolderMenuClick={(folderId) => {
          state.setSelectedFolderId(folderId);
          state.setIsFolderMenuOpen(true);
        }}
        onTimerSelect={handleTimerSelect}
        onTimerCheckToggle={handleTimerCheckToggle}
        onMoveTimerSelect={(timerId) => state.setSelectedMoveTimerId(timerId)}
        onDragStart={(index, timerId, e) => {
          if (state.selectedMoveTimerId === timerId) {
            state.setDraggedTimerIndex(index);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", timerId);
          }
        }}
        onDragOver={(index, e) => {
          if (state.selectedMoveTimerId && state.draggedTimerIndex !== null && state.draggedTimerIndex !== index) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }
        }}
        onDrop={(index, e) => {
          if (state.selectedMoveTimerId && state.draggedTimerIndex !== null && state.draggedTimerIndex !== index) {
            e.preventDefault();
            const newTimers = [...timers];
            const [draggedTimer] = newTimers.splice(state.draggedTimerIndex, 1);
            newTimers.splice(index, 0, draggedTimer);
            queryClient.setQueryData(["interval-timers", state.currentFolderId], newTimers);
            state.setDraggedTimerIndex(null);
            toast({ title: t('reordered'), description: t('timer_position_updated') });
          }
        }}
        onDragEnd={() => state.setDraggedTimerIndex(null)}
      />

      {/* Dialogs */}
      <NewTimerDialog
        open={state.isNewTimerOpen}
        onOpenChange={state.setIsNewTimerOpen}
        timerName={state.timerName}
        setTimerName={state.setTimerName}
        intervals={state.intervals}
        setIntervals={state.setIntervals}
        repeatCount={state.repeatCount}
        setRepeatCount={state.setRepeatCount}
        timerSettings={state.timerSettings}
        setTimerSettings={state.setTimerSettings}
        onSave={() => saveTimerMutation.mutate()}
        onOpenInterimInterval={() => state.setIsInterimIntervalOpen(true)}
        onOpenSoundPicker={(type) => {
          state.setSoundPickerType(type);
          state.setIsSoundPickerOpen(true);
        }}
        onEditInterval={handleEditInterval}
        isSaving={saveTimerMutation.isPending}
      />

      <EditIntervalDialog
        open={state.isEditIntervalOpen}
        onOpenChange={state.setIsEditIntervalOpen}
        editingIntervalId={state.editingIntervalId}
        editIntervalName={state.editIntervalName}
        setEditIntervalName={state.setEditIntervalName}
        editIntervalHours={state.editIntervalHours}
        setEditIntervalHours={state.setEditIntervalHours}
        editIntervalMinutes={state.editIntervalMinutes}
        setEditIntervalMinutes={state.setEditIntervalMinutes}
        editIntervalSeconds={state.editIntervalSeconds}
        setEditIntervalSeconds={state.setEditIntervalSeconds}
        editIntervalColor={state.editIntervalColor}
        setEditIntervalColor={state.setEditIntervalColor}
        editIntervalSound={state.editIntervalSound}
        setEditIntervalSound={state.setEditIntervalSound}
        editIntervalReps={state.editIntervalReps}
        setEditIntervalReps={state.setEditIntervalReps}
        editIntervalRepBased={state.editIntervalRepBased}
        setEditIntervalRepBased={state.setEditIntervalRepBased}
        intervals={state.intervals}
        setIntervals={state.setIntervals}
        onOpenSoundPicker={() => state.setIsEditIntervalSoundPickerOpen(true)}
      />

      <InterimIntervalDialog
        open={state.isInterimIntervalOpen}
        onOpenChange={state.setIsInterimIntervalOpen}
        timerSettings={state.timerSettings}
        setTimerSettings={state.setTimerSettings}
        interimHoursInput={state.interimHoursInput}
        setInterimHoursInput={state.setInterimHoursInput}
        interimMinsInput={state.interimMinsInput}
        setInterimMinsInput={state.setInterimMinsInput}
        interimSecsInput={state.interimSecsInput}
        setInterimSecsInput={state.setInterimSecsInput}
        interimRepsInput={state.interimRepsInput}
        setInterimRepsInput={state.setInterimRepsInput}
        interimSetsInput={state.interimSetsInput}
        setInterimSetsInput={state.setInterimSetsInput}
        onOpenColorPicker={() => state.setIsColorPickerOpen(true)}
        onOpenSoundPicker={() => state.setIsInterimSoundPickerOpen(true)}
      />

      <SoundPickerDialog
        open={state.isSoundPickerOpen}
        onOpenChange={state.setIsSoundPickerOpen}
        currentSound={
          state.soundPickerType === 'interval' 
            ? state.timerSettings.intervalCompleteSound 
            : state.soundPickerType === 'timer'
              ? state.timerSettings.timerCompleteSound
              : state.timerSettings.doubleBeepSound
        }
        onSoundSelect={handleSoundSelect}
        playSound={playback.playSound}
      />

      <ColorPickerDialog
        open={state.isColorPickerOpen}
        onOpenChange={state.setIsColorPickerOpen}
        currentColor={state.timerSettings.interimColor}
        onColorSelect={handleInterimColorSelect}
      />

      <CreateFolderDialog
        open={state.isFolderDialogOpen}
        onOpenChange={state.setIsFolderDialogOpen}
        folderName={state.folderName}
        setFolderName={state.setFolderName}
        onCreateFolder={handleCreateFolder}
      />

      <FolderSelectionDialog
        open={state.isFolderSelectionOpen}
        onOpenChange={state.setIsFolderSelectionOpen}
        folders={folders}
        onSelectFolder={(folderId) => moveTimersMutation.mutate(folderId)}
        isPending={moveTimersMutation.isPending}
      />

      <DeleteFolderDialog
        open={state.deleteFolderId !== null}
        onOpenChange={(open) => !open && state.setDeleteFolderId(null)}
        onConfirmDelete={() => {
          if (state.deleteFolderId) {
            deleteFolderMutation.mutate(state.deleteFolderId);
          }
        }}
      />

      {/* Sheets */}
      <LibraryMenuSheet
        open={state.isLibraryMenuOpen}
        onOpenChange={state.setIsLibraryMenuOpen}
        onMove={() => {
          state.setIsLibraryMenuOpen(false);
          state.setIsMoveMode(true);
        }}
        onMoveToFolder={() => {
          state.setIsLibraryMenuOpen(false);
          state.setIsSelectMoveMode(true);
        }}
        onEdit={() => {
          state.setIsLibraryMenuOpen(false);
          state.setIsEditMode(true);
        }}
      />

      <FolderMenuSheet
        open={state.isFolderMenuOpen}
        onOpenChange={state.setIsFolderMenuOpen}
        onDeleteFolder={() => {
          state.setIsFolderMenuOpen(false);
          if (state.selectedFolderId) {
            state.setDeleteFolderId(state.selectedFolderId);
          }
        }}
      />
    </div>
  );
};

export default IntervalTimer;