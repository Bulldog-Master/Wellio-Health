import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dumbbell, Pencil, Trash2, Check, Plus, Clock, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { WorkoutRoutine } from "@/types/workout.types";

interface PersonalLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workoutRoutines: WorkoutRoutine[];
  onEditRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (id: string) => void;
  onLoadRoutine: (routine: WorkoutRoutine) => void;
  onCreateNew: () => void;
}

const PersonalLibraryDialog = ({
  open,
  onOpenChange,
  workoutRoutines,
  onEditRoutine,
  onDeleteRoutine,
  onLoadRoutine,
  onCreateNew,
}: PersonalLibraryDialogProps) => {
  const { t } = useTranslation(['workout', 'common']);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);
  const [librarySort, setLibrarySort] = useState<string>("date-newest");

  const sortedRoutines = [...workoutRoutines].sort((a, b) => {
    switch (librarySort) {
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "date-newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "date-oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default: return 0;
    }
  });

  const handleLoad = () => {
    const routine = workoutRoutines.find(r => r.id === selectedRoutineId);
    if (routine) {
      onLoadRoutine(routine);
      onOpenChange(false);
      setSelectedRoutineId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setSelectedRoutineId(null); }} modal={false}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-900 dark:text-purple-100 flex items-center justify-between">
            <span>{t('personal_library')}</span>
            <div className="flex gap-2 items-center">
              <Select value={librarySort} onValueChange={setLibrarySort}>
                <SelectTrigger className="w-[180px] bg-purple-100 dark:bg-purple-900/50">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-newest">{t('newest_first')}</SelectItem>
                  <SelectItem value="date-oldest">{t('oldest_first')}</SelectItem>
                  <SelectItem value="name-asc">{t('name_asc')}</SelectItem>
                  <SelectItem value="name-desc">{t('name_desc')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {sortedRoutines.length > 0 ? (
            <>
              <Accordion type="single" collapsible className="space-y-2">
                {sortedRoutines.map((routine) => {
                  const totalMinutes = routine.exercises.reduce((total, ex) => total + (ex.duration || 0), 0);
                  return (
                    <AccordionItem key={routine.id} value={routine.id} className={cn("border rounded-lg px-4 transition-all", selectedRoutineId === routine.id ? "bg-purple-100 dark:bg-purple-900/50 ring-2 ring-purple-500" : "bg-card")}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 py-4 cursor-pointer" onClick={() => setSelectedRoutineId(routine.id)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Dumbbell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base">{routine.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                                {totalMinutes > 0 && <span className="ml-2">• {totalMinutes} min</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <AccordionTrigger className="p-2" />
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEditRoutine(routine); }}>
                            <Pencil className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteRoutine(routine.id); }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <AccordionContent className="pt-2 pb-4">
                        {routine.description && <p className="text-sm text-muted-foreground mb-3">{routine.description}</p>}
                        {totalMinutes > 0 && (
                          <Card className="p-3 mb-3 bg-purple-500/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold text-sm">Total Workout Time:</span>
                              </div>
                              <span className="text-lg font-bold text-purple-600">{totalMinutes} min</span>
                            </div>
                          </Card>
                        )}
                        <div className="space-y-3">
                          {routine.exercises.map((exercise, idx) => (
                            <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <p className="font-medium">{exercise.name}</p>
                                  <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                                    {exercise.sets && exercise.reps && <span>{exercise.sets} sets × {exercise.reps} reps</span>}
                                    {exercise.duration && <span>{exercise.duration} min</span>}
                                  </div>
                                </div>
                                {exercise.media_url && (
                                  <div className="w-20 h-20 rounded overflow-hidden bg-muted border">
                                    {exercise.media_url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                                      <video src={exercise.media_url} className="w-full h-full object-cover" controls />
                                    ) : (
                                      <img src={exercise.media_url} alt={exercise.name} className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              {selectedRoutineId && (
                <div className="sticky bottom-0 p-4 bg-gradient-to-t from-purple-100 to-transparent dark:from-purple-950/50 border-t-2">
                  <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleLoad}>
                    <Check className="w-5 h-5 mr-2" />
                    Load Selected Routine
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No routines saved yet. Create your first routine!</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonalLibraryDialog;
