import { useState } from "react";
import type { TimerInterval, TimerSettings } from "@/types/timer.types";
import { DEFAULT_TIMER_SETTINGS } from "@/types/timer.types";

export const useTimerState = () => {
  // Dialog states
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isNewTimerOpen, setIsNewTimerOpen] = useState(false);
  const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
  const [isInterimIntervalOpen, setIsInterimIntervalOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isInterimSoundPickerOpen, setIsInterimSoundPickerOpen] = useState(false);
  const [soundPickerType, setSoundPickerType] = useState<'interval' | 'timer' | 'doublebeep'>('interval');
  const [isLibraryMenuOpen, setIsLibraryMenuOpen] = useState(false);
  const [isFolderSelectionOpen, setIsFolderSelectionOpen] = useState(false);
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const [isEditIntervalOpen, setIsEditIntervalOpen] = useState(false);
  const [isEditIntervalSoundPickerOpen, setIsEditIntervalSoundPickerOpen] = useState(false);

  // Selection states
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTimerIds, setSelectedTimerIds] = useState<string[]>([]);
  const [selectedMoveTimerId, setSelectedMoveTimerId] = useState<string | null>(null);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);

  // Mode states
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isSelectMoveMode, setIsSelectMoveMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedTimerIndex, setDraggedTimerIndex] = useState<number | null>(null);

  // Navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Form states
  const [folderName, setFolderName] = useState("");
  const [timerName, setTimerName] = useState("New Timer");
  const [intervals, setIntervals] = useState<TimerInterval[]>([]);
  const [repeatCount, setRepeatCount] = useState(1);

  // Edit interval states
  const [editingIntervalId, setEditingIntervalId] = useState<string | null>(null);
  const [editIntervalName, setEditIntervalName] = useState("");
  const [editIntervalHours, setEditIntervalHours] = useState("0");
  const [editIntervalMinutes, setEditIntervalMinutes] = useState("0");
  const [editIntervalSeconds, setEditIntervalSeconds] = useState("30");
  const [editIntervalColor, setEditIntervalColor] = useState("#3B82F6");
  const [editIntervalSound, setEditIntervalSound] = useState("beep");
  const [editIntervalReps, setEditIntervalReps] = useState(1);
  const [editIntervalRepBased, setEditIntervalRepBased] = useState(false);

  // New interval states
  const [newIntervalName, setNewIntervalName] = useState("");
  const [newIntervalDuration, setNewIntervalDuration] = useState("");
  const [newIntervalColor, setNewIntervalColor] = useState("#3B82F6");

  // Timer settings
  const [timerSettings, setTimerSettings] = useState<TimerSettings>(DEFAULT_TIMER_SETTINGS);

  // Interim interval inputs
  const [interimHoursInput, setInterimHoursInput] = useState("0");
  const [interimMinsInput, setInterimMinsInput] = useState("0");
  const [interimSecsInput, setInterimSecsInput] = useState("10");
  const [interimRepsInput, setInterimRepsInput] = useState("1");
  const [interimSetsInput, setInterimSetsInput] = useState("1");

  return {
    // Dialog states
    isFolderDialogOpen, setIsFolderDialogOpen,
    isNewTimerOpen, setIsNewTimerOpen,
    isSoundPickerOpen, setIsSoundPickerOpen,
    isInterimIntervalOpen, setIsInterimIntervalOpen,
    isColorPickerOpen, setIsColorPickerOpen,
    isInterimSoundPickerOpen, setIsInterimSoundPickerOpen,
    soundPickerType, setSoundPickerType,
    isLibraryMenuOpen, setIsLibraryMenuOpen,
    isFolderSelectionOpen, setIsFolderSelectionOpen,
    isFolderMenuOpen, setIsFolderMenuOpen,
    isEditIntervalOpen, setIsEditIntervalOpen,
    isEditIntervalSoundPickerOpen, setIsEditIntervalSoundPickerOpen,

    // Selection states
    selectedTimerId, setSelectedTimerId,
    selectedFolderId, setSelectedFolderId,
    selectedTimerIds, setSelectedTimerIds,
    selectedMoveTimerId, setSelectedMoveTimerId,
    deleteFolderId, setDeleteFolderId,

    // Mode states
    isMoveMode, setIsMoveMode,
    isSelectMoveMode, setIsSelectMoveMode,
    isEditMode, setIsEditMode,
    draggedTimerIndex, setDraggedTimerIndex,

    // Navigation
    currentFolderId, setCurrentFolderId,

    // Form states
    folderName, setFolderName,
    timerName, setTimerName,
    intervals, setIntervals,
    repeatCount, setRepeatCount,

    // Edit interval states
    editingIntervalId, setEditingIntervalId,
    editIntervalName, setEditIntervalName,
    editIntervalHours, setEditIntervalHours,
    editIntervalMinutes, setEditIntervalMinutes,
    editIntervalSeconds, setEditIntervalSeconds,
    editIntervalColor, setEditIntervalColor,
    editIntervalSound, setEditIntervalSound,
    editIntervalReps, setEditIntervalReps,
    editIntervalRepBased, setEditIntervalRepBased,

    // New interval states
    newIntervalName, setNewIntervalName,
    newIntervalDuration, setNewIntervalDuration,
    newIntervalColor, setNewIntervalColor,

    // Timer settings
    timerSettings, setTimerSettings,

    // Interim interval inputs
    interimHoursInput, setInterimHoursInput,
    interimMinsInput, setInterimMinsInput,
    interimSecsInput, setInterimSecsInput,
    interimRepsInput, setInterimRepsInput,
    interimSetsInput, setInterimSetsInput,
  };
};
