import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Timer, Plus, Trash2, Play, X, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IntervalTimer {
  id: string;
  name: string;
  text_to_speech: boolean;
  include_sets: boolean;
  include_reps: boolean;
  use_for_notifications: boolean;
  countdown_beeps: boolean;
  use_interim_interval: boolean;
  interim_interval_seconds: number;
  end_with_interim: boolean;
  show_line_numbers: boolean;
  show_elapsed_time: boolean;
  intervals: any;
}

const IntervalTimer = () => {
  const { toast } = useToast();
  const [timers, setTimers] = useState<IntervalTimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<IntervalTimer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    text_to_speech: false,
    include_sets: false,
    include_reps: false,
    use_for_notifications: false,
    countdown_beeps: false,
    use_interim_interval: false,
    interim_interval_seconds: 10,
    end_with_interim: false,
    show_line_numbers: false,
    show_elapsed_time: false,
  });

  useEffect(() => {
    fetchTimers();
  }, []);

  const fetchTimers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('interval_timers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTimers(data || []);
    } catch (error) {
      console.error('Error fetching timers:', error);
      toast({
        title: "Error",
        description: "Failed to load timers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTimer(null);
    setFormData({
      name: "",
      text_to_speech: false,
      include_sets: false,
      include_reps: false,
      use_for_notifications: false,
      countdown_beeps: false,
      use_interim_interval: false,
      interim_interval_seconds: 10,
      end_with_interim: false,
      show_line_numbers: false,
      show_elapsed_time: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (timer: IntervalTimer) => {
    setEditingTimer(timer);
    setFormData({
      name: timer.name,
      text_to_speech: timer.text_to_speech,
      include_sets: timer.include_sets,
      include_reps: timer.include_reps,
      use_for_notifications: timer.use_for_notifications,
      countdown_beeps: timer.countdown_beeps,
      use_interim_interval: timer.use_interim_interval,
      interim_interval_seconds: timer.interim_interval_seconds,
      end_with_interim: timer.end_with_interim,
      show_line_numbers: timer.show_line_numbers,
      show_elapsed_time: timer.show_elapsed_time,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your timer.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingTimer) {
        const { error } = await supabase
          .from('interval_timers')
          .update(formData)
          .eq('id', editingTimer.id);

        if (error) throw error;

        toast({
          title: "Timer updated",
          description: "Your timer has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('interval_timers')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Timer created",
          description: "Your timer has been saved to your library.",
        });
      }

      setIsDialogOpen(false);
      fetchTimers();
    } catch (error) {
      console.error('Error saving timer:', error);
      toast({
        title: "Error",
        description: "Failed to save timer.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('interval_timers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Timer deleted",
        description: "Timer has been removed from your library.",
      });

      fetchTimers();
    } catch (error) {
      console.error('Error deleting timer:', error);
      toast({
        title: "Error",
        description: "Failed to delete timer.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Timer className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Interval Timer</h1>
            <p className="text-muted-foreground">Create custom workout timers</p>
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Timer
        </Button>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">My Timers</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : timers.length > 0 ? (
            timers.map((timer) => (
              <div key={timer.id} className="p-4 bg-secondary rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{timer.name}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {timer.text_to_speech && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Text to Speech</span>
                    )}
                    {timer.countdown_beeps && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Countdown Beeps</span>
                    )}
                    {timer.use_interim_interval && (
                      <span className="text-xs bg-secondary-foreground/20 px-2 py-1 rounded">Interim Interval</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(timer)}>
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(timer.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Timer className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No timers yet</p>
              <Button onClick={handleCreate} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Timer
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTimer ? "Edit Timer" : "Create Timer"}</DialogTitle>
            <DialogDescription>
              Customize your interval timer settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="name">Timer Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., HIIT Workout"
                className="mt-1.5"
              />
            </div>

            <div className="space-y-4">
              <div className="text-sm font-medium text-muted-foreground">TEXT TO SPEECH</div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="text_to_speech" className="font-normal">Text to speech</Label>
                <Switch
                  id="text_to_speech"
                  checked={formData.text_to_speech}
                  onCheckedChange={(checked) => setFormData({ ...formData, text_to_speech: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include_sets" className="font-normal text-muted-foreground">Include sets</Label>
                <Switch
                  id="include_sets"
                  checked={formData.include_sets}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_sets: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include_reps" className="font-normal text-muted-foreground">Include reps</Label>
                <Switch
                  id="include_reps"
                  checked={formData.include_reps}
                  onCheckedChange={(checked) => setFormData({ ...formData, include_reps: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="use_for_notifications" className="font-normal text-muted-foreground">Use for notifications</Label>
                <Switch
                  id="use_for_notifications"
                  checked={formData.use_for_notifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, use_for_notifications: checked })}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="text-sm font-medium text-muted-foreground">COUNTDOWN</div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="countdown_beeps" className="font-normal">3, 2, 1 (beeps)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Play a beep for each of the last 3 seconds of each interval
                  </p>
                </div>
                <Switch
                  id="countdown_beeps"
                  checked={formData.countdown_beeps}
                  onCheckedChange={(checked) => setFormData({ ...formData, countdown_beeps: checked })}
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="text-sm font-medium text-muted-foreground">INTERIM INTERVAL</div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="use_interim_interval" className="font-normal">Use interim interval</Label>
                <Switch
                  id="use_interim_interval"
                  checked={formData.use_interim_interval}
                  onCheckedChange={(checked) => setFormData({ ...formData, use_interim_interval: checked })}
                />
              </div>

              {formData.use_interim_interval && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="interim_seconds" className="font-normal text-muted-foreground">Interim interval (seconds)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="interim_seconds"
                        type="number"
                        value={formData.interim_interval_seconds}
                        onChange={(e) => setFormData({ ...formData, interim_interval_seconds: parseInt(e.target.value) || 10 })}
                        className="w-20"
                      />
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="end_with_interim" className="font-normal text-muted-foreground">End with this interval</Label>
                    <Switch
                      id="end_with_interim"
                      checked={formData.end_with_interim}
                      onCheckedChange={(checked) => setFormData({ ...formData, end_with_interim: checked })}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    This interval will run between each interval
                  </p>
                </>
              )}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="text-sm font-medium text-muted-foreground">DISPLAY</div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show_line_numbers" className="font-normal">Show line numbers</Label>
                <Switch
                  id="show_line_numbers"
                  checked={formData.show_line_numbers}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_line_numbers: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show_elapsed_time" className="font-normal">Show elapsed time</Label>
                <Switch
                  id="show_elapsed_time"
                  checked={formData.show_elapsed_time}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_elapsed_time: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Timer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntervalTimer;
