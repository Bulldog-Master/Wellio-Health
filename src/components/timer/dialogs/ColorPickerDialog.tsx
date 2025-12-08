import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { COLOR_OPTIONS } from "@/types/timer.types";

interface ColorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentColor: string;
  onColorSelect: (colorId: string) => void;
}

const ColorPickerDialog = ({
  open,
  onOpenChange,
  currentColor,
  onColorSelect,
}: ColorPickerDialogProps) => {
  const { t } = useTranslation(['timer']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background p-0">
        <div className="sticky top-0 bg-background border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => onOpenChange(false)}
              className="text-primary flex items-center gap-2"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">{t('interim_interval')}</span>
            </button>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
            {t('select_background_color')}
          </h3>
          <div className="space-y-1">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.id}
                onClick={() => {
                  onColorSelect(color.id);
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-between py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {color.hex && (
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: color.hex }}
                    />
                  )}
                  <span className="text-lg text-foreground">{color.name}</span>
                </div>
                {currentColor === color.id && (
                  <span className="text-primary text-2xl">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorPickerDialog;
