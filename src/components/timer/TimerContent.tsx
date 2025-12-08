import { FolderPlus, MoreHorizontal, GripVertical, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import type { TimerInterval, TimerFolder, IntervalTimerData } from "@/types/timer.types";
import type { Json } from "@/integrations/supabase/types";

// Database return type (intervals are Json)
interface DatabaseTimer {
  id: string;
  name: string;
  intervals: Json | null;
  repeat_count: number | null;
  folder_id: string | null;
  user_id: string;
  created_at: string | null;
  updated_at?: string | null;
  countdown_beeps: boolean | null;
  end_with_interim: boolean | null;
  include_reps: boolean | null;
  include_sets: boolean | null;
  interim_interval_seconds: number | null;
  show_elapsed_time: boolean | null;
  show_line_numbers: boolean | null;
  text_to_speech: boolean | null;
  use_for_notifications: boolean | null;
  use_interim_interval: boolean | null;
}

interface TimerContentProps {
  currentFolderId: string | null;
  folders: TimerFolder[];
  timers: DatabaseTimer[];
  isSelectMoveMode: boolean;
  isMoveMode: boolean;
  selectedTimerIds: string[];
  selectedMoveTimerId: string | null;
  draggedTimerIndex: number | null;
  onFolderClick: (folderId: string) => void;
  onFolderMenuClick: (folderId: string) => void;
  onTimerSelect: (timer: IntervalTimerData) => void;
  onTimerCheckToggle: (timerId: string) => void;
  onMoveTimerSelect: (timerId: string) => void;
  onDragStart: (index: number, timerId: string, e: React.DragEvent) => void;
  onDragOver: (index: number, e: React.DragEvent) => void;
  onDrop: (index: number, e: React.DragEvent) => void;
  onDragEnd: () => void;
}

// Helper to safely parse intervals from Json
const parseIntervals = (intervals: Json | null): TimerInterval[] => {
  if (!intervals || !Array.isArray(intervals)) return [];
  return intervals as unknown as TimerInterval[];
};

// Helper to convert database timer to IntervalTimerData
const toIntervalTimerData = (timer: DatabaseTimer): IntervalTimerData => ({
  id: timer.id,
  name: timer.name,
  user_id: timer.user_id,
  intervals: parseIntervals(timer.intervals),
  repeat_count: timer.repeat_count ?? 1,
  folder_id: timer.folder_id,
  created_at: timer.created_at ?? undefined,
  text_to_speech: timer.text_to_speech ?? false,
  countdown_beeps: timer.countdown_beeps ?? false,
  use_for_notifications: timer.use_for_notifications ?? false,
  use_interim_interval: timer.use_interim_interval ?? false,
  interim_interval_seconds: timer.interim_interval_seconds ?? 10,
  end_with_interim: timer.end_with_interim ?? false,
  show_line_numbers: timer.show_line_numbers ?? false,
  show_elapsed_time: timer.show_elapsed_time ?? false,
  include_reps: timer.include_reps ?? false,
  include_sets: timer.include_sets ?? false,
});

const TimerContent = ({
  currentFolderId,
  folders,
  timers,
  isSelectMoveMode,
  isMoveMode,
  selectedTimerIds,
  selectedMoveTimerId,
  draggedTimerIndex,
  onFolderClick,
  onFolderMenuClick,
  onTimerSelect,
  onTimerCheckToggle,
  onMoveTimerSelect,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TimerContentProps) => {
  const { t } = useTranslation(['timer']);

  const formatDuration = (intervals: TimerInterval[], repeatCount: number = 1) => {
    if (!intervals || intervals.length === 0) return "00:00";
    const totalSeconds = intervals.reduce((sum, interval) => sum + (interval.duration || 0), 0) * repeatCount;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Convert database timers to our app format
  const convertedTimers = timers.map(toIntervalTimerData);

  return (
    <div className="p-4">
      {/* Folders Section */}
      {!currentFolderId && folders.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            {t('folders')}
          </h2>
          <div className="space-y-0 divide-y divide-border mb-6">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center justify-between py-4"
              >
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-accent/30 -m-4 p-4"
                  onClick={() => onFolderClick(folder.id)}
                >
                  <FolderPlus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-lg font-medium text-foreground">
                    {folder.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFolderMenuClick(folder.id);
                  }}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Timers Section */}
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">
        {t('timers')}
      </h2>

      <div className="space-y-0 divide-y divide-border">
        {convertedTimers.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            {t('no_timers_yet')}
          </p>
        ) : (
          convertedTimers.map((timer, index) => (
            <div
              key={timer.id}
              draggable={selectedMoveTimerId === timer.id}
              onDragStart={(e) => onDragStart(index, timer.id, e)}
              onDragOver={(e) => onDragOver(index, e)}
              onDrop={(e) => onDrop(index, e)}
              onDragEnd={onDragEnd}
              onClick={() => {
                if (isMoveMode && !selectedMoveTimerId) {
                  onMoveTimerSelect(timer.id);
                }
              }}
              className={`flex items-center gap-3 py-4 transition-all ${
                draggedTimerIndex === index ? 'opacity-50' : ''
              } ${selectedMoveTimerId === timer.id ? 'bg-accent/50 cursor-move select-none' : ''} ${
                isMoveMode && !selectedMoveTimerId ? 'cursor-pointer hover:bg-accent/30' : ''
              }`}
            >
              {isSelectMoveMode && (
                <Checkbox
                  checked={selectedTimerIds.includes(timer.id)}
                  onCheckedChange={() => onTimerCheckToggle(timer.id)}
                  className="mr-2"
                />
              )}
              
              {selectedMoveTimerId === timer.id && (
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              )}
              
              <button
                className="flex-1 text-left"
                onClick={(e) => {
                  if (!isSelectMoveMode && !isMoveMode) {
                    e.stopPropagation();
                    onTimerSelect(timer);
                  }
                }}
                disabled={isSelectMoveMode || isMoveMode}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-medium text-foreground block">
                      {timer.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {timer.intervals?.length || 0} {t('intervals_count')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(timer.intervals || [], timer.repeat_count || 1)}</span>
                  </div>
                </div>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TimerContent;