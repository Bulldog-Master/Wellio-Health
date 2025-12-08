import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import type { TimerInterval } from "@/types/timer.types";
import { SOUND_OPTIONS, COLOR_OPTIONS } from "@/types/timer.types";

interface EditIntervalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingIntervalId: string | null;
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
  setEditIntervalSound: (sound: string) => void;
  editIntervalReps: number;
  setEditIntervalReps: (reps: number) => void;
  editIntervalRepBased: boolean;
  setEditIntervalRepBased: (repBased: boolean) => void;
  intervals: TimerInterval[];
  setIntervals: (intervals: TimerInterval[]) => void;
  onOpenSoundPicker: () => void;
}

const EditIntervalDialog = ({
  open,
  onOpenChange,
  editingIntervalId,
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
  setEditIntervalSound,
  editIntervalReps,
  setEditIntervalReps,
  editIntervalRepBased,
  setEditIntervalRepBased,
  intervals,
  setIntervals,
  onOpenSoundPicker,
}: EditIntervalDialogProps) => {
  const { t } = useTranslation(['timer']);
  const { toast } = useToast();

  const handleSave = () => {
    if (!editIntervalName.trim()) {
      toast({
        title: t('toast_error'),
        description: t('toast_interval_name_error'),
        variant: "destructive",
      });
      return;
    }

    const totalSeconds = 
      (parseInt(editIntervalHours) || 0) * 3600 +
      (parseInt(editIntervalMinutes) || 0) * 60 +
      (parseInt(editIntervalSeconds) || 0);

    if (totalSeconds === 0 && !editIntervalRepBased) {
      toast({
        title: t('toast_error'),
        description: t('toast_duration_error'),
        variant: "destructive",
      });
      return;
    }

    setIntervals(intervals.map(interval => 
      interval.id === editingIntervalId
        ? {
            ...interval,
            name: editIntervalName,
            duration: totalSeconds,
            color: editIntervalColor,
            sound: editIntervalSound,
            reps: editIntervalReps,
            repBased: editIntervalRepBased,
          }
        : interval
    ));

    onOpenChange(false);
    toast({
      title: t('toast_interval_updated'),
      description: t('toast_interval_updated_desc', { name: editIntervalName }),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-full overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border pb-4 -mt-6 -mx-6 px-6 pt-6 mb-4">
          <div className="flex items-center justify-between">
            <button onClick={() => onOpenChange(false)} className="text-primary">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold text-foreground">{t('edit_interval')}</h2>
            <button onClick={handleSave} className="text-primary font-semibold">
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

          {/* Color Selection */}
          <div className="py-4 border-b border-border">
            <Label className="text-lg text-foreground block mb-4">{t('color')}</Label>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.filter(c => c.hex).map((color) => (
                <button
                  key={color.id}
                  onClick={() => setEditIntervalColor(color.hex!)}
                  className={`w-10 h-10 rounded-full transition-all ${
                    editIntervalColor === color.hex ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color.hex! }}
                />
              ))}
            </div>
          </div>

          {/* Sound */}
          <button 
            onClick={onOpenSoundPicker}
            className="flex items-center justify-between py-4 border-b border-border w-full"
          >
            <Label className="text-lg text-foreground">{t('sound')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-lg text-muted-foreground">
                {SOUND_OPTIONS.find(s => s.id === editIntervalSound)?.name || 'Beep'}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>

          {/* Rep-based */}
          <div className="flex items-center justify-between py-4">
            <div>
              <Label className="text-lg text-foreground block">{t('rep_based')}</Label>
              <p className="text-sm text-muted-foreground">{t('rep_based_description')}</p>
            </div>
            <Switch
              checked={editIntervalRepBased}
              onCheckedChange={setEditIntervalRepBased}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditIntervalDialog;