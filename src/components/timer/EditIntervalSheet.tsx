import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TimerInterval } from "@/types/timer.types";
import { SOUND_OPTIONS } from "@/types/timer.types";

interface EditIntervalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editIntervalName: string;
  setEditIntervalName: (name: string) => void;
  editIntervalHours: string;
  setEditIntervalHours: (hours: string) => void;
  editIntervalMinutes: string;
  setEditIntervalMinutes: (minutes: string) => void;
  editIntervalSeconds: string;
  setEditIntervalSeconds: (seconds: string) => void;
  editIntervalColor: string;
  setEditIntervalColor: (color: string) => void;
  editIntervalSound: string;
  editIntervalReps: number;
  setEditIntervalReps: (reps: number) => void;
  editIntervalRepBased: boolean;
  setEditIntervalRepBased: (repBased: boolean) => void;
  onSave: () => void;
  onOpenSoundPicker: () => void;
}

const EditIntervalSheet = ({
  open,
  onOpenChange,
  editIntervalName,
  setEditIntervalName,
  editIntervalHours,
  setEditIntervalHours,
  editIntervalMinutes,
  setEditIntervalMinutes,
  editIntervalSeconds,
  setEditIntervalSeconds,
  editIntervalColor,
  setEditIntervalColor,
  editIntervalSound,
  editIntervalReps,
  setEditIntervalReps,
  editIntervalRepBased,
  setEditIntervalRepBased,
  onSave,
  onOpenSoundPicker,
}: EditIntervalSheetProps) => {
  const { t } = useTranslation(['timer']);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-full overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border pb-4 -mt-6 -mx-6 px-6 pt-6 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onOpenChange(false)}
              className="text-primary"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold text-foreground">{t('edit_interval')}</h2>
            <button
              onClick={onSave}
              className="text-primary font-semibold"
            >
              {t('save')}
            </button>
          </div>
        </div>

        <div className="space-y-6 pb-20">
          {/* Time Picker */}
          <div className="flex gap-4 justify-center items-center text-4xl">
            <div className="flex flex-col items-center">
              <Input
                type="number"
                min="0"
                value={editIntervalHours}
                onChange={(e) => setEditIntervalHours(e.target.value)}
                className="text-4xl text-center w-32 h-20 font-bold"
              />
              <span className="text-sm text-muted-foreground mt-1">{t('hours')}</span>
            </div>
            <span className="font-bold">:</span>
            <div className="flex flex-col items-center">
              <Input
                type="number"
                min="0"
                max="59"
                value={editIntervalMinutes}
                onChange={(e) => setEditIntervalMinutes(e.target.value)}
                className="text-4xl text-center w-32 h-20 font-bold"
              />
              <span className="text-sm text-muted-foreground mt-1">{t('min')}</span>
            </div>
            <span className="font-bold">:</span>
            <div className="flex flex-col items-center">
              <Input
                type="number"
                min="0"
                max="59"
                value={editIntervalSeconds}
                onChange={(e) => setEditIntervalSeconds(e.target.value)}
                className="text-4xl text-center w-32 h-20 font-bold"
              />
              <span className="text-sm text-muted-foreground mt-1">{t('sec')}</span>
            </div>
          </div>

          {/* Interval Name */}
          <div className="py-4 border-y border-border">
            <Input
              value={editIntervalName}
              onChange={(e) => setEditIntervalName(e.target.value)}
              placeholder={t('interval_name')}
              className="text-center text-lg border-0 focus-visible:ring-0"
            />
          </div>

          {/* Add an image placeholder */}
          <button className="w-full py-4 text-center text-muted-foreground hover:bg-accent transition-colors border-y border-border">
            {t('add_image')}
          </button>

          {/* Repetitions */}
          <div className="flex items-center justify-between py-4 border-b border-border">
            <Label className="text-lg text-foreground">{t('repetitions')}</Label>
            <Input
              type="number"
              min="1"
              value={editIntervalReps}
              onChange={(e) => setEditIntervalReps(parseInt(e.target.value) || 1)}
              className="w-20 text-center text-lg"
            />
          </div>

          {/* Set */}
          <div className="flex items-center justify-between py-4 border-b border-border">
            <Label className="text-lg text-foreground">{t('set')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t('repeat')}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Color */}
          <div className="flex items-center justify-between py-4 border-b border-border">
            <Label className="text-lg text-foreground">{t('color')}</Label>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: editIntervalColor }}
              />
              <Input
                type="color"
                value={editIntervalColor}
                onChange={(e) => setEditIntervalColor(e.target.value)}
                className="w-16 h-10"
              />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Sound */}
          <button
            onClick={onOpenSoundPicker}
            className="flex items-center justify-between py-4 border-b border-border w-full hover:bg-accent/50 transition-colors"
          >
            <Label className="text-lg text-foreground cursor-pointer">{t('sound')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {SOUND_OPTIONS.find(s => s.id === editIntervalSound)?.name || editIntervalSound}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>

          {/* Rep-based interval */}
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg text-foreground">{t('rep_based_interval')}</Label>
              <Switch
                checked={editIntervalRepBased}
                onCheckedChange={setEditIntervalRepBased}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('rep_based_description')}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditIntervalSheet;
