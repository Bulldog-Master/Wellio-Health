import { FolderPlus, MoreHorizontal, GripVertical, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import type { TimerInterval } from "@/types/timer.types";

interface TimerFolder {
  id: string;
  name: string;
}

interface TimerData {
  id: string;
  name: string;
  intervals: TimerInterval[];
  repeat_count?: number;
}

interface TimerContentProps {
  currentFolderId: string | null;
  folders: TimerFolder[];
  timers: TimerData[];
  isSelectMoveMode: boolean;
  isMoveMode: boolean;
  selectedTimerIds: string[];
  selectedMoveTimerId: string | null;
  draggedTimerIndex: number | null;
  onFolderClick: (folderId: string) => void;
  onFolderMenuClick: (folderId: string) => void;
  onTimerSelect: (timer: TimerData) => void;
  onTimerCheckToggle: (timerId: string) => void;
  onMoveTimerSelect: (timerId: string) => void;
  onDragStart: (index: number, timerId: string, e: React.DragEvent) => void;
  onDragOver: (index: number, e: React.DragEvent) => void;
  onDrop: (index: number, e: React.DragEvent) => void;
  onDragEnd: () => void;
}

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
        {timers.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            {t('no_timers_yet')}
          </p>
        ) : (
          timers.map((timer, index) => (
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