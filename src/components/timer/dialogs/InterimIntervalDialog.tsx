import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TimerSettings } from "@/types/timer.types";
import { COLOR_OPTIONS, SOUND_OPTIONS } from "@/types/timer.types";

interface InterimIntervalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timerSettings: TimerSettings;
  setTimerSettings: (settings: TimerSettings) => void;
  interimHoursInput: string;
  setInterimHoursInput: (val: string) => void;
  interimMinsInput: string;
  setInterimMinsInput: (val: string) => void;
  interimSecsInput: string;
  setInterimSecsInput: (val: string) => void;
  interimRepsInput: string;
  setInterimRepsInput: (val: string) => void;
  interimSetsInput: string;
  setInterimSetsInput: (val: string) => void;
  onOpenColorPicker: () => void;
  onOpenSoundPicker: () => void;
}

const InterimIntervalDialog = ({
  open,
  onOpenChange,
  timerSettings,
  setTimerSettings,
  interimHoursInput,
  setInterimHoursInput,
  interimMinsInput,
  setInterimMinsInput,
  interimSecsInput,
  setInterimSecsInput,
  interimRepsInput,
  setInterimRepsInput,
  interimSetsInput,
  setInterimSetsInput,
  onOpenColorPicker,
  onOpenSoundPicker,
}: InterimIntervalDialogProps) => {
  const { t } = useTranslation(['timer']);

  const incrementValue = (setter: (val: string) => void, current: string, max?: number) => {
    const newVal = parseInt(current) + 1;
    if (max === undefined || newVal <= max) {
      setter(newVal.toString());
    }
  };

  const decrementValue = (setter: (val: string) => void, current: string) => {
    const newVal = Math.max(0, parseInt(current) - 1);
    setter(newVal.toString());
  };

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
              {t('interim_interval')}
            </h2>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Enable switch */}
          <div className="flex items-center justify-between py-3">
            <Label className="text-lg text-foreground font-normal">{t('interim_interval')}</Label>
            <Switch
              checked={timerSettings.useInterimInterval}
              onCheckedChange={(checked) =>
                setTimerSettings({ ...timerSettings, useInterimInterval: checked })
              }
            />
          </div>

          {/* Duration */}
          <div className="border-t border-border pt-4">
            <Label className="text-lg text-foreground font-normal block mb-4">{t('duration')}</Label>
            <div className="flex items-center justify-center gap-4">
              {/* Hours */}
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => incrementValue(setInterimHoursInput, interimHoursInput)}>
                  <ChevronUp className="h-6 w-6 text-muted-foreground" />
                </button>
                <Input
                  type="number"
                  min="0"
                  value={interimHoursInput}
                  onChange={(e) => setInterimHoursInput(e.target.value)}
                  className="w-16 text-center text-xl"
                />
                <button onClick={() => decrementValue(setInterimHoursInput, interimHoursInput)}>
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </button>
                <span className="text-xs text-muted-foreground">{t('hours')}</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              {/* Minutes */}
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => incrementValue(setInterimMinsInput, interimMinsInput, 59)}>
                  <ChevronUp className="h-6 w-6 text-muted-foreground" />
                </button>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={interimMinsInput}
                  onChange={(e) => setInterimMinsInput(e.target.value)}
                  className="w-16 text-center text-xl"
                />
                <button onClick={() => decrementValue(setInterimMinsInput, interimMinsInput)}>
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </button>
                <span className="text-xs text-muted-foreground">{t('min')}</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              {/* Seconds */}
              <div className="flex flex-col items-center gap-1">
                <button onClick={() => incrementValue(setInterimSecsInput, interimSecsInput, 59)}>
                  <ChevronUp className="h-6 w-6 text-muted-foreground" />
                </button>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={interimSecsInput}
                  onChange={(e) => setInterimSecsInput(e.target.value)}
                  className="w-16 text-center text-xl"
                />
                <button onClick={() => decrementValue(setInterimSecsInput, interimSecsInput)}>
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                </button>
                <span className="text-xs text-muted-foreground">{t('sec')}</span>
              </div>
            </div>
          </div>

          {/* Color */}
          <button 
            onClick={onOpenColorPicker}
            className="flex items-center justify-between py-3 border-t border-border w-full"
          >
            <Label className="text-lg text-foreground font-normal">{t('color')}</Label>
            <div className="flex items-center gap-2">
              {timerSettings.interimColor !== 'none' && (
                <div 
                  className="w-5 h-5 rounded"
                  style={{ backgroundColor: COLOR_OPTIONS.find(c => c.id === timerSettings.interimColor)?.hex || 'transparent' }}
                />
              )}
              <span className="text-lg text-muted-foreground capitalize">{timerSettings.interimColor}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>

          {/* Sound */}
          <button 
            onClick={onOpenSoundPicker}
            className="flex items-center justify-between py-3 border-t border-border w-full"
          >
            <Label className="text-lg text-foreground font-normal">{t('sound')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-lg text-muted-foreground capitalize">
                {SOUND_OPTIONS.find(s => s.id === timerSettings.interimSound)?.name || 'Beep'}
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </button>

          {/* Rep-based interval */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between py-3">
              <Label className="text-lg text-foreground font-normal">{t('rep_based_interval')}</Label>
              <Switch
                checked={timerSettings.isRepBased}
                onCheckedChange={(checked) =>
                  setTimerSettings({ ...timerSettings, isRepBased: checked })
                }
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('rep_based_description')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterimIntervalDialog;