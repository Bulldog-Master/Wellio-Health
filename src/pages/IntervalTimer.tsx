import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Timer, FolderPlus, MoreHorizontal, ArrowLeft, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Clock, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface IntervalTimer {
  id: string;
  name: string;
  user_id: string;
  intervals: any;
  created_at?: string;
}

const IntervalTimer = () => {
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isNewTimerOpen, setIsNewTimerOpen] = useState(false);
  const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
  const [isInterimIntervalOpen, setIsInterimIntervalOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isInterimSoundPickerOpen, setIsInterimSoundPickerOpen] = useState(false);
  const [soundPickerType, setSoundPickerType] = useState<'interval' | 'timer' | 'doublebeep'>('interval');
  const [selectedTimerId, setSelectedTimerId] = useState<string | null>(null);
  const [isLibraryMenuOpen, setIsLibraryMenuOpen] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [selectedMoveTimerId, setSelectedMoveTimerId] = useState<string | null>(null);
  const [isSelectMoveMode, setIsSelectMoveMode] = useState(false);
  const [selectedTimerIds, setSelectedTimerIds] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedTimerIndex, setDraggedTimerIndex] = useState<number | null>(null);
  const [isFolderSelectionOpen, setIsFolderSelectionOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [timerName, setTimerName] = useState("New Timer");
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [intervals, setIntervals] = useState<any[]>([]);
  const [isEditIntervalOpen, setIsEditIntervalOpen] = useState(false);
  const [editingIntervalId, setEditingIntervalId] = useState<string | null>(null);
  const [editIntervalName, setEditIntervalName] = useState("");
  const [editIntervalHours, setEditIntervalHours] = useState("0");
  const [editIntervalMinutes, setEditIntervalMinutes] = useState("0");
  const [editIntervalSeconds, setEditIntervalSeconds] = useState("30");
  const [editIntervalColor, setEditIntervalColor] = useState("#3B82F6");
  const [editIntervalSound, setEditIntervalSound] = useState("beep");
  const [editIntervalReps, setEditIntervalReps] = useState(1);
  const [editIntervalRepBased, setEditIntervalRepBased] = useState(false);
  const [isEditIntervalSoundPickerOpen, setIsEditIntervalSoundPickerOpen] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [newIntervalName, setNewIntervalName] = useState("");
  const [newIntervalDuration, setNewIntervalDuration] = useState("");
  const [newIntervalColor, setNewIntervalColor] = useState("#3B82F6");
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    intervalCompleteSound: "beep",
    timerCompleteSound: "beep",
    timerCompleteRepeat: false,
    doubleBeepSound: "doublebeep",
    textToSpeech: false,
    includeSets: false,
    includeReps: false,
    useForNotifications: false,
    countdownBeeps: false,
    useInterimInterval: false,
    interimIntervalSeconds: 10,
    interimRepetitions: 1,
    interimSets: 1,
    interimColor: "none",
    interimSound: "beep",
    endWithInterval: false,
    showLineNumbers: false,
    showElapsedTime: false,
    isRepBased: false,
  });
  const [interimHoursInput, setInterimHoursInput] = useState("0");
  const [interimMinsInput, setInterimMinsInput] = useState("0");
  const [interimSecsInput, setInterimSecsInput] = useState("10");
  const [interimRepsInput, setInterimRepsInput] = useState("1");
  const [interimSetsInput, setInterimSetsInput] = useState("1");
  const { toast } = useToast();
  const navigate = useNavigate();
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
      console.log("Moving timers:", selectedTimerIds, "to folder:", folderId);
      const { error } = await supabase
        .from("interval_timers")
        .update({ folder_id: folderId })
        .in("id", selectedTimerIds);

      if (error) {
        console.error("Move error:", error);
        throw error;
      }
      console.log("Move successful");
    },
    onSuccess: () => {
      // Invalidate all timer queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["interval-timers"] });
      toast({
        title: "Success",
        description: `Moved ${selectedTimerIds.length} timer(s)`,
      });
      setSelectedTimerIds([]);
      setIsSelectMoveMode(false);
      setIsFolderSelectionOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to move timers. Please try again.",
        variant: "destructive",
      });
      console.error("Error moving timers:", error);
    },
  });

  const saveTimerMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Saving timer with intervals:", intervals);
      console.log("Repeat count:", repeatCount);

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
          intervals: intervals,
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
        title: "Timer saved",
        description: `"${timerName}" has been saved to your library.`,
      });
      setIsNewTimerOpen(false);
      // Reset form
      setTimerName("New Timer");
      setIntervals([]);
      setRepeatCount(1);
      setTimerSettings({
        intervalCompleteSound: "beep",
        timerCompleteSound: "beep",
        timerCompleteRepeat: false,
        doubleBeepSound: "doublebeep",
        textToSpeech: false,
        includeSets: false,
        includeReps: false,
        useForNotifications: false,
        countdownBeeps: false,
        useInterimInterval: false,
        interimIntervalSeconds: 10,
        interimRepetitions: 1,
        interimSets: 1,
        interimColor: "none",
        interimSound: "beep",
        endWithInterval: false,
        showLineNumbers: false,
        showElapsedTime: false,
        isRepBased: false,
      });
      setInterimHoursInput("0");
      setInterimMinsInput("0");
      setInterimSecsInput("10");
      setInterimRepsInput("1");
      setInterimSetsInput("1");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save timer. Please try again.",
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
        title: "Timer deleted",
        description: "Timer has been removed from your library.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete timer. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting timer:", error);
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (folderId: string) => {
      // First delete all timers in the folder
      const { error: timersError } = await supabase
        .from("interval_timers")
        .delete()
        .eq("folder_id", folderId);

      if (timersError) throw timersError;

      // Then delete the folder
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
        title: "Folder deleted",
        description: "Folder and all its contents have been removed.",
      });
      setDeleteFolderId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete folder. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting folder:", error);
      setDeleteFolderId(null);
    },
  });

  const soundOptions = [
    { id: 'none', name: 'No sound' },
    { id: 'beep', name: 'Beep' },
    { id: 'doublebeep', name: 'Double beep' },
    { id: 'triplet', name: 'Triplet' },
    { id: 'om', name: 'Om' },
    { id: 'alert', name: 'Alert' },
    { id: 'pipes', name: 'Pipes' },
    { id: 'pluck', name: 'Pluck' },
    { id: 'flourish', name: 'Flourish' },
    { id: 'sonar', name: 'Sonar' },
    { id: 'chime', name: 'Chime' },
    { id: 'bell', name: 'Bell' },
    { id: 'gong', name: 'Gong' },
    { id: 'singingbowl', name: 'Singing bowl' },
    { id: 'meditationbowl', name: 'Meditation bowl' },
    { id: 'meditationtriplet', name: 'Meditation triplet' },
  ];

  const colorOptions = [
    { id: 'none', name: 'None', hex: null },
    { id: 'red', name: 'Red', hex: '#ef4444' },
    { id: 'orange', name: 'Orange', hex: '#f97316' },
    { id: 'yellow', name: 'Yellow', hex: '#eab308' },
    { id: 'green', name: 'Green', hex: '#22c55e' },
    { id: 'blue', name: 'Blue', hex: '#3b82f6' },
    { id: 'purple', name: 'Purple', hex: '#a855f7' },
    { id: 'brown', name: 'Brown', hex: '#92400e' },
  ];

  const handleAddInterval = () => {
    if (!newIntervalName || !newIntervalDuration) {
      toast({
        title: "Error",
        description: "Please enter both name and duration for the interval",
        variant: "destructive",
      });
      return;
    }

    const newInterval = {
      id: Date.now().toString(),
      name: newIntervalName,
      duration: parseInt(newIntervalDuration),
      color: newIntervalColor,
    };

    setIntervals([...intervals, newInterval]);
    setNewIntervalName("");
    setNewIntervalDuration("");
    setNewIntervalColor("#3B82F6");
    
    toast({
      title: "Interval Added",
      description: `${newIntervalName} added successfully`,
    });
  };

  const handleDeleteInterval = (id: string) => {
    setIntervals(intervals.filter(interval => interval.id !== id));
  };

  const handleEditIntervalClick = (interval: any) => {
    setEditingIntervalId(interval.id);
    setEditIntervalName(interval.name);
    
    // Parse duration into hours, minutes, seconds
    const totalSeconds = interval.duration;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    setEditIntervalHours(hours.toString());
    setEditIntervalMinutes(minutes.toString());
    setEditIntervalSeconds(seconds.toString());
    setEditIntervalColor(interval.color || "#3B82F6");
    setEditIntervalSound(interval.sound || "beep");
    setEditIntervalReps(interval.reps || 1);
    setEditIntervalRepBased(interval.repBased || false);
    setIsEditIntervalOpen(true);
  };

  const handleSaveEditInterval = () => {
    if (!editIntervalName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an interval name",
        variant: "destructive",
      });
      return;
    }

    const totalSeconds = 
      (parseInt(editIntervalHours) || 0) * 3600 +
      (parseInt(editIntervalMinutes) || 0) * 60 +
      (parseInt(editIntervalSeconds) || 0);

    if (totalSeconds === 0 && !editIntervalRepBased) {
      toast({
        title: "Error",
        description: "Duration must be greater than 0 or enable rep-based interval",
        variant: "destructive",
      });
      return;
    }

    setIntervals(intervals.map(interval => 
      interval.id === editingIntervalId
        ? {
            ...interval,
            name: editIntervalName,
            duration: totalSeconds,
            color: editIntervalColor,
            sound: editIntervalSound,
            reps: editIntervalReps,
            repBased: editIntervalRepBased,
          }
        : interval
    ));

    setIsEditIntervalOpen(false);
    toast({
      title: "Interval updated",
      description: `${editIntervalName} has been updated`,
    });
  };

  const handlePreviousInterval = () => {
    setCurrentIntervalIndex((prev) => {
      let newIndex: number;
      
      if (prev > 0) {
        newIndex = prev - 1;
      } else {
        // Going from first interval to last, decrement repeat
        newIndex = intervals.length - 1;
        if (currentRepeat > 1) {
          setCurrentRepeat(currentRepeat - 1);
        }
      }
      
      setRemainingSeconds(intervals[newIndex]?.duration || 0);
      return newIndex;
    });
  };

  const handleNextInterval = () => {
    setCurrentIntervalIndex((prev) => {
      let newIndex: number;
      
      if (prev < intervals.length - 1) {
        newIndex = prev + 1;
      } else {
        // Going from last interval to first, increment repeat
        newIndex = 0;
        if (currentRepeat < repeatCount) {
          setCurrentRepeat(currentRepeat + 1);
        } else {
          // Reached the end of all repeats, stop timer
          setIsRunning(false);
        }
      }
      
      setRemainingSeconds(intervals[newIndex]?.duration || 0);
      return newIndex;
    });
  };

  const calculateTotalTime = () => {
    const totalSeconds = intervals.reduce((sum, interval) => sum + interval.duration, 0) * repeatCount;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerSelect = (timer: any) => {
    setTimerName(timer.name);
    setSelectedTimerId(timer.id);
    
    // Load timer intervals
    const timerIntervals = (timer.intervals || []) as Array<{ id: string; name: string; duration: number; color: string }>;
    setIntervals(timerIntervals);
    setCurrentIntervalIndex(0);
    setRepeatCount(timer.repeat_count || 1);
    setRemainingSeconds(timerIntervals[0]?.duration || 0);
    setIsRunning(false);
    setCurrentRepeat(1);
    setTotalElapsedSeconds(0);
    setIsSessionComplete(false);
  };

  // Calculate total remaining time
  const calculateTotalRemainingTime = () => {
    if (intervals.length === 0) return 0;
    
    // Total duration of all intervals
    const totalIntervalDuration = intervals.reduce((sum, interval) => sum + interval.duration, 0);
    
    // Total time for all repeats
    const totalTime = totalIntervalDuration * repeatCount;
    
    // Calculate elapsed time
    const completedRepeats = currentRepeat - 1;
    const completedIntervalsInCurrentRepeat = currentIntervalIndex;
    
    let elapsed = completedRepeats * totalIntervalDuration;
    for (let i = 0; i < completedIntervalsInCurrentRepeat; i++) {
      elapsed += intervals[i].duration;
    }
    // Add time elapsed in current interval
    elapsed += (intervals[currentIntervalIndex]?.duration || 0) - remainingSeconds;
    
    return Math.max(0, totalTime - elapsed);
  };

  // Timer countdown effect
  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          console.log('Interval complete, playing sound:', timerSettings.intervalCompleteSound);
          // Interval complete - play sound immediately
          playSound(timerSettings.intervalCompleteSound);
          
          // Check if there's a next interval
          if (currentIntervalIndex < intervals.length - 1) {
            const nextIndex = currentIntervalIndex + 1;
            setCurrentIntervalIndex(nextIndex);
            return intervals[nextIndex].duration;
          } else if (currentRepeat < repeatCount) {
            // Start next repeat
            console.log('Starting next repeat');
            setCurrentRepeat((prev) => prev + 1);
            setCurrentIntervalIndex(0);
            return intervals[0].duration;
          } else {
            // Timer complete
            console.log('Timer complete, triggering completion sound');
            setIsRunning(false);
            setIsSessionComplete(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, currentIntervalIndex, intervals, repeatCount, currentRepeat, timerSettings]);

  // Handle session completion sound
  useEffect(() => {
    if (!isSessionComplete || !audioContext) return;
    
    console.log('Session complete, playing completion sound repeatedly for 15 seconds');
    
    let soundCount = 0;
    const maxSounds = 15;
    
    // Play immediately
    playSound(timerSettings.timerCompleteSound);
    soundCount++;
    
    // Then play every second for 15 seconds
    const completionInterval = setInterval(() => {
      if (soundCount < maxSounds) {
        playSound(timerSettings.timerCompleteSound);
        soundCount++;
      } else {
        clearInterval(completionInterval);
        console.log('Completion sound sequence finished');
      }
    }, 1000);
    
    return () => clearInterval(completionInterval);
  }, [isSessionComplete, audioContext]);

  const playSound = (soundId: string) => {
    console.log('Playing sound:', soundId);
    
    // Always use a working AudioContext
    let ctx = audioContext;
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(ctx);
      console.log('New AudioContext created in playSound');
    }
    
    const playSingleBeep = (frequency: number, startTime: number, duration: number) => {
      try {
        const osc = ctx!.createOscillator();
        const gain = ctx!.createGain();
        
        osc.connect(gain);
        gain.connect(ctx!.destination);
        
        osc.frequency.setValueAtTime(frequency, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
        console.log('Beep playing at frequency', frequency);
      } catch (e) {
        console.error('Error playing beep:', e);
      }
    };
    
    const now = ctx!.currentTime;
    
    switch(soundId) {
      case 'beep':
        playSingleBeep(800, now, 0.15);
        break;
      case 'doublebeep':
        playSingleBeep(800, now, 0.1);
        playSingleBeep(800, now + 0.15, 0.1);
        break;
      case 'triplet':
        playSingleBeep(800, now, 0.08);
        playSingleBeep(800, now + 0.12, 0.08);
        playSingleBeep(800, now + 0.24, 0.08);
        break;
      case 'om':
        playSingleBeep(200, now, 0.8);
        break;
      case 'alert':
        playSingleBeep(1000, now, 0.1);
        playSingleBeep(800, now + 0.15, 0.1);
        break;
      case 'pipes':
        playSingleBeep(600, now, 0.3);
        playSingleBeep(700, now + 0.1, 0.3);
        break;
      case 'pluck':
        playSingleBeep(1200, now, 0.05);
        break;
      case 'flourish':
        playSingleBeep(600, now, 0.1);
        playSingleBeep(800, now + 0.1, 0.1);
        playSingleBeep(1000, now + 0.2, 0.15);
        break;
      case 'sonar':
        playSingleBeep(400, now, 0.3);
        break;
      case 'chime':
        playSingleBeep(1500, now, 0.4);
        playSingleBeep(1200, now + 0.1, 0.4);
        break;
      case 'bell':
        playSingleBeep(1000, now, 0.5);
        break;
      case 'gong':
        playSingleBeep(150, now, 1.0);
        break;
      case 'singingbowl':
        playSingleBeep(400, now, 1.2);
        break;
      case 'meditationbowl':
        playSingleBeep(300, now, 1.5);
        break;
      case 'meditationtriplet':
        playSingleBeep(350, now, 0.5);
        playSingleBeep(350, now + 0.6, 0.5);
        playSingleBeep(350, now + 1.2, 0.5);
        break;
      default:
        break;
    }
  };

  const handleSoundSelect = (soundId: string) => {
    playSound(soundId);
    
    if (soundPickerType === 'interval') {
      setTimerSettings({ ...timerSettings, intervalCompleteSound: soundId });
    } else if (soundPickerType === 'timer') {
      setTimerSettings({ ...timerSettings, timerCompleteSound: soundId });
    } else if (soundPickerType === 'doublebeep') {
      setTimerSettings({ ...timerSettings, doubleBeepSound: soundId });
    }
  };

  const openSoundPicker = (type: 'interval' | 'timer' | 'doublebeep') => {
    console.log('Opening sound picker with type:', type);
    setSoundPickerType(type);
    setIsSoundPickerOpen(true);
  };

  const getCurrentSound = () => {
    if (soundPickerType === 'interval') return timerSettings.intervalCompleteSound;
    if (soundPickerType === 'timer') return timerSettings.timerCompleteSound;
    return timerSettings.doubleBeepSound;
  };


  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("timer_folders")
        .insert([
          {
            name: folderName,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Folder created successfully",
      });

      setFolderName("");
      setIsFolderDialogOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (intervals: any, repeatCount: number = 1) => {
    if (!intervals || intervals.length === 0) return "00:00";
    const totalSeconds = intervals.reduce((sum: number, interval: any) => sum + (interval.duration || 0), 0) * repeatCount;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="p-4 pb-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => currentFolderId ? setCurrentFolderId(null) : navigate("/activity")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentFolderId ? "Back to Library" : "Back to Activity"}
        </Button>
      </div>

      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          {!isMoveMode && !isEditMode && !isSelectMoveMode ? (
            <>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsNewTimerOpen(true)}>
                  <Timer className="h-6 w-6 text-muted-foreground" />
                </button>
                <button onClick={() => setIsFolderDialogOpen(true)} className="relative">
                  <FolderPlus className="h-6 w-6 text-muted-foreground" />
                </button>
              </div>

              <h1 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
                Your library
              </h1>

              <button 
                onClick={() => setIsLibraryMenuOpen(true)}
                className="w-10 h-10 rounded-full border-2 border-muted-foreground flex items-center justify-center hover:bg-accent transition-colors"
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </button>
            </>
          ) : isMoveMode ? (
            <>
              <button
                onClick={() => {
                  setIsMoveMode(false);
                  setSelectedMoveTimerId(null);
                }}
                className="text-primary text-lg"
              >
                Done
              </button>

              <h1 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
                {selectedMoveTimerId ? 'Drag to reorder' : 'Select a timer'}
              </h1>

              <div className="w-16"></div>
            </>
          ) : isSelectMoveMode ? (
            <>
              <button 
                onClick={() => {
                  setIsSelectMoveMode(false);
                  setSelectedTimerIds([]);
                }}
                className="text-primary text-lg"
              >
                Cancel
              </button>

              <h1 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
                Select timers
              </h1>

              <button
                onClick={() => {
                  console.log("Next clicked, selectedTimerIds:", selectedTimerIds);
                  if (selectedTimerIds.length > 0) {
                    setIsFolderSelectionOpen(true);
                  }
                }}
                className={`text-lg ${selectedTimerIds.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}
                disabled={selectedTimerIds.length === 0}
              >
                Next
              </button>
            </>
          ) : isEditMode ? (
            <>
              <div className="flex items-center gap-4 text-muted-foreground">
                {currentFolderId ? (
                  <button onClick={() => setCurrentFolderId(null)}>
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                ) : (
                  <>
                    <Timer className="h-6 w-6" />
                    <FolderPlus className="h-6 w-6" />
                  </>
                )}
              </div>

              <h1 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
                {currentFolderId 
                  ? folders.find(f => f.id === currentFolderId)?.name || 'Folder'
                  : 'Your library'}
              </h1>

              <button
                onClick={() => setIsEditMode(false)}
                className="text-primary text-lg"
              >
                Done
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!currentFolderId && folders.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              FOLDERS
            </h2>
            <div className="space-y-0 divide-y divide-border mb-6">
              {folders.map((folder: any) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between py-4"
                >
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-accent/30 -m-4 p-4"
                    onClick={() => setCurrentFolderId(folder.id)}
                  >
                    <FolderPlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-medium text-foreground">
                      {folder.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFolderId(folder.id);
                      setIsFolderMenuOpen(true);
                    }}
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          TIMERS
        </h2>

        <div className="space-y-0 divide-y divide-border">
          {timers.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No timers yet. Create a folder to get started!
            </p>
          ) : (
            timers.map((timer, index) => (
              <div
                key={timer.id}
                draggable={selectedMoveTimerId === timer.id}
                onDragStart={(e) => {
                  if (selectedMoveTimerId === timer.id) {
                    setDraggedTimerIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", timer.id);
                  }
                }}
                onDragOver={(e) => {
                  if (selectedMoveTimerId && draggedTimerIndex !== null && draggedTimerIndex !== index) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }
                }}
                onDrop={(e) => {
                  if (selectedMoveTimerId && draggedTimerIndex !== null && draggedTimerIndex !== index) {
                    e.preventDefault();
                    const newTimers = [...timers];
                    const [draggedTimer] = newTimers.splice(draggedTimerIndex, 1);
                    newTimers.splice(index, 0, draggedTimer);
                    queryClient.setQueryData(["interval-timers"], newTimers);
                    setDraggedTimerIndex(null);
                    toast({
                      title: "Reordered",
                      description: "Timer position updated",
                    });
                  }
                }}
                onDragEnd={() => {
                  setDraggedTimerIndex(null);
                }}
                onClick={() => {
                  if (isMoveMode && !selectedMoveTimerId) {
                    setSelectedMoveTimerId(timer.id);
                  }
                }}
                className={`flex items-center gap-3 py-4 transition-all ${
                  draggedTimerIndex === index ? 'opacity-50' : ''
                } ${selectedMoveTimerId === timer.id ? 'bg-accent/50 cursor-move select-none' : ''} ${
                  isMoveMode && !selectedMoveTimerId ? 'cursor-pointer hover:bg-accent/30' : ''
                }`}
              >
                {isSelectMoveMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTimerIds(prev => 
                        prev.includes(timer.id)
                          ? prev.filter(id => id !== timer.id)
                          : [...prev, timer.id]
                      );
                    }}
                    className="mr-4"
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                      selectedTimerIds.includes(timer.id)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}>
                      {selectedTimerIds.includes(timer.id) && (
                        <div className="w-2 h-2 bg-background rounded-full" />
                      )}
                    </div>
                  </button>
                )}
                {isMoveMode && selectedMoveTimerId === timer.id && (
                  <div className="mr-2">
                    <GripVertical className="h-5 w-5 text-primary" />
                  </div>
                )}
                {isEditMode && (
                  <button
                    onClick={() => deleteTimerMutation.mutate(timer.id)}
                    className="mr-4"
                    disabled={deleteTimerMutation.isPending}
                  >
                    <div className="w-7 h-7 rounded-full bg-destructive flex items-center justify-center">
                      <div className="w-3 h-0.5 bg-background" />
                    </div>
                  </button>
                )}
                <div 
                  className={`flex-1 text-left ${isMoveMode && selectedMoveTimerId === timer.id ? '' : 'cursor-pointer'}`}
                  onClick={(e) => {
                    if (!isSelectMoveMode && !isEditMode && !isMoveMode) {
                      e.stopPropagation();
                      handleTimerSelect(timer);
                    }
                  }}
                >
                  <span className={`text-lg font-medium text-foreground ${selectedMoveTimerId === timer.id ? 'select-none' : ''}`}>
                    {timer.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {!isMoveMode && !isSelectMoveMode && !isEditMode && (
                    <span className="text-lg text-muted-foreground">
                      {formatDuration(timer.intervals, timer.repeat_count)}
                    </span>
                  )}
                  {(isSelectMoveMode || isEditMode) && (
                    <span className="text-lg text-muted-foreground">
                      {formatDuration(timer.intervals, timer.repeat_count)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Timer Dialog */}
      <Dialog open={isNewTimerOpen} onOpenChange={setIsNewTimerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
          <div className="sticky top-0 bg-background border-b border-border z-10">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setIsNewTimerOpen(false)}
                className="text-primary"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-foreground">New Timer</h2>
              <button 
                className={`font-semibold ${!timerName.trim() || saveTimerMutation.isPending ? 'text-muted-foreground' : 'text-primary'}`}
                onClick={() => saveTimerMutation.mutate()}
                disabled={!timerName.trim() || saveTimerMutation.isPending}
              >
                {saveTimerMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Timer Name Input */}
            <div>
              <Input
                value={timerName}
                onChange={(e) => setTimerName(e.target.value)}
                onFocus={(e) => {
                  if (timerName === "New Timer") {
                    setTimerName("");
                  } else {
                    e.target.select();
                  }
                }}
                placeholder="Timer name"
                className="text-lg"
              />
            </div>

            {/* INTERVALS */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">INTERVALS</h3>
              
              {/* Add Interval Form */}
              <div className="space-y-3 p-4 border border-border rounded-lg">
                <Input
                  value={newIntervalName}
                  onChange={(e) => setNewIntervalName(e.target.value)}
                  placeholder="Interval name (e.g., J1, T1)"
                  className="text-base"
                />
                <Input
                  type="number"
                  value={newIntervalDuration}
                  onChange={(e) => setNewIntervalDuration(e.target.value)}
                  placeholder="Duration in seconds"
                  className="text-base"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={newIntervalColor}
                    onChange={(e) => setNewIntervalColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Button
                    onClick={handleAddInterval}
                    className="flex-1"
                    type="button"
                  >
                    Add Interval
                  </Button>
                </div>
              </div>

              {/* Intervals List */}
              {intervals.length > 0 && (
                <div className="space-y-2">
                  {intervals.map((interval) => (
                    <div
                      key={interval.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: interval.color }}
                        />
                        <span className="font-medium">{interval.name}</span>
                        <span className="text-muted-foreground">
                          {formatTime(interval.duration)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInterval(interval.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Repeat Count */}
              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Repeat</Label>
                <Input
                  type="number"
                  min="1"
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
              </div>

              {/* Total Time */}
              {intervals.length > 0 && (
                <div className="flex items-center justify-between py-3">
                  <Label className="text-lg text-foreground font-medium">Total</Label>
                  <span className="text-lg font-bold">{calculateTotalTime()}</span>
                </div>
              )}
            </div>

            {/* SOUND */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">SOUND</h3>
              
              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Interval complete</Label>
                <button onClick={() => openSoundPicker('interval')}>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Timer complete</Label>
                <button onClick={() => openSoundPicker('timer')}>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className="text-sm text-muted-foreground font-normal">Double beep (repeat)</Label>
                <button onClick={() => openSoundPicker('doublebeep')}>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* TEXT TO SPEECH */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">TEXT TO SPEECH</h3>
              
              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Text to speech</Label>
                <Switch
                  checked={timerSettings.textToSpeech}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, textToSpeech: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className={`text-lg font-normal ${timerSettings.textToSpeech ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Include sets
                </Label>
                <Switch
                  checked={timerSettings.includeSets}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, includeSets: checked })
                  }
                  disabled={!timerSettings.textToSpeech}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className={`text-lg font-normal ${timerSettings.textToSpeech ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Include reps
                </Label>
                <Switch
                  checked={timerSettings.includeReps}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, includeReps: checked })
                  }
                  disabled={!timerSettings.textToSpeech}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className={`text-lg font-normal ${timerSettings.textToSpeech ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Use for notifications
                </Label>
                <Switch
                  checked={timerSettings.useForNotifications}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, useForNotifications: checked })
                  }
                  disabled={!timerSettings.textToSpeech}
                />
              </div>
            </div>

            {/* COUNTDOWN */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">COUNTDOWN</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-3">
                  <Label className="text-lg text-foreground font-normal">3, 2, 1 (beeps)</Label>
                  <Switch
                    checked={timerSettings.countdownBeeps}
                    onCheckedChange={(checked) =>
                      setTimerSettings({ ...timerSettings, countdownBeeps: checked })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Play a beep for each of the last 3 seconds of each interval
                </p>
              </div>
            </div>

            {/* INTERIM INTERVAL */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">INTERIM INTERVAL</h3>
              
              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Use interim interval</Label>
                <Switch
                  checked={timerSettings.useInterimInterval}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, useInterimInterval: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <button
                  onClick={() => timerSettings.useInterimInterval && setIsInterimIntervalOpen(true)}
                  className="flex-1 text-left"
                  disabled={!timerSettings.useInterimInterval}
                >
                  <Label className={`text-lg font-normal cursor-pointer ${timerSettings.useInterimInterval ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Interim interval
                  </Label>
                </button>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className={`text-lg font-normal ${timerSettings.useInterimInterval ? 'text-foreground' : 'text-muted-foreground'}`}>
                  End with this interval
                </Label>
                <Switch
                  checked={timerSettings.endWithInterval}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, endWithInterval: checked })
                  }
                  disabled={!timerSettings.useInterimInterval}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                This interval will run between each interval
              </p>
            </div>

            {/* DISPLAY */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">DISPLAY</h3>
              
              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Show line numbers</Label>
                <Switch
                  checked={timerSettings.showLineNumbers}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, showLineNumbers: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-3">
                  <Label className="text-lg text-foreground font-normal">Show elapsed time</Label>
                  <Switch
                    checked={timerSettings.showElapsedTime}
                    onCheckedChange={(checked) =>
                      setTimerSettings({ ...timerSettings, showElapsedTime: checked })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Elapsed time will continue running when timer is paused or when on a rep-based
                  interval and is not affected by back/next buttons
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timer Display Section */}
      {selectedTimerId && intervals.length > 0 ? (
        <div className="mt-6 space-y-6 px-4 pb-20">
          {/* Large Timer Card */}
          <div
            className="relative rounded-2xl p-8 flex items-center justify-center min-h-[300px]"
            style={{ 
              backgroundColor: intervals[currentIntervalIndex]?.color || "#3b82f6",
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={handlePreviousInterval}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <div className="text-center text-white">
              <p className="text-8xl font-bold tracking-tight">
                {formatTime(isRunning ? remainingSeconds : intervals[currentIntervalIndex]?.duration || 0)}
              </p>
              <p className="text-xl mt-4 font-medium">
                {intervals[currentIntervalIndex]?.name}
              </p>
              {repeatCount > 1 && (
                <p className="text-lg mt-2 opacity-80">
                  Round {currentRepeat} of {repeatCount}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={handleNextInterval}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              size="lg"
              onClick={() => {
                setSelectedTimerId(null);
                setTimerName("");
                setIntervals([]);
                setIsSessionComplete(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              size="lg"
              style={{ backgroundColor: isRunning ? "#f97316" : "#22c55e", color: "white" }}
              onClick={() => {
                if (isRunning) {
                  setIsRunning(false);
                } else {
                  // Initialize AudioContext on user interaction
                  if (!audioContext) {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    setAudioContext(ctx);
                    console.log('AudioContext initialized');
                  }
                  setIsSessionComplete(false); // Reset completion flag when starting
                  setIsRunning(true);
                  if (remainingSeconds === 0) {
                    setRemainingSeconds(intervals[currentIntervalIndex]?.duration || 0);
                  }
                }
              }}
            >
              {isRunning ? "Pause" : "Start"}
            </Button>
          </div>

          {/* Total Time and Repeat */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-2xl">{formatTime(calculateTotalRemainingTime())}</span>
            </div>

            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Repeat</span>
              <span className="font-bold text-xl">{currentRepeat}/{repeatCount}</span>
            </div>
          </div>

          {/* Intervals List */}
          <div className="space-y-2">
            {intervals.map((interval, index) => (
              <div
                key={interval.id}
                className={`flex items-center gap-3 p-4 rounded-lg transition-colors cursor-pointer hover:opacity-80`}
                style={
                  index === currentIntervalIndex && isRunning
                    ? { backgroundColor: interval.color, color: "white" }
                    : index === currentIntervalIndex
                    ? { backgroundColor: "hsl(var(--muted))" }
                    : {}
                }
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      if (index > 0) {
                        const newIntervals = [...intervals];
                        [newIntervals[index], newIntervals[index - 1]] = [newIntervals[index - 1], newIntervals[index]];
                        setIntervals(newIntervals);
                        if (currentIntervalIndex === index) {
                          setCurrentIntervalIndex(index - 1);
                        } else if (currentIntervalIndex === index - 1) {
                          setCurrentIntervalIndex(index);
                        }
                      }
                    }}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-white/20 transition-colors ${index === 0 ? 'invisible' : ''}`}
                  >
                    <ChevronUp 
                      className="h-5 w-5" 
                      style={{ color: index === currentIntervalIndex && isRunning ? "white" : "hsl(var(--muted-foreground))" }}
                    />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (index < intervals.length - 1) {
                        const newIntervals = [...intervals];
                        [newIntervals[index], newIntervals[index + 1]] = [newIntervals[index + 1], newIntervals[index]];
                        setIntervals(newIntervals);
                        if (currentIntervalIndex === index) {
                          setCurrentIntervalIndex(index + 1);
                        } else if (currentIntervalIndex === index + 1) {
                          setCurrentIntervalIndex(index);
                        }
                      }
                    }}
                    disabled={index === intervals.length - 1}
                    className={`p-1 rounded hover:bg-white/20 transition-colors ${index === intervals.length - 1 ? 'invisible' : ''}`}
                  >
                    <ChevronDown 
                      className="h-5 w-5" 
                      style={{ color: index === currentIntervalIndex && isRunning ? "white" : "hsl(var(--muted-foreground))" }}
                    />
                  </button>
                </div>
                
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditIntervalClick(interval);
                  }}
                >
                  <span 
                    className="font-medium"
                    style={{ color: index === currentIntervalIndex && isRunning ? "white" : "inherit" }}
                  >
                    {interval.name}
                  </span>
                  <span 
                    className="font-mono ml-auto"
                    style={{ color: index === currentIntervalIndex && isRunning ? "white" : "inherit" }}
                  >
                    {formatTime(interval.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Sound Picker Dialog */}
      <Dialog open={isSoundPickerOpen} onOpenChange={setIsSoundPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
          <div className="sticky top-0 bg-background border-b border-border z-10">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setIsSoundPickerOpen(false)}
                className="text-primary"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-foreground">Sounds</h2>
              <div className="w-6"></div>
            </div>
          </div>

          <div className="p-0">
            {/* No sound option */}
            <button
              onClick={() => handleSoundSelect('none')}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border"
            >
              <span className="text-lg text-foreground">No sound</span>
              {getCurrentSound() === 'none' && (
                <span className="text-primary text-2xl">✓</span>
              )}
            </button>

            {/* Repeat toggle - only show for timer complete */}
            {soundPickerType === 'timer' && (
              <>
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <Label className="text-lg text-foreground font-normal">Repeat</Label>
                  <Switch
                    checked={timerSettings.timerCompleteRepeat}
                    onCheckedChange={(checked) =>
                      setTimerSettings({ ...timerSettings, timerCompleteRepeat: checked })
                    }
                  />
                </div>
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">
                    Play sound on repeat when timer ends. If app is running in background, sound will play for 30 seconds.
                  </p>
                </div>
              </>
            )}

            {/* Select a sound section */}
            <div className="p-4 bg-muted/30">
              <h3 className="text-sm font-semibold text-muted-foreground">SELECT A SOUND</h3>
            </div>

            {soundOptions.slice(1).map((sound) => (
              <button
                key={sound.id}
                onClick={() => handleSoundSelect(sound.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border"
              >
                <span className="text-lg text-foreground">{sound.name}</span>
                {getCurrentSound() === sound.id && (
                  <span className="text-primary text-2xl">✓</span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Interim Interval Dialog */}
      <Dialog open={isInterimIntervalOpen} onOpenChange={setIsInterimIntervalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
          <div className="sticky top-0 bg-background border-b border-border z-10">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setIsInterimIntervalOpen(false)}
                className="text-primary flex items-center gap-2"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="text-lg">Back</span>
              </button>
              <h2 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
                Interim Interval
              </h2>
              <div className="w-20"></div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Time Pickers */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={interimHoursInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setInterimHoursInput(value);
                      const hours = value === '' ? 0 : Math.max(0, Math.min(23, parseInt(value)));
                      const mins = Math.floor((timerSettings.interimIntervalSeconds % 3600) / 60);
                      const secs = timerSettings.interimIntervalSeconds % 60;
                      setTimerSettings({ ...timerSettings, interimIntervalSeconds: hours * 3600 + mins * 60 + secs });
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setInterimHoursInput('0');
                    }
                  }}
                  className="w-24 text-center text-2xl"
                />
                <span className="text-sm text-muted-foreground mt-2">hours</span>
              </div>

              <div className="flex flex-col items-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={interimMinsInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setInterimMinsInput(value);
                      const hours = Math.floor(timerSettings.interimIntervalSeconds / 3600);
                      const mins = value === '' ? 0 : Math.max(0, Math.min(59, parseInt(value)));
                      const secs = timerSettings.interimIntervalSeconds % 60;
                      setTimerSettings({ ...timerSettings, interimIntervalSeconds: hours * 3600 + mins * 60 + secs });
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setInterimMinsInput('0');
                    }
                  }}
                  className="w-24 text-center text-2xl"
                />
                <span className="text-sm text-muted-foreground mt-2">min</span>
              </div>

              <div className="flex flex-col items-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={interimSecsInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      setInterimSecsInput(value);
                      const hours = Math.floor(timerSettings.interimIntervalSeconds / 3600);
                      const mins = Math.floor((timerSettings.interimIntervalSeconds % 3600) / 60);
                      const secs = value === '' ? 0 : Math.max(0, Math.min(59, parseInt(value)));
                      setTimerSettings({ ...timerSettings, interimIntervalSeconds: hours * 3600 + mins * 60 + secs });
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setInterimSecsInput('0');
                    }
                  }}
                  className="w-24 text-center text-2xl"
                />
                <span className="text-sm text-muted-foreground mt-2">sec</span>
              </div>
            </div>

            {/* Description */}
            <button className="w-full p-4 text-center text-muted-foreground border-y border-border">
              Description
            </button>

            {/* Add an image */}
            <button className="w-full p-4 text-center text-muted-foreground border-b border-border">
              Add an image
            </button>

            {/* Repetitions */}
            <div className="flex items-center justify-between py-3">
              <Label className="text-lg text-foreground font-normal">Repetitions</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={interimRepsInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setInterimRepsInput(value);
                    const num = value === '' ? 1 : Math.max(1, parseInt(value));
                    setTimerSettings({ ...timerSettings, interimRepetitions: num });
                  }
                }}
                onFocus={() => {
                  if (interimRepsInput === '1') {
                    setInterimRepsInput('');
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setInterimRepsInput('1');
                    setTimerSettings({ ...timerSettings, interimRepetitions: 1 });
                  }
                }}
                className="w-24 text-center"
              />
            </div>

            {/* Sets */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <Label className="text-lg text-foreground font-normal">Sets</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={interimSetsInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setInterimSetsInput(value);
                    const num = value === '' ? 1 : Math.max(1, parseInt(value));
                    setTimerSettings({ ...timerSettings, interimSets: num });
                  }
                }}
                onFocus={() => {
                  if (interimSetsInput === '1') {
                    setInterimSetsInput('');
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setInterimSetsInput('1');
                    setTimerSettings({ ...timerSettings, interimSets: 1 });
                  }
                }}
                className="w-24 text-center"
              />
            </div>

            {/* Color */}
            <button 
              onClick={() => setIsColorPickerOpen(true)}
              className="flex items-center justify-between py-3 border-t border-border w-full"
            >
              <Label className="text-lg text-foreground font-normal">Color</Label>
              <div className="flex items-center gap-2">
                {timerSettings.interimColor !== 'none' && (
                  <div 
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: colorOptions.find(c => c.id === timerSettings.interimColor)?.hex || 'transparent' }}
                  />
                )}
                <span className="text-lg text-muted-foreground capitalize">{timerSettings.interimColor}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>

            {/* Sound */}
            <button 
              onClick={() => setIsInterimSoundPickerOpen(true)}
              className="flex items-center justify-between py-3 border-t border-border w-full"
            >
              <Label className="text-lg text-foreground font-normal">Sound</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg text-muted-foreground capitalize">
                  {soundOptions.find(s => s.id === timerSettings.interimSound)?.name || 'Beep'}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>

            {/* Rep-based interval */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Rep-based interval</Label>
                <Switch
                  checked={timerSettings.isRepBased}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, isRepBased: checked })
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Rep-based intervals will not have a time set. The navigation buttons can be used to move between reps, or the Skip button can be used to move to the next interval.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Color Picker Dialog */}
      <Dialog open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
        <DialogContent className="max-w-2xl bg-background p-0">
          <div className="sticky top-0 bg-background border-b border-border z-10">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setIsColorPickerOpen(false)}
                className="text-primary flex items-center gap-2"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="text-lg">Interim Interval</span>
              </button>
              <div className="w-20"></div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
              SELECT A BACKGROUND COLOR
            </h3>
            <div className="space-y-1">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  onClick={() => {
                    setTimerSettings({ ...timerSettings, interimColor: color.id });
                    setIsColorPickerOpen(false);
                    // Keep interim interval dialog open
                    setTimeout(() => setIsInterimIntervalOpen(true), 0);
                  }}
                  className="w-full flex items-center justify-between py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {color.hex && (
                      <div 
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    <span className="text-lg text-foreground">{color.name}</span>
                  </div>
                  {timerSettings.interimColor === color.id && (
                    <span className="text-primary text-2xl">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interim Sound Picker Dialog */}
      <Dialog open={isInterimSoundPickerOpen} onOpenChange={setIsInterimSoundPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
          <div className="sticky top-0 bg-background border-b border-border z-10">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setIsInterimSoundPickerOpen(false)}
                className="text-primary flex items-center gap-2"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="text-lg">Back</span>
              </button>
              <h2 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
                Sounds
              </h2>
              <div className="w-20"></div>
            </div>
          </div>

          <div className="p-6">
            {/* No sound option */}
            <button
              onClick={() => {
                setTimerSettings({ ...timerSettings, interimSound: 'none' });
                setIsInterimSoundPickerOpen(false);
                setTimeout(() => setIsInterimIntervalOpen(true), 0);
              }}
              className="w-full flex items-center justify-between py-4 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <span className="text-lg text-foreground">No sound</span>
              {timerSettings.interimSound === 'none' && (
                <span className="text-primary text-2xl">✓</span>
              )}
            </button>

            <h3 className="text-sm text-muted-foreground mt-6 mb-4 uppercase tracking-wider">
              SELECT A SOUND
            </h3>
            <div className="space-y-1">
              {soundOptions.filter(s => s.id !== 'none').map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    playSound(sound.id);
                    setTimerSettings({ ...timerSettings, interimSound: sound.id });
                    setIsInterimSoundPickerOpen(false);
                    setTimeout(() => setIsInterimIntervalOpen(true), 0);
                  }}
                  className="w-full flex items-center justify-between py-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg text-foreground">{sound.name}</span>
                  {timerSettings.interimSound === sound.id && (
                    <span className="text-primary text-2xl">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Library Menu Sheet - No Overlay */}
      <Sheet open={isLibraryMenuOpen} onOpenChange={setIsLibraryMenuOpen}>
        <SheetContent 
          side="bottom" 
          className="p-0 border-t border-border rounded-t-xl"
          overlayClassName="bg-transparent pointer-events-none"
        >
          <div className="flex flex-col">
            <button
              className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
              onClick={() => {
                setIsLibraryMenuOpen(false);
                setIsMoveMode(true);
              }}
            >
              Move
            </button>
            <Separator />
            <button
              className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
              onClick={() => {
                setIsLibraryMenuOpen(false);
                setIsSelectMoveMode(true);
              }}
            >
              Move to folder
            </button>
            <Separator />
            <button
              className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
              onClick={() => {
                setIsLibraryMenuOpen(false);
                setIsEditMode(true);
              }}
            >
              Edit
            </button>
            <Separator />
            <button
              className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
              onClick={() => setIsLibraryMenuOpen(false)}
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Folder Selection Dialog for Move */}
      <Dialog open={isFolderSelectionOpen} onOpenChange={setIsFolderSelectionOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Move to folder</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <button
              onClick={() => moveTimersMutation.mutate(null)}
              className="w-full p-4 text-left hover:bg-accent rounded-lg transition-colors"
              disabled={moveTimersMutation.isPending}
            >
              <span className="text-foreground">No folder</span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => moveTimersMutation.mutate(folder.id)}
                className="w-full p-4 text-left hover:bg-accent rounded-lg transition-colors"
                disabled={moveTimersMutation.isPending}
              >
                <span className="text-foreground">{folder.name}</span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsFolderSelectionOpen(false)}
              disabled={moveTimersMutation.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Please enter a name
            </p>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFolder();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setFolderName("");
                setIsFolderDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder Menu Sheet */}
      <Sheet open={isFolderMenuOpen} onOpenChange={setIsFolderMenuOpen}>
        <SheetContent 
          side="bottom" 
          className="p-0 border-t border-border rounded-t-xl"
          overlayClassName="bg-transparent pointer-events-none"
        >
          <div className="flex flex-col">
            <button
              className="py-4 px-6 text-center text-destructive hover:bg-accent transition-colors text-base"
              onClick={() => {
                setIsFolderMenuOpen(false);
                if (selectedFolderId) {
                  setDeleteFolderId(selectedFolderId);
                }
              }}
            >
              Delete Folder
            </button>
            <Separator />
            <button
              className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
              onClick={() => {
                setIsFolderMenuOpen(false);
                setSelectedFolderId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog open={deleteFolderId !== null} onOpenChange={(open) => !open && setDeleteFolderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this folder and all timers within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteFolderId) {
                  deleteFolderMutation.mutate(deleteFolderId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Interval Dialog */}
      <Sheet open={isEditIntervalOpen} onOpenChange={setIsEditIntervalOpen}>
        <SheetContent side="top" className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border pb-4 -mt-6 -mx-6 px-6 pt-6 mb-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsEditIntervalOpen(false)}
                className="text-primary"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-foreground">Edit interval</h2>
              <button
                onClick={handleSaveEditInterval}
                className="text-primary font-semibold"
              >
                Save
              </button>
            </div>
          </div>

          <div className="space-y-6 pb-20">
            {/* Time Picker */}
            <div className="flex gap-4 justify-center items-center text-4xl">
              <div className="flex flex-col items-center">
                <Input
                  type="number"
                  min="0"
                  value={editIntervalHours}
                  onChange={(e) => setEditIntervalHours(e.target.value)}
                  className="text-4xl text-center w-32 h-20 font-bold"
                />
                <span className="text-sm text-muted-foreground mt-1">hours</span>
              </div>
              <span className="font-bold">:</span>
              <div className="flex flex-col items-center">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={editIntervalMinutes}
                  onChange={(e) => setEditIntervalMinutes(e.target.value)}
                  className="text-4xl text-center w-32 h-20 font-bold"
                />
                <span className="text-sm text-muted-foreground mt-1">min</span>
              </div>
              <span className="font-bold">:</span>
              <div className="flex flex-col items-center">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={editIntervalSeconds}
                  onChange={(e) => setEditIntervalSeconds(e.target.value)}
                  className="text-4xl text-center w-32 h-20 font-bold"
                />
                <span className="text-sm text-muted-foreground mt-1">sec</span>
              </div>
            </div>

            {/* Interval Name */}
            <div className="py-4 border-y border-border">
              <Input
                value={editIntervalName}
                onChange={(e) => setEditIntervalName(e.target.value)}
                placeholder="Interval name"
                className="text-center text-lg border-0 focus-visible:ring-0"
              />
            </div>

            {/* Add an image placeholder */}
            <button className="w-full py-4 text-center text-muted-foreground hover:bg-accent transition-colors border-y border-border">
              Add an image
            </button>

            {/* Repetitions */}
            <div className="flex items-center justify-between py-4 border-b border-border">
              <Label className="text-lg text-foreground">Repetitions</Label>
              <Input
                type="number"
                min="1"
                value={editIntervalReps}
                onChange={(e) => setEditIntervalReps(parseInt(e.target.value) || 1)}
                className="w-20 text-center text-lg"
              />
            </div>

            {/* Set */}
            <div className="flex items-center justify-between py-4 border-b border-border">
              <Label className="text-lg text-foreground">Set</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Repeat</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Color */}
            <div className="flex items-center justify-between py-4 border-b border-border">
              <Label className="text-lg text-foreground">Color</Label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: editIntervalColor }}
                />
                <Input
                  type="color"
                  value={editIntervalColor}
                  onChange={(e) => setEditIntervalColor(e.target.value)}
                  className="w-16 h-10"
                />
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Sound */}
            <button
              onClick={() => {
                console.log('Opening sound picker. Current sound:', editIntervalSound);
                setIsEditIntervalSoundPickerOpen(true);
              }}
              className="flex items-center justify-between py-4 border-b border-border w-full hover:bg-accent/50 transition-colors"
            >
              <Label className="text-lg text-foreground cursor-pointer">Sound</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {soundOptions.find(s => s.id === editIntervalSound)?.name || editIntervalSound}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>

            {/* Rep-based interval */}
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg text-foreground">Rep-based interval</Label>
                <Switch
                  checked={editIntervalRepBased}
                  onCheckedChange={setEditIntervalRepBased}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Rep-based intervals will not have a time set. The navigation buttons can be used to move between reps, or the Skip button can be used to move to the next interval.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Interval Sound Picker Dialog */}
      <Dialog open={isEditIntervalSoundPickerOpen} onOpenChange={setIsEditIntervalSoundPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
          <div className="sticky top-0 bg-background border-b border-border z-10">
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setIsEditIntervalSoundPickerOpen(false)}
                className="text-primary flex items-center gap-2"
              >
                <ArrowLeft className="h-6 w-6" />
                <span className="text-lg">Back</span>
              </button>
              <h2 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
                Sounds
              </h2>
              <div className="w-20"></div>
            </div>
          </div>

          <div className="p-6">
            {/* No sound option */}
            <button
              onClick={() => {
                setEditIntervalSound('none');
                setTimeout(() => setIsEditIntervalSoundPickerOpen(false), 100);
              }}
              className="w-full flex items-center justify-between py-4 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <span className="text-lg text-foreground">No sound</span>
              {editIntervalSound === 'none' && (
                <span className="text-primary text-2xl">✓</span>
              )}
            </button>

            <h3 className="text-sm text-muted-foreground mt-6 mb-4 uppercase tracking-wider">
              SELECT A SOUND
            </h3>
            <div className="space-y-1">
              {soundOptions.filter(s => s.id !== 'none').map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    console.log('Selecting sound:', sound.id, sound.name);
                    playSound(sound.id);
                    setEditIntervalSound(sound.id);
                    console.log('Sound state updated to:', sound.id);
                    setTimeout(() => {
                      console.log('Closing dialog');
                      setIsEditIntervalSoundPickerOpen(false);
                    }, 100);
                  }}
                  className="w-full flex items-center justify-between py-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg text-foreground">{sound.name}</span>
                  {editIntervalSound === sound.id && (
                    <span className="text-primary text-2xl">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntervalTimer;
