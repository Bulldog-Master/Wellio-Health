import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Flame, Plus, Pencil, Library, BookOpen, Upload, Trash2, Image as ImageIcon, Dumbbell, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WorkoutRoutine } from "@/types/workout.types";

interface WorkoutFormProps {
  exercise: string;
  duration: string;
  intensity: string;
  distance: string;
  notes: string;
  workoutDate: string;
  timeOfDay: string;
  estimatedCalories: number;
  loadedRoutine: WorkoutRoutine | null;
  editingWorkout: string | null;
  preferredUnit: 'metric' | 'imperial';
  pendingMediaFiles: File[];
  mediaPreviewUrls: string[];
  onExerciseChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onIntensityChange: (value: string) => void;
  onDistanceChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onWorkoutDateChange: (value: string) => void;
  onTimeOfDayChange: (value: string) => void;
  onPreferredUnitChange: (value: 'metric' | 'imperial') => void;
  onLoadedRoutineClear: () => void;
  onCancelEdit: () => void;
  onSubmit: () => void;
  onShowLibrary: () => void;
  onShowSampleLibrary: () => void;
  onMediaFilesChange: (files: File[], urls: string[]) => void;
}

const WorkoutForm = ({
  exercise,
  duration,
  intensity,
  distance,
  notes,
  workoutDate,
  timeOfDay,
  estimatedCalories,
  loadedRoutine,
  editingWorkout,
  preferredUnit,
  pendingMediaFiles,
  mediaPreviewUrls,
  onExerciseChange,
  onDurationChange,
  onIntensityChange,
  onDistanceChange,
  onNotesChange,
  onWorkoutDateChange,
  onTimeOfDayChange,
  onPreferredUnitChange,
  onLoadedRoutineClear,
  onCancelEdit,
  onSubmit,
  onShowLibrary,
  onShowSampleLibrary,
  onMediaFilesChange,
}: WorkoutFormProps) => {
  const { t } = useTranslation(['workout', 'common', 'fitness']);

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const newUrls = newFiles.map(f => URL.createObjectURL(f));
    onMediaFilesChange(
      [...pendingMediaFiles, ...newFiles],
      [...mediaPreviewUrls, ...newUrls]
    );
    e.target.value = '';
  };

  const handleMediaRemove = (idx: number) => {
    URL.revokeObjectURL(mediaPreviewUrls[idx]);
    onMediaFilesChange(
      pendingMediaFiles.filter((_, i) => i !== idx),
      mediaPreviewUrls.filter((_, i) => i !== idx)
    );
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {editingWorkout ? t('edit') : t('log_workout')}
        </h3>
        {!editingWorkout && (
          <Popover modal={false}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className="gap-2 group">
                <span style={{ color: 'hsl(35, 100%, 58%)' }} className="flex">
                  <Library className="w-4 h-4 transition-all group-hover:drop-shadow-[0_0_8px_hsl(35_100%_58%)]" />
                </span>
                {t('load_routine')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="default" className="justify-start" onClick={onShowLibrary}>
                  <Library className="w-4 h-4 mr-2" />
                  {t('personal_library')}
                </Button>
                <Button variant="ghost" size="default" className="justify-start" onClick={onShowSampleLibrary}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t('sample_library')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="exercise">{t('activity_type')}</Label>
          <Select value={exercise} onValueChange={onExerciseChange}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder={t('select_activity_type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Running">{t('running')}</SelectItem>
              <SelectItem value="Cycling">{t('cycling')}</SelectItem>
              <SelectItem value="Swimming">{t('swimming')}</SelectItem>
              <SelectItem value="Walking">{t('walking')}</SelectItem>
              <SelectItem value="Hiking">{t('hiking')}</SelectItem>
              <SelectItem value="Weightlifting">{t('weightlifting')}</SelectItem>
              <SelectItem value="Yoga">{t('yoga')}</SelectItem>
              <SelectItem value="HIIT">{t('hiit')}</SelectItem>
              <SelectItem value="Other">{t('other')}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            className="mt-2"
            placeholder={t('or_type_custom_activity')}
            value={exercise && !["Running", "Cycling", "Swimming", "Walking", "Hiking", "Weightlifting", "Yoga", "HIIT", "Other", ""].includes(exercise) ? exercise : ""}
            onChange={(e) => onExerciseChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="workout-date">{t('date')}</Label>
            <Input
              id="workout-date"
              type="date"
              value={workoutDate}
              onChange={(e) => onWorkoutDateChange(e.target.value)}
              className="w-full mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="time-of-day">{t('time_of_day')}</Label>
            <Select value={timeOfDay} onValueChange={onTimeOfDayChange}>
              <SelectTrigger id="time-of-day" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">{t('morning')}</SelectItem>
                <SelectItem value="afternoon">{t('afternoon')}</SelectItem>
                <SelectItem value="evening">{t('evening')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">{t('duration_minutes')}</Label>
            <Input
              id="duration"
              type="number"
              placeholder="30"
              value={duration}
              onChange={(e) => onDurationChange(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="intensity">{t('intensity')}</Label>
            <Select value={intensity} onValueChange={onIntensityChange}>
              <SelectTrigger id="intensity" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('low')}</SelectItem>
                <SelectItem value="medium">{t('medium')}</SelectItem>
                <SelectItem value="high">{t('high')}</SelectItem>
                <SelectItem value="intense">{t('intense')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {estimatedCalories > 0 && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              {t('estimated')} <span className="text-primary">{estimatedCalories} {t('calories')}</span>
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="distance">{t('distance_optional')}</Label>
          <Input
            id="distance"
            type="number"
            step="0.1"
            placeholder="5.0"
            value={distance}
            onChange={(e) => onDistanceChange(e.target.value)}
            className="mt-1.5"
          />
          <div className="flex items-center justify-center gap-4 mt-3 p-4 rounded-xl bg-secondary/50 border-2 border-primary/30">
            <span className="text-sm font-semibold text-foreground">{t('fitness:unit')}:</span>
            <div className="inline-flex rounded-xl overflow-hidden border-2 border-primary shadow-lg" role="group" aria-label="Distance unit selector">
              <button
                type="button"
                className={`px-6 py-3 text-base font-bold transition-all duration-200 min-w-[60px] ${
                  preferredUnit === 'metric' 
                    ? 'bg-primary text-primary-foreground shadow-inner' 
                    : 'bg-background text-foreground hover:bg-primary/20 border-r border-primary/50'
                }`}
                onClick={() => onPreferredUnitChange('metric')}
                aria-pressed={preferredUnit === 'metric'}
              >
                km
              </button>
              <button
                type="button"
                className={`px-6 py-3 text-base font-bold transition-all duration-200 min-w-[60px] ${
                  preferredUnit === 'imperial' 
                    ? 'bg-primary text-primary-foreground shadow-inner' 
                    : 'bg-background text-foreground hover:bg-primary/20'
                }`}
                onClick={() => onPreferredUnitChange('imperial')}
                aria-pressed={preferredUnit === 'imperial'}
              >
                mi
              </button>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">{t('notes_optional')}</Label>
          <Textarea
            id="notes"
            placeholder={t('add_workout_details')}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="mt-1.5 min-h-24"
          />
        </div>

        {loadedRoutine && (
          <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-primary" />
                {t('loaded_routine')} {loadedRoutine.name}
              </h4>
              <Button variant="ghost" size="sm" onClick={onLoadedRoutineClear}>
                {t('clear')}
              </Button>
            </div>
            {loadedRoutine.description && (
              <p className="text-sm text-muted-foreground mb-3">{loadedRoutine.description}</p>
            )}
            <div className="space-y-2">
              {loadedRoutine.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{ex.name}</p>
                    <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                      {ex.sets && ex.reps && (
                        <span className="flex items-center gap-1">
                          <span className="font-semibold">{ex.sets}</span> sets × <span className="font-semibold">{ex.reps}</span> reps
                        </span>
                      )}
                      {ex.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-semibold">{ex.duration}</span> min
                        </span>
                      )}
                    </div>
                  </div>
                  {ex.media_url && (
                    <div className="w-16 h-16 rounded overflow-hidden bg-muted border">
                      {ex.media_url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                        <video src={ex.media_url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={ex.media_url} alt={ex.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Upload Section */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            {t('add_media')}
          </Label>
          <div className="flex flex-wrap gap-2">
            {mediaPreviewUrls.map((url, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                {pendingMediaFiles[idx]?.type.startsWith('video/') ? (
                  <video src={url} className="w-full h-full object-cover" />
                ) : (
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-5 h-5"
                  onClick={() => handleMediaRemove(idx)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">{t('add_photos_videos', { ns: 'workout' })}</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleMediaAdd}
              />
            </label>
          </div>
          {pendingMediaFiles.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {pendingMediaFiles.length} {t('files_selected', { ns: 'workout' })}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {editingWorkout && (
            <Button variant="outline" onClick={onCancelEdit} className="flex-1">
              {t('cancel')}
            </Button>
          )}
          <Button onClick={onSubmit} className="flex-1 gap-2">
            {editingWorkout ? (
              <>
                <Pencil className="w-4 h-4" />
                {t('update_workout')}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t('add_workout')}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WorkoutForm;
