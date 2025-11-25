import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Timer, FolderPlus, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const [folderName, setFolderName] = useState("");
  const { toast } = useToast();

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
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          {/* Left icons */}
          <div className="flex items-center gap-4">
            <Timer className="h-6 w-6 text-muted-foreground" />
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
