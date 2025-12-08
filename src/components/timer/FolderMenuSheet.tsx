import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface FolderMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteFolder: () => void;
}

const FolderMenuSheet = ({
  open,
  onOpenChange,
  onDeleteFolder,
}: FolderMenuSheetProps) => {
  const { t } = useTranslation(['timer']);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="p-0 border-t border-border rounded-t-xl"
        overlayClassName="bg-transparent pointer-events-none"
      >
        <div className="flex flex-col">
          <button
            className="py-4 px-6 text-center text-destructive hover:bg-accent transition-colors text-base"
            onClick={() => {
              onOpenChange(false);
              onDeleteFolder();
            }}
          >
            {t('delete_folder')}
          </button>
          <Separator />
          <button
            className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
            onClick={() => onOpenChange(false)}
          >
            {t('cancel')}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FolderMenuSheet;
