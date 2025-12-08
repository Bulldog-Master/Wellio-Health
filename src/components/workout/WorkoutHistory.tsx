import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Video, Upload, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { formatDistance } from "@/lib/unitConversion";
import type { ActivityLog, WorkoutMedia } from "@/types/workout.types";

interface WorkoutHistoryProps {
  activityLogs: ActivityLog[];
  workoutMedia: Record<string, WorkoutMedia[]>;
  isLoading: boolean;
  viewFilter: 'today' | 'week' | 'month' | 'all';
  preferredUnit: 'metric' | 'imperial';
  uploadingFiles: boolean;
  onViewFilterChange: (filter: 'today' | 'week' | 'month' | 'all') => void;
  onEditWorkout: (log: ActivityLog) => void;
  onDeleteWorkout: (id: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, activityLogId: string) => void;
}

const WorkoutHistory = ({
  activityLogs,
  workoutMedia,
  isLoading,
  viewFilter,
  preferredUnit,
  uploadingFiles,
  onViewFilterChange,
  onEditWorkout,
  onDeleteWorkout,
  onFileUpload,
}: WorkoutHistoryProps) => {
  const { t } = useTranslation(['workout', 'common']);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('workout_history')}</h3>
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as const).map((filter) => (
            <Button
              key={filter}
              variant={viewFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewFilterChange(filter)}
            >
              {t(filter)}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">{t('loading')}</p>
        ) : activityLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t('no_workouts_logged')} {viewFilter === 'today' ? t('today') : t('in_selected_period')}. {t('start_by_adding')}
          </p>
        ) : (
          activityLogs.map((log) => (
            <div key={log.id} className="p-4 bg-secondary rounded-lg border-l-4 border-primary">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-1">{log.activity_type}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-medium text-primary">
                      📅 {log.logged_at ? (() => {
                        const dateStr = log.logged_at.split('T')[0];
                        const [year, month, day] = dateStr.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        return format(date, 'MMMM d, yyyy');
                      })() : 'No date'}
                    </p>
                    {log.time_of_day && (
                      <span className="text-sm font-medium text-muted-foreground capitalize">
                        • {log.time_of_day}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{log.duration_minutes} min</span>
                    </div>
                    {log.distance_miles && (
                      <span>{formatDistance(log.distance_miles, preferredUnit)}</span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                  )}
                  {workoutMedia[log.id] && workoutMedia[log.id].length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {workoutMedia[log.id].map((media) => (
                        <a
                          key={media.id}
                          href={media.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
                        >
                          {media.file_type.startsWith('image/') ? (
                            <img src={media.file_url} alt="Workout" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <Video className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {log.calories_burned && (
                    <span className="font-bold text-accent">{log.calories_burned} cal</span>
                  )}
                  <input
                    type="file"
                    id={`upload-${log.id}`}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => onFileUpload(e, log.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => document.getElementById(`upload-${log.id}`)?.click()}
                    disabled={uploadingFiles}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditWorkout(log)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteWorkout(log.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default WorkoutHistory;
