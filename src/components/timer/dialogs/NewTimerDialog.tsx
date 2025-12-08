import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import type { TimerInterval, TimerSettings } from "@/types/timer.types";
import { SOUND_OPTIONS } from "@/types/timer.types";

interface NewTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timerName: string;
  setTimerName: (name: string) => void;
  intervals: TimerInterval[];
  setIntervals: (intervals: TimerInterval[]) => void;
  repeatCount: number;
  setRepeatCount: (count: number) => void;
  timerSettings: TimerSettings;
  setTimerSettings: (settings: TimerSettings) => void;
  onSave: () => void;
  onOpenInterimInterval: () => void;
  onOpenSoundPicker: (type: 'interval' | 'timer' | 'doublebeep') => void;
  onEditInterval: (interval: TimerInterval) => void;
  isSaving: boolean;
}

const NewTimerDialog = ({
  open,
  onOpenChange,
  timerName,
  setTimerName,
  intervals,
  setIntervals,
  repeatCount,
  setRepeatCount,
  timerSettings,
  setTimerSettings,
  onSave,
  onOpenInterimInterval,
  onOpenSoundPicker,
  onEditInterval,
  isSaving,
}: NewTimerDialogProps) => {
  const { t } = useTranslation(['timer']);
  const { toast } = useToast();

  const handleAddInterval = () => {
    const newInterval: TimerInterval = {
      id: Date.now().toString(),
      name: `Interval ${intervals.length + 1}`,
      duration: 30,
      color: "#3B82F6",
    };
    setIntervals([...intervals, newInterval]);
    toast({
      title: t('toast_interval_added'),
      description: t('toast_interval_added_desc', { name: newInterval.name }),
    });
  };

  const handleDeleteInterval = (id: string) => {
    setIntervals(intervals.filter(interval => interval.id !== id));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotalTime = () => {
    const totalSeconds = intervals.reduce((sum, interval) => sum + interval.duration, 0) * repeatCount;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>{t('new_timer')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Timer Name */}
          <div className="space-y-2">
            <Label>{t('timer_name')}</Label>
            <Input
              value={timerName}
              onChange={(e) => setTimerName(e.target.value)}
              placeholder={t('timer_name_placeholder')}
            />
          </div>

          {/* Intervals List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('intervals')}</Label>
              <Button variant="ghost" size="sm" onClick={handleAddInterval}>
                <Plus className="h-4 w-4 mr-1" />
                {t('add_interval')}
              </Button>
            </div>
            
            {intervals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('no_intervals')}
              </p>
            ) : (
              <div className="space-y-2">
                {intervals.map((interval, index) => (
                  <div
                    key={interval.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: interval.color }}
                    />
                    <span className="text-sm text-muted-foreground">{index + 1}</span>
                    <button 
                      className="flex-1 text-left"
                      onClick={() => onEditInterval(interval)}
                    >
                      <span className="font-medium">{interval.name}</span>
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(interval.duration)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteInterval(interval.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repeat Count */}
          <div className="flex items-center justify-between py-3 border-t border-border">
            <Label>{t('repeat_count')}</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setRepeatCount(Math.max(1, repeatCount - 1))}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{repeatCount}</span>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setRepeatCount(repeatCount + 1)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Time */}
          <div className="flex items-center justify-between py-3 border-t border-border">
            <Label>{t('total_time')}</Label>
            <span className="text-lg font-semibold">{calculateTotalTime()}</span>
          </div>

          {/* Sound Settings */}
          <div className="space-y-2 border-t border-border pt-4">
            <Label className="text-sm text-muted-foreground uppercase tracking-wider">
              {t('sound_settings')}
            </Label>
            
            <button 
              onClick={() => onOpenSoundPicker('interval')}
              className="flex items-center justify-between w-full py-3"
            >
              <span>{t('interval_complete_sound')}</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{SOUND_OPTIONS.find(s => s.id === timerSettings.intervalCompleteSound)?.name}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>

            <button 
              onClick={() => onOpenSoundPicker('timer')}
              className="flex items-center justify-between w-full py-3"
            >
              <span>{t('timer_complete_sound')}</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{SOUND_OPTIONS.find(s => s.id === timerSettings.timerCompleteSound)?.name}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-2 border-t border-border pt-4">
            <Label className="text-sm text-muted-foreground uppercase tracking-wider">
              {t('advanced_settings')}
            </Label>

            <button 
              onClick={onOpenInterimInterval}
              className="flex items-center justify-between w-full py-3"
            >
              <span>{t('interim_interval')}</span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{timerSettings.useInterimInterval ? t('on') : t('off')}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>

            <div className="flex items-center justify-between py-3">
              <span>{t('text_to_speech')}</span>
              <Switch
                checked={timerSettings.textToSpeech}
                onCheckedChange={(checked) => 
                  setTimerSettings({ ...timerSettings, textToSpeech: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <span>{t('countdown_beeps')}</span>
              <Switch
                checked={timerSettings.countdownBeeps}
                onCheckedChange={(checked) => 
                  setTimerSettings({ ...timerSettings, countdownBeeps: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <span>{t('show_line_numbers')}</span>
              <Switch
                checked={timerSettings.showLineNumbers}
                onCheckedChange={(checked) => 
                  setTimerSettings({ ...timerSettings, showLineNumbers: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <span>{t('show_elapsed_time')}</span>
              <Switch
                checked={timerSettings.showElapsedTime}
                onCheckedChange={(checked) => 
                  setTimerSettings({ ...timerSettings, showElapsedTime: checked })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onSave} disabled={isSaving || intervals.length === 0}>
            {isSaving ? t('saving') : t('save_timer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTimerDialog;