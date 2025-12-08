import { Button } from "@/components/ui/button";
import { ArrowLeft, Timer, FolderPlus, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface TimerHeaderProps {
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  isSelectMoveMode: boolean;
  selectedTimerIds: string[];
  onCancelSelectMove: () => void;
  onMoveSelected: () => void;
  onOpenNewTimer: () => void;
  onOpenNewFolder: () => void;
  onOpenLibraryMenu: () => void;
}

const TimerHeader = ({
  currentFolderId,
  setCurrentFolderId,
  isSelectMoveMode,
  selectedTimerIds,
  onCancelSelectMove,
  onMoveSelected,
  onOpenNewTimer,
  onOpenNewFolder,
  onOpenLibraryMenu,
}: TimerHeaderProps) => {
  const { t } = useTranslation(['timer']);
  const navigate = useNavigate();

  return (
    <>
      {/* Back button */}
      <div className="p-4 pb-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => currentFolderId ? setCurrentFolderId(null) : navigate("/activity")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentFolderId ? t('back_to_library') : t('back_to_activity')}
        </Button>
      </div>

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Timer className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('library')}</h1>
        </div>
        
        {isSelectMoveMode ? (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancelSelectMove}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={onMoveSelected}
              disabled={selectedTimerIds.length === 0}
            >
              {t('move')} ({selectedTimerIds.length})
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onOpenNewTimer}
            >
              <Timer className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenNewFolder}
            >
              <FolderPlus className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onOpenLibraryMenu}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default TimerHeader;
