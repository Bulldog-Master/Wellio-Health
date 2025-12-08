import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import type { TimerFolder } from "@/types/timer.types";

interface FolderSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: TimerFolder[];
  onSelectFolder: (folderId: string | null) => void;
  isPending?: boolean;
}

const FolderSelectionDialog = ({
  open,
  onOpenChange,
  folders,
  onSelectFolder,
  isPending = false,
}: FolderSelectionDialogProps) => {
  const { t } = useTranslation(['timer']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>{t('move_to_folder')}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <button
            onClick={() => onSelectFolder(null)}
            className="w-full p-4 text-left hover:bg-accent rounded-lg transition-colors"
            disabled={isPending}
          >
            <span className="text-foreground">{t('no_folder')}</span>
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className="w-full p-4 text-left hover:bg-accent rounded-lg transition-colors"
              disabled={isPending}
            >
              <span className="text-foreground">{folder.name}</span>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FolderSelectionDialog;
