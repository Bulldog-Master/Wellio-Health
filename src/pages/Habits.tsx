import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Target, Plus, Check, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Habit {
  id: string;
  name: string;
  description: string | null;
  target_frequency: string;
  target_count: number | null;
  icon: string | null;
  color: string | null;
  is_active: boolean | null;
}

interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_at: string | null;
}

const Habits = () => {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_frequency: "daily",
    target_count: "1",
  });

  useEffect(() => {
    fetchHabits();
    fetchTodayCompletions();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', today.toISOString());

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  const handleAddHabit = async () => {
    if (!formData.name) {
      toast({
        title: "Missing information",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          target_frequency: formData.target_frequency,
          target_count: parseInt(formData.target_count),
        });

      if (error) throw error;

      toast({
        title: "Habit created",
        description: `${formData.name} has been added to your habits.`,
      });

      setFormData({ name: "", description: "", target_frequency: "daily", target_count: "1" });
      setShowAddForm(false);
      fetchHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
      toast({
        title: "Error",
        description: "Failed to add habit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
        });

      if (error) throw error;

      toast({
        title: "Habit completed",
        description: "Great job staying consistent!",
      });

      fetchTodayCompletions();
    } catch (error) {
      console.error('Error completing habit:', error);
      toast({
        title: "Error",
        description: "Failed to complete habit.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', habitId);

      if (error) throw error;

      toast({
        title: "Habit removed",
        description: "The habit has been removed from your list.",
      });

      fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: "Error",
        description: "Failed to delete habit.",
        variant: "destructive",
      });
    }
  };

  const isHabitCompleted = (habitId: string) => {
    return completions.some(c => c.habit_id === habitId);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Habit Tracker</h1>
            <p className="text-muted-foreground">Build consistent healthy habits</p>
          </div>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Habit
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-6">New Habit</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="habit-name">Habit Name</Label>
              <Input
                id="habit-name"
                placeholder="e.g., Drink 8 glasses of water"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="habit-description">Description (optional)</Label>
              <Textarea
                id="habit-description"
                placeholder="Add any details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1.5 min-h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddHabit}>Create Habit</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Today's Habits</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : habits.length > 0 ? (
            habits.map((habit) => {
              const completed = isHabitCompleted(habit.id);
              return (
                <div key={habit.id} className="p-4 bg-secondary rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      size="icon"
                      variant={completed ? "default" : "outline"}
                      onClick={() => !completed && handleCompleteHabit(habit.id)}
                      disabled={completed}
                      className={completed ? "bg-primary" : ""}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <div>
                      <h4 className="font-semibold">{habit.name}</h4>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteHabit(habit.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No habits yet. Create one to get started!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Habits;
