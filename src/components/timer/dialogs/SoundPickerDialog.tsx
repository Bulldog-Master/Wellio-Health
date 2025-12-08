import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SOUND_OPTIONS } from "@/types/timer.types";

interface SoundPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSound: string;
  onSoundSelect: (soundId: string) => void;
  playSound: (soundId: string) => void;
  title?: string;
}

const SoundPickerDialog = ({
  open,
  onOpenChange,
  currentSound,
  onSoundSelect,
  playSound,
  title = "Sounds",
}: SoundPickerDialogProps) => {
  const { t } = useTranslation(['timer']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background p-0">
        <div className="sticky top-0 bg-background border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => onOpenChange(false)}
              className="text-primary flex items-center gap-2"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">{t('back')}</span>
            </button>
            <h2 className="text-xl font-semibold text-foreground absolute left-1/2 transform -translate-x-1/2">
              {title}
            </h2>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="p-6">
          {/* No sound option */}
          <button
            onClick={() => {
              onSoundSelect('none');
              onOpenChange(false);
            }}
            className="w-full flex items-center justify-between py-4 border-b border-border hover:bg-muted/50 transition-colors"
          >
            <span className="text-lg text-foreground">{t('no_sound')}</span>
            {currentSound === 'none' && (
              <span className="text-primary text-2xl">✓</span>
            )}
          </button>

          <h3 className="text-sm text-muted-foreground mt-6 mb-4 uppercase tracking-wider">
            {t('select_a_sound')}
          </h3>
          <div className="space-y-1">
            {SOUND_OPTIONS.filter(s => s.id !== 'none').map((sound) => (
              <button
                key={sound.id}
                onClick={() => {
                  playSound(sound.id);
                  onSoundSelect(sound.id);
                  onOpenChange(false);
                }}
                className="w-full flex items-center justify-between py-4 hover:bg-muted/50 transition-colors"
              >
                <span className="text-lg text-foreground">{sound.name}</span>
                {currentSound === sound.id && (
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

export default SoundPickerDialog;
