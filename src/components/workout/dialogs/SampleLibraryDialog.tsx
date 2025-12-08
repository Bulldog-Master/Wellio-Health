import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Plus, Trash2, Dumbbell } from "lucide-react";
import type { SampleRoutine, RoutineExercise } from "@/types/workout.types";

interface SampleLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sampleRoutines: SampleRoutine[];
  onCopyToLibrary: (routine: SampleRoutine) => void;
  onDeleteSample: (id: string) => void;
}

const SampleLibraryDialog = ({
  open,
  onOpenChange,
  sampleRoutines,
  onCopyToLibrary,
  onDeleteSample,
}: SampleLibraryDialogProps) => {
  const { t } = useTranslation(['workout', 'common']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {t('workout:sample_routines')}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {sampleRoutines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('workout:no_sample_routines')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sampleRoutines.map((routine) => (
                <Card key={routine.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{routine.name}</CardTitle>
                        {routine.description && (
                          <CardDescription>{routine.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCopyToLibrary(routine)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {t('workout:copy_to_library')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteSample(routine.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {routine.source_platform && (
                      <Badge variant="secondary" className="w-fit mt-2">
                        {routine.source_platform}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {routine.exercises.length} {t('workout:exercises')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {routine.exercises.slice(0, 5).map((exercise: RoutineExercise, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {exercise.name}
                            {exercise.sets && exercise.reps && ` (${exercise.sets}x${exercise.reps})`}
                          </Badge>
                        ))}
                        {routine.exercises.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{routine.exercises.length - 5} {t('common:more')}
                          </Badge>
                        )}
                      </div>
                      {routine.source_url && (
                        <a
                          href={routine.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t('workout:view_source')}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SampleLibraryDialog;
