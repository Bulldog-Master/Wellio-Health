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
  const [folderName, setFolderName] = useState("");
  const [timerSettings, setTimerSettings] = useState({
    textToSpeech: false,
    includeSets: false,
    includeReps: false,
    useForNotifications: false,
    soundEnabled: true,
    soundVolume: 100,
    countdownBeeps: false,
    useInterimInterval: false,
    interimIntervalSeconds: 10,
    endWithInterval: false,
    showLineNumbers: false,
    showElapsedTime: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

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
                <Label className="text-lg text-muted-foreground font-normal">Include sets</Label>
                <Switch
                  checked={timerSettings.includeSets}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, includeSets: checked })
                  }
                  disabled={!timerSettings.textToSpeech}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-muted-foreground font-normal">Include reps</Label>
                <Switch
                  checked={timerSettings.includeReps}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, includeReps: checked })
                  }
                  disabled={!timerSettings.textToSpeech}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-muted-foreground font-normal">Use for notifications</Label>
                <Switch
                  checked={timerSettings.useForNotifications}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, useForNotifications: checked })
                  }
                  disabled={!timerSettings.textToSpeech}
                />
              </div>
            </div>

            {/* SOUND */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">SOUND</h3>
              
              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-foreground font-normal">Sound</Label>
                <Switch
                  checked={timerSettings.soundEnabled}
                  onCheckedChange={(checked) =>
                    setTimerSettings({ ...timerSettings, soundEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-muted-foreground font-normal">Volume</Label>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
                <Label className="text-lg text-muted-foreground font-normal">Interim interval</Label>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between py-3">
                <Label className="text-lg text-muted-foreground font-normal">End with this interval</Label>
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
