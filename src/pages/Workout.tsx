import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, Plus, Clock, Flame } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WorkoutEntry {
  exercise: string;
  duration: number;
  calories: number;
  notes: string;
}

const Workout = () => {
  const { toast } = useToast();
  const [exercise, setExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");

  const todaysWorkouts: WorkoutEntry[] = [
    { exercise: "Morning Run", duration: 30, calories: 300, notes: "5K run at moderate pace" },
    { exercise: "Weight Training", duration: 45, calories: 250, notes: "Upper body focus - chest and arms" },
  ];

  const totalDuration = todaysWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = todaysWorkouts.reduce((sum, w) => sum + w.calories, 0);

  const handleAddWorkout = () => {
    if (!exercise || !duration) {
      toast({
        title: "Missing information",
        description: "Please provide at least exercise name and duration.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Workout logged",
      description: `${exercise} (${duration} min) has been added to your log.`,
    });

    setExercise("");
    setDuration("");
    setCalories("");
    setNotes("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Dumbbell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Workout Log</h1>
          <p className="text-muted-foreground">Track your daily exercises</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-card shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Total Duration</h3>
          </div>
          <p className="text-4xl font-bold text-primary mb-2">{totalDuration} min</p>
          <p className="text-muted-foreground">Active time today</p>
        </Card>

        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Calories Burned</h3>
          </div>
          <p className="text-4xl font-bold mb-2">{totalCalories}</p>
          <p className="opacity-90">Through exercise</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">Log Workout</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exercise">Exercise Name</Label>
              <Input
                id="exercise"
                placeholder="e.g., Running, Weight Training"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="calories">Estimated Calories Burned (optional)</Label>
            <Input
              id="calories"
              type="number"
              placeholder="e.g., 250"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add details about your workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 min-h-24"
            />
          </div>

          <Button onClick={handleAddWorkout} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Add Workout
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Today's Workouts</h3>
        <div className="space-y-3">
          {todaysWorkouts.length > 0 ? (
            todaysWorkouts.map((workout, idx) => (
              <div key={idx} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">{workout.exercise}</h4>
                  <span className="font-bold text-accent">{workout.calories} cal</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{workout.duration} min</span>
                  </div>
                </div>
                {workout.notes && (
                  <p className="text-sm text-muted-foreground">{workout.notes}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No workouts logged today. Start by adding one above!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Workout;
