import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  setFolderName: (name: string) => void;
  onCreateFolder: () => void;
}

const CreateFolderDialog = ({
  open,
  onOpenChange,
  folderName,
  setFolderName,
  onCreateFolder,
}: CreateFolderDialogProps) => {
  const { t } = useTranslation(['timer']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('new_folder')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            {t('enter_folder_name')}
          </p>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder={t('folder_name_placeholder')}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onCreateFolder();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setFolderName("");
              onOpenChange(false);
            }}
          >
            {t('cancel')}
          </Button>
          <Button onClick={onCreateFolder}>{t('ok')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
