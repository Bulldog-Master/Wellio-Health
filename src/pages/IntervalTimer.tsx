import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Timer, FolderPlus, MoreHorizontal, ArrowLeft, X, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface IntervalTimer {
  id: string;
  name: string;
  user_id: string;
  intervals: any;
  created_at?: string;
}

const IntervalTimer = () => {
  const [timers, setTimers] = useState<IntervalTimer[]>([]);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isNewTimerOpen, setIsNewTimerOpen] = useState(false);
  const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
  const [isInterimIntervalOpen, setIsInterimIntervalOpen] = useState(false);
  const [soundPickerType, setSoundPickerType] = useState<'interval' | 'timer' | 'doublebeep'>('interval');
  const [folderName, setFolderName] = useState("");
  const [timerName, setTimerName] = useState("");
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
    endWithInterval: false,
    showLineNumbers: false,
    showElapsedTime: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const playSound = (soundId: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    const playSingleBeep = (frequency: number, startTime: number, duration: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    
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

  useEffect(() => {
    fetchTimers();
  }, []);

  const fetchTimers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("interval_timers")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTimers(data || []);
    } catch (error) {
      console.error("Error fetching timers:", error);
      toast({
        title: "Error",
        description: "Failed to load timers",
        variant: "destructive",
      });
    }
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

  const formatDuration = (intervals: any) => {
    // Placeholder - will calculate total duration from intervals later
    return "20:00";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back button */}
      <div className="p-4 pb-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/activity")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Activity
        </Button>
      </div>

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          {/* Left icons */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsNewTimerOpen(true)}>
              <Timer className="h-6 w-6 text-muted-foreground" />
            </button>
            <button
              onClick={() => setIsFolderDialogOpen(true)}
              className="relative"
            >
              <FolderPlus className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>

          {/* Center title */}
          <h1 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
            Your library
          </h1>

          {/* Right icon */}
          <button className="w-10 h-10 rounded-full border-2 border-muted-foreground flex items-center justify-center">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          TIMERS
        </h2>

        <div className="space-y-0 divide-y divide-border">
          {timers.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No timers yet. Create a folder to get started!
            </p>
          ) : (
            timers.map((timer) => (
              <div
                key={timer.id}
                className="flex items-center justify-between py-4"
              >
                <span className="text-lg font-medium text-foreground">
                  {timer.name}
                </span>
                <span className="text-lg text-muted-foreground">
                  {formatDuration(timer.intervals)}
                </span>
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
              <button className="text-muted-foreground font-semibold">
                Save
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Timer Name Input */}
            <div>
              <Input
                value={timerName}
                onChange={(e) => setTimerName(e.target.value)}
                placeholder="Timer name"
                className="text-lg"
              />
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
                  type="number"
                  value={Math.floor(timerSettings.interimIntervalSeconds / 3600)}
                  onChange={(e) => {
                    const hours = parseInt(e.target.value) || 0;
                    const mins = Math.floor((timerSettings.interimIntervalSeconds % 3600) / 60);
                    const secs = timerSettings.interimIntervalSeconds % 60;
                    setTimerSettings({ ...timerSettings, interimIntervalSeconds: hours * 3600 + mins * 60 + secs });
                  }}
                  className="w-24 text-center text-2xl"
                  min="0"
                  max="23"
                />
                <span className="text-sm text-muted-foreground mt-2">hours</span>
              </div>

              <div className="flex flex-col items-center">
                <Input
                  type="number"
                  value={Math.floor((timerSettings.interimIntervalSeconds % 3600) / 60)}
                  onChange={(e) => {
                    const hours = Math.floor(timerSettings.interimIntervalSeconds / 3600);
                    const mins = parseInt(e.target.value) || 0;
                    const secs = timerSettings.interimIntervalSeconds % 60;
                    setTimerSettings({ ...timerSettings, interimIntervalSeconds: hours * 3600 + mins * 60 + secs });
                  }}
                  className="w-24 text-center text-2xl"
                  min="0"
                  max="59"
                />
                <span className="text-sm text-muted-foreground mt-2">min</span>
              </div>

              <div className="flex flex-col items-center">
                <Input
                  type="number"
                  value={timerSettings.interimIntervalSeconds % 60}
                  onChange={(e) => {
                    const hours = Math.floor(timerSettings.interimIntervalSeconds / 3600);
                    const mins = Math.floor((timerSettings.interimIntervalSeconds % 3600) / 60);
                    const secs = parseInt(e.target.value) || 0;
                    setTimerSettings({ ...timerSettings, interimIntervalSeconds: hours * 3600 + mins * 60 + secs });
                  }}
                  className="w-24 text-center text-2xl"
                  min="0"
                  max="59"
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
                type="number"
                value={timerSettings.interimRepetitions}
                onChange={(e) => setTimerSettings({ ...timerSettings, interimRepetitions: parseInt(e.target.value) || 1 })}
                className="w-24 text-center"
                min="1"
              />
            </div>

            {/* Color */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <Label className="text-lg text-foreground font-normal">Color</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg text-muted-foreground">None</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Sound */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <Label className="text-lg text-foreground font-normal">Sound</Label>
              <div className="flex items-center gap-2">
                <span className="text-lg text-muted-foreground">Beep</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Rep-based interval */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Rep-based interval</Label>
                <Switch
                  checked={false}
                  onCheckedChange={() => {}}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Rep-based intervals will not have a time set. The navigation buttons can be used to move between reps, or the Skip button can be used to move to the next interval.
              </p>
            </div>
          </div>
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
    </div>
  );
};

export default IntervalTimer;
