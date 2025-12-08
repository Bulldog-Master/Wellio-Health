import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Trash2, Timer, Upload, Check, ChevronsUpDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { RoutineExercise } from "@/types/workout.types";

interface CreateRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRoutineId: string | null;
  routineName: string;
  routineDescription: string;
  routineExercises: RoutineExercise[];
  onRoutineNameChange: (name: string) => void;
  onRoutineDescriptionChange: (desc: string) => void;
  onRoutineExercisesChange: (exercises: RoutineExercise[]) => void;
  onSave: () => void;
  onCancel: () => void;
  allExercises: string[];
}

const CreateRoutineDialog = ({
  open,
  onOpenChange,
  editingRoutineId,
  routineName,
  routineDescription,
  routineExercises,
  onRoutineNameChange,
  onRoutineDescriptionChange,
  onRoutineExercisesChange,
  onSave,
  onCancel,
  allExercises,
}: CreateRoutineDialogProps) => {
  const { t } = useTranslation(['workout', 'common']);
  const { toast } = useToast();
  const [openExercisePopover, setOpenExercisePopover] = useState<number | null>(null);
  const [defaultRestTime, setDefaultRestTime] = useState(60);
  const [tempRestTime, setTempRestTime] = useState<string>('60');
  const [showRestTimeInput, setShowRestTimeInput] = useState(false);
  const [uploadingExerciseMedia, setUploadingExerciseMedia] = useState<number | null>(null);

  const handleAddExercise = () => {
    onRoutineExercisesChange([...routineExercises, { name: "", sets: 3, reps: 10, media_url: "", rest_seconds: defaultRestTime }]);
  };

  const handleUpdateExercise = (index: number, field: string, value: string | number) => {
    const updated = [...routineExercises];
    updated[index] = { ...updated[index], [field]: value };
    onRoutineExercisesChange(updated);
  };

  const handleRemoveExercise = (index: number) => {
    onRoutineExercisesChange(routineExercises.filter((_, i) => i !== index));
  };

  const handleExerciseMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>, exerciseIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingExerciseMedia(exerciseIndex);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/routines/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('workout-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('workout-media')
        .getPublicUrl(fileName);

      handleUpdateExercise(exerciseIndex, 'media_url', publicUrl);

      toast({ title: "Upload successful", description: "Exercise media has been uploaded." });
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading exercise media:', error);
      toast({ title: "Upload failed", description: "Failed to upload media.", variant: "destructive" });
      event.target.value = '';
    } finally {
      setUploadingExerciseMedia(null);
    }
  };

  const totalTime = routineExercises.reduce((total, ex) => total + (ex.duration || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-blue-900 dark:text-blue-100">
            {editingRoutineId ? t('edit_routine') : t('create_new_routine')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="routine-name">{t('routine_name')}</Label>
            <Input
              id="routine-name"
              placeholder={t('upper_body_day')}
              value={routineName}
              onChange={(e) => onRoutineNameChange(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="routine-description">{t('description')} ({t('optional')})</Label>
            <Textarea
              id="routine-description"
              placeholder={t('brief_description')}
              value={routineDescription}
              onChange={(e) => onRoutineDescriptionChange(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>{t('exercises')}</Label>
              <div className="flex gap-2">
                <Popover open={showRestTimeInput} onOpenChange={(open) => {
                  setShowRestTimeInput(open);
                  if (open) setTempRestTime(defaultRestTime.toString());
                }}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Timer className="w-3 h-3" />
                      {t('rest_time')}: {defaultRestTime}s
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">{t('default_rest_time')}</h4>
                      <Input
                        type="number"
                        min="0"
                        value={tempRestTime}
                        onChange={(e) => setTempRestTime(e.target.value)}
                        onBlur={() => setDefaultRestTime(Number(tempRestTime) || 60)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setDefaultRestTime(Number(tempRestTime) || 60);
                            setShowRestTimeInput(false);
                          }
                        }}
                        autoFocus
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" onClick={handleAddExercise} className="gap-2">
                  <Plus className="w-3 h-3" />
                  {t('add_exercise')}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {routineExercises.map((exercise, idx) => (
                <Card key={idx} className="p-3">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Popover modal={false} open={openExercisePopover === idx} onOpenChange={(open) => setOpenExercisePopover(open ? idx : null)}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="flex-1 justify-between">
                            {exercise.name || t('select_or_type_exercise')}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0 z-50">
                          <Command>
                            <CommandInput 
                              placeholder={t('search_or_type_exercise')}
                              value={exercise.name}
                              onValueChange={(value) => handleUpdateExercise(idx, 'name', value)}
                            />
                            <CommandList>
                              <CommandEmpty>{t('press_enter_to_use')} "{exercise.name}"</CommandEmpty>
                              <CommandGroup>
                                {allExercises.map((ex) => (
                                  <CommandItem
                                    key={ex}
                                    value={ex}
                                    onSelect={(currentValue) => {
                                      handleUpdateExercise(idx, 'name', currentValue);
                                      setOpenExercisePopover(null);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", exercise.name === ex ? "opacity-100" : "opacity-0")} />
                                    {ex}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveExercise(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">{t('sets')}</Label>
                        <Input type="number" placeholder="3" value={exercise.sets || ''} onChange={(e) => handleUpdateExercise(idx, 'sets', parseInt(e.target.value) || 0)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t('reps')}</Label>
                        <Input type="number" placeholder="10" value={exercise.reps || ''} onChange={(e) => handleUpdateExercise(idx, 'reps', parseInt(e.target.value) || 0)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t('duration_min')}</Label>
                        <Input type="number" placeholder="5" value={exercise.duration || ''} onChange={(e) => handleUpdateExercise(idx, 'duration', parseInt(e.target.value) || 0)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t('rest_time_seconds')}</Label>
                        <Input type="number" min="0" max="600" placeholder="60" value={exercise.rest_seconds || ''} onChange={(e) => handleUpdateExercise(idx, 'rest_seconds', parseInt(e.target.value) || 0)} className="mt-1" />
                      </div>
                    </div>

                    <div className="flex gap-2 items-start">
                      <input type="file" accept="image/*,video/*" onChange={(e) => handleExerciseMediaUpload(e, idx)} className="hidden" id={`exercise-media-${idx}`} disabled={uploadingExerciseMedia === idx} />
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => document.getElementById(`exercise-media-${idx}`)?.click()} disabled={uploadingExerciseMedia === idx}>
                        <Upload className="w-4 h-4" />
                        {uploadingExerciseMedia === idx ? t('uploading') : t('upload_media')}
                      </Button>
                      {exercise.media_url && (
                        <div className="w-16 h-16 rounded overflow-hidden bg-muted border">
                          {exercise.media_url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                            <video src={exercise.media_url} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={exercise.media_url} alt={exercise.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {routineExercises.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">{t('add_exercises_to_routine')}</p>
              )}
            </div>
          </div>

          {routineExercises.length > 0 && totalTime > 0 && (
            <Card className="p-3 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{t('total_workout_time')}</span>
                </div>
                <span className="text-lg font-bold text-primary">{totalTime} min</span>
              </div>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">{t('cancel')}</Button>
            <Button onClick={onSave} className="flex-1">
              {editingRoutineId ? t('update_routine') : t('save_routine')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoutineDialog;
