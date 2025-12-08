import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface LibraryMenuSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMove: () => void;
  onMoveToFolder: () => void;
  onEdit: () => void;
}

const LibraryMenuSheet = ({
  open,
  onOpenChange,
  onMove,
  onMoveToFolder,
  onEdit,
}: LibraryMenuSheetProps) => {
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
            className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
            onClick={() => {
              onOpenChange(false);
              onMove();
            }}
          >
            {t('move')}
          </button>
          <Separator />
          <button
            className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
            onClick={() => {
              onOpenChange(false);
              onMoveToFolder();
            }}
          >
            {t('move_to_folder')}
          </button>
          <Separator />
          <button
            className="py-4 px-6 text-center text-primary hover:bg-accent transition-colors text-base"
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
          >
            {t('edit')}
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

export default LibraryMenuSheet;
