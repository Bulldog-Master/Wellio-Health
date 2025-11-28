import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar as CalendarIcon, ArrowLeft, Plus, Trash2, CheckCircle, Circle, GripVertical, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableWorkoutItemProps {
  workout: { week: number; day: number; name: string; exercises: string };
  idx: number;
  onUpdate: (idx: number, field: string, value: any) => void;
  onDelete: (idx: number) => void;
}

const SortableWorkoutItem = ({ workout, idx, onUpdate, onDelete }: SortableWorkoutItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `workout-${idx}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Week</Label>
              <Input
                type="number"
                min="1"
                value={workout.week}
                onChange={(e) => onUpdate(idx, 'week', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Day</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={workout.day}
                onChange={(e) => onUpdate(idx, 'day', parseInt(e.target.value))}
              />
            </div>
          </div>
          <Input
            placeholder="Workout name"
            value={workout.name}
            onChange={(e) => onUpdate(idx, 'name', e.target.value)}
          />
          <Textarea
            placeholder="Exercises (one per line)"
            value={workout.exercises}
            onChange={(e) => onUpdate(idx, 'exercises', e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(idx)}
          className="self-start"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

interface SortableProgramWorkoutProps {
  id: string;
  workout: any;
  isCompleted: boolean;
  onToggle: () => void;
}

const SortableProgramWorkout = ({ id, workout, isCompleted, onToggle }: SortableProgramWorkoutProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent/50"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      <div
        className="flex items-center gap-2 flex-1 cursor-pointer"
        onClick={onToggle}
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
    </div>
  );
};

const WorkoutPrograms = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [completions, setCompletions] = useState<Record<string, Completion[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_weeks: 4,
    workouts: [] as { week: number; day: number; name: string; exercises: string }[]
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);

      setFormData({
        ...formData,
        workouts: arrayMove(formData.workouts, oldIndex, newIndex)
      });
    }
  };

  const updateWorkout = (idx: number, field: string, value: any) => {
    const newWorkouts = [...formData.workouts];
    (newWorkouts[idx] as any)[field] = value;
    setFormData({ ...formData, workouts: newWorkouts });
  };

  const deleteWorkout = (idx: number) => {
    const newWorkouts = formData.workouts.filter((_, i) => i !== idx);
    setFormData({ ...formData, workouts: newWorkouts });
  };

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

      if (editingProgramId) {
        // Update existing program
        const { error } = await supabase
          .from('workout_programs')
          .update({
            name: formData.name,
            description: formData.description || null,
            duration_weeks: formData.duration_weeks,
            workouts: formData.workouts
          })
          .eq('id', editingProgramId);

        if (error) throw error;
        toast.success('Program updated!');
      } else {
        // Create new program
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
      }

      setShowCreate(false);
      setEditingProgramId(null);
      setFormData({ name: "", description: "", duration_weeks: 4, workouts: [] });
      fetchPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program');
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

  const handleProgramWorkoutReorder = async (event: DragEndEvent, programId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const program = programs.find(p => p.id === programId);
      if (!program) return;

      const oldIndex = parseInt(active.id.toString().split('-workout-')[1]);
      const newIndex = parseInt(over.id.toString().split('-workout-')[1]);

      const reorderedWorkouts = arrayMove(program.workouts, oldIndex, newIndex);

      // Update in database
      try {
        const { error } = await supabase
          .from('workout_programs')
          .update({ workouts: reorderedWorkouts })
          .eq('id', programId);

        if (error) throw error;

        // Update local state
        setPrograms(programs.map(p => 
          p.id === programId ? { ...p, workouts: reorderedWorkouts } : p
        ));

        toast.success('Workout order updated');
      } catch (error) {
        console.error('Error reordering workouts:', error);
        toast.error('Failed to reorder workouts');
      }
    }
  };

  const handleEditProgram = (program: WorkoutProgram) => {
    setFormData({
      name: program.name,
      description: program.description || "",
      duration_weeks: program.duration_weeks,
      workouts: program.workouts || []
    });
    setEditingProgramId(program.id);
    setShowCreate(true);
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

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Workout Programs</h1>
          <p className="text-muted-foreground">Create and manage your custom workout programs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/workout-templates")}>
            Browse Templates
          </Button>
          <Dialog open={showCreate} onOpenChange={(open) => {
            setShowCreate(open);
            if (!open) {
              setEditingProgramId(null);
              setFormData({ name: "", description: "", duration_weeks: 4, workouts: [] });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Program
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProgramId ? 'Edit' : 'Create'} Workout Program</DialogTitle>
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
                <div className="flex items-center justify-between">
                  <Label>Workouts</Label>
                  <span className="text-xs text-muted-foreground">Drag to reorder</span>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={formData.workouts.map((_, idx) => `workout-${idx}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {formData.workouts.map((workout, idx) => (
                        <SortableWorkoutItem
                          key={`workout-${idx}`}
                          workout={workout}
                          idx={idx}
                          onUpdate={updateWorkout}
                          onDelete={deleteWorkout}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <Button variant="outline" size="sm" onClick={addWorkoutToProgram} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Workout
                </Button>
              </div>

              <Button onClick={handleCreateProgram} className="w-full">
                {editingProgramId ? 'Update' : 'Create'} Program
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditProgram(program)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProgram(program.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
                    <h4 className="font-semibold text-sm flex items-center justify-between">
                      <span>Workouts</span>
                      <span className="text-xs text-muted-foreground font-normal">Drag to reorder</span>
                    </h4>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleProgramWorkoutReorder(event, program.id)}
                    >
                      <SortableContext
                        items={program.workouts.map((_: any, idx: number) => `program-${program.id}-workout-${idx}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {program.workouts.map((workout: any, idx: number) => {
                            const isCompleted = completions[program.id]?.some(
                              c => c.week_number === workout.week && c.day_number === workout.day
                            );

                            return (
                              <SortableProgramWorkout
                                key={`program-${program.id}-workout-${idx}`}
                                id={`program-${program.id}-workout-${idx}`}
                                workout={workout}
                                isCompleted={isCompleted}
                                onToggle={() => handleToggleCompletion(program.id, workout.week, workout.day)}
                              />
                            );
                          })}
                        </div>
                      </SortableContext>
                    </DndContext>
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
