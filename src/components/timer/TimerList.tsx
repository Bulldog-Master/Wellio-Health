import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Folder, Timer, MoreHorizontal, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import type { TimerFolder } from "@/types/timer.types";

interface TimerListProps {
  timers: any[];
  folders: TimerFolder[];
  currentFolderId: string | null;
  isSelectMoveMode: boolean;
  isEditMode: boolean;
  selectedTimerIds: string[];
  onToggleTimerSelection: (timerId: string) => void;
  onTimerSelect: (timer: any) => void;
  onFolderClick: (folderId: string) => void;
  onFolderMenuClick: (folderId: string) => void;
  onDeleteTimer: (timerId: string) => void;
  formatDuration: (intervals: any, repeatCount?: number) => string;
}

const TimerList = ({
  timers,
  folders,
  currentFolderId,
  isSelectMoveMode,
  isEditMode,
  selectedTimerIds,
  onToggleTimerSelection,
  onTimerSelect,
  onFolderClick,
  onFolderMenuClick,
  onDeleteTimer,
  formatDuration,
}: TimerListProps) => {
  const { t } = useTranslation(['timer']);

  return (
    <div className="p-4 space-y-4">
      {/* Show folders only at root level */}
      {!currentFolderId && folders.map((folder) => (
        <Card 
          key={folder.id}
          className="bg-card hover:bg-accent/50 transition-colors cursor-pointer"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div 
              className="flex items-center gap-3 flex-1"
              onClick={() => onFolderClick(folder.id)}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-medium text-foreground">{folder.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onFolderMenuClick(folder.id);
              }}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Timers */}
      {timers.map((timer, index) => (
        <Card 
          key={timer.id}
          className={`bg-card hover:bg-accent/50 transition-colors ${
            isSelectMoveMode ? 'cursor-pointer' : ''
          } ${selectedTimerIds.includes(timer.id) ? 'ring-2 ring-primary' : ''}`}
          onClick={() => {
            if (isSelectMoveMode) {
              onToggleTimerSelection(timer.id);
            } else if (!isEditMode) {
              onTimerSelect(timer);
            }
          }}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {isSelectMoveMode && (
                <Checkbox
                  checked={selectedTimerIds.includes(timer.id)}
                  onCheckedChange={() => onToggleTimerSelection(timer.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {isEditMode && (
                <div className="cursor-grab">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-lg font-medium text-foreground block">{timer.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDuration(timer.intervals, timer.repeat_count)}
                </span>
              </div>
            </div>
            {isEditMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTimer(timer.id);
                }}
              >
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Empty state */}
      {timers.length === 0 && (currentFolderId || folders.length === 0) && (
        <div className="text-center py-12">
          <Timer className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t('no_timers')}</p>
        </div>
      )}
    </div>
  );
};

export default TimerList;
