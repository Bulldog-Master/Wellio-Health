import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ArrowLeft, Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface WorkoutProgram {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  start_date: string | null;
  workouts: any[];
  is_active: boolean;
}

interface Completion {
  week_number: number;
  day_number: number;
}

const WorkoutPrograms = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [completions, setCompletions] = useState<Record<string, Completion[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_weeks: 4,
    workouts: [] as { week: number; day: number; name: string; exercises: string }[]
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: programsData, error: programsError } = await supabase
        .from('workout_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (programsError) throw programsError;
      setPrograms((programsData || []).map(p => ({
        ...p,
        workouts: (p.workouts as any[]) || []
      })));

      // Fetch completions for each program
      if (programsData && programsData.length > 0) {
        const completionsMap: Record<string, Completion[]> = {};
        
        for (const program of programsData) {
          const { data: completionsData } = await supabase
            .from('program_completions')
            .select('week_number, day_number')
            .eq('program_id', program.id);
          
          completionsMap[program.id] = completionsData || [];
        }
        
        setCompletions(completionsMap);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('workout_programs')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          duration_weeks: formData.duration_weeks,
          start_date: format(new Date(), 'yyyy-MM-dd'),
          workouts: formData.workouts
        });

      if (error) throw error;

      toast.success('Program created!');
      setShowCreate(false);
      setFormData({ name: "", description: "", duration_weeks: 4, workouts: [] });
      fetchPrograms();
    } catch (error) {
      console.error('Error creating program:', error);
      toast.error('Failed to create program');
    }
  };

  const handleToggleCompletion = async (programId: string, week: number, day: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isCompleted = completions[programId]?.some(
        c => c.week_number === week && c.day_number === day
      );

      if (isCompleted) {
        const { error } = await supabase
          .from('program_completions')
          .delete()
          .eq('program_id', programId)
          .eq('week_number', week)
          .eq('day_number', day);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('program_completions')
          .insert({
            user_id: user.id,
            program_id: programId,
            week_number: week,
            day_number: day
          });

        if (error) throw error;
      }

      fetchPrograms();
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast.error('Failed to update completion');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workout_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Program deleted');
      fetchPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('Failed to delete program');
    }
  };

  const addWorkoutToProgram = () => {
    setFormData({
      ...formData,
      workouts: [
        ...formData.workouts,
        { week: 1, day: 1, name: "", exercises: "" }
      ]
    });
  };

  const calculateProgress = (program: WorkoutProgram) => {
    const totalDays = program.duration_weeks * 7;
    const completedDays = completions[program.id]?.length || 0;
    return (completedDays / totalDays) * 100;
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Workout Programs</h1>
            <p className="text-muted-foreground">Multi-week training programs</p>
          </div>
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Workout Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Program Name</Label>
                <Input
                  placeholder="e.g., 12-Week Strength Builder"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your program..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Duration (weeks)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Workouts</Label>
                {formData.workouts.map((workout, idx) => (
                  <Card key={idx} className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Week</Label>
                        <Input
                          type="number"
                          min="1"
                          value={workout.week}
                          onChange={(e) => {
                            const newWorkouts = [...formData.workouts];
                            newWorkouts[idx].week = parseInt(e.target.value);
                            setFormData({ ...formData, workouts: newWorkouts });
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Day</Label>
                        <Input
                          type="number"
                          min="1"
                          max="7"
                          value={workout.day}
                          onChange={(e) => {
                            const newWorkouts = [...formData.workouts];
                            newWorkouts[idx].day = parseInt(e.target.value);
                            setFormData({ ...formData, workouts: newWorkouts });
                          }}
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="Workout name"
                      value={workout.name}
                      onChange={(e) => {
                        const newWorkouts = [...formData.workouts];
                        newWorkouts[idx].name = e.target.value;
                        setFormData({ ...formData, workouts: newWorkouts });
                      }}
                    />
                    <Textarea
                      placeholder="Exercises (one per line)"
                      value={workout.exercises}
                      onChange={(e) => {
                        const newWorkouts = [...formData.workouts];
                        newWorkouts[idx].exercises = e.target.value;
                        setFormData({ ...formData, workouts: newWorkouts });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newWorkouts = formData.workouts.filter((_, i) => i !== idx);
                        setFormData({ ...formData, workouts: newWorkouts });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card>
                ))}
                <Button variant="outline" size="sm" onClick={addWorkoutToProgram} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workout
                </Button>
              </div>

              <Button onClick={handleCreateProgram} className="w-full">
                Create Program
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {programs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No workout programs yet</p>
          <Button onClick={() => setShowCreate(true)}>Create Your First Program</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {programs.map((program) => {
            const progress = calculateProgress(program);
            
            return (
              <Card key={program.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{program.name}</h3>
                    {program.description && (
                      <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {program.duration_weeks} weeks • Started {program.start_date ? format(new Date(program.start_date), 'MMM dd, yyyy') : 'Not started'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProgram(program.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                {program.workouts && program.workouts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Workouts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {program.workouts.map((workout: any, idx: number) => {
                        const isCompleted = completions[program.id]?.some(
                          c => c.week_number === workout.week && c.day_number === workout.day
                        );

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent/50"
                            onClick={() => handleToggleCompletion(program.id, workout.week, workout.day)}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{workout.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Week {workout.week}, Day {workout.day}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkoutPrograms;
