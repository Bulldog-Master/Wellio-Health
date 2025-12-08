import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkoutPrograms } from "@/hooks/workout-programs";
import { ProgramCard, ProgramFormDialog, WorkoutFormData, WorkoutProgram } from "@/components/workout-programs";

const WorkoutPrograms = () => {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingFormData, setEditingFormData] = useState<WorkoutFormData | undefined>();
  const [sortBy, setSortBy] = useState<string>("date-newest");

  const {
    programs,
    completions,
    loading,
    saveProgram,
    deleteProgram,
    toggleCompletion,
    reorderWorkouts,
    calculateProgress
  } = useWorkoutPrograms();

  const handleEditProgram = (program: WorkoutProgram) => {
    setEditingFormData({
      name: program.name,
      description: program.description || "",
      duration_weeks: program.duration_weeks,
      workouts: program.workouts || []
    });
    setEditingProgramId(program.id);
    setShowCreate(true);
  };

  const handleSave = async (formData: WorkoutFormData) => {
    const success = await saveProgram(formData, editingProgramId);
    if (success) {
      setEditingProgramId(null);
      setEditingFormData(undefined);
    }
    return success;
  };

  const handleOpenChange = (open: boolean) => {
    setShowCreate(open);
    if (!open) {
      setEditingProgramId(null);
      setEditingFormData(undefined);
    }
  };

  const sortedPrograms = [...programs].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-newest":
        return new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime();
      case "date-oldest":
        return new Date(a.start_date || 0).getTime() - new Date(b.start_date || 0).getTime();
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3 p-4 border border-border rounded-lg">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        <div className="flex gap-2 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-newest">Newest First</SelectItem>
              <SelectItem value="date-oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate("/workout-templates")}>
            Browse Templates
          </Button>
          <ProgramFormDialog
            open={showCreate}
            onOpenChange={handleOpenChange}
            editingProgramId={editingProgramId}
            initialData={editingFormData}
            onSave={handleSave}
          />
        </div>
      </div>

      {programs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No workout programs yet</p>
          <Button onClick={() => setShowCreate(true)}>Create Your First Program</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              completions={completions[program.id] || []}
              progress={calculateProgress(program)}
              onEdit={() => handleEditProgram(program)}
              onDelete={() => deleteProgram(program.id)}
              onToggleCompletion={(week, day) => toggleCompletion(program.id, week, day)}
              onReorderWorkouts={(reordered) => reorderWorkouts(program.id, reordered)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutPrograms;
