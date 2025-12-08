import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { RecoveryFormData, therapies } from './types';

interface RecoveryFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RecoveryFormData;
  setFormData: (data: RecoveryFormData) => void;
  onSubmit: () => void;
}

export const RecoveryFormDialog = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
}: RecoveryFormDialogProps) => {
  const { t } = useTranslation(['recovery', 'common']);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {t('log_session')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('log_session')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Therapy Selection */}
          <div className="space-y-2">
            <Label>{t('recovery_therapies')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {therapies.map((therapy) => {
                const Icon = therapy.icon;
                return (
                  <button
                    key={therapy.id}
                    onClick={() => setFormData({ ...formData, selectedTherapy: therapy.id })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      formData.selectedTherapy === therapy.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-1 ${therapy.color.split(' ')[0]}`} />
                    <div className="text-xs font-medium">{t(therapy.nameKey)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">{t('duration_minutes')}</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="30"
            />
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <Label>{t('intensity')}</Label>
            <Select value={formData.intensity} onValueChange={(v) => setFormData({ ...formData, intensity: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('low')}</SelectItem>
                <SelectItem value="medium">{t('medium')}</SelectItem>
                <SelectItem value="high">{t('high')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperature">{t('temperature')}</Label>
            <Input
              id="temperature"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              placeholder={t('temperature_placeholder')}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">{t('location')}</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('location_placeholder')}
            />
          </div>

          {/* Cost */}
          <div className="space-y-2">
            <Label htmlFor="cost">{t('cost')}</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder={t('cost_placeholder')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('notes_placeholder')}
              rows={3}
            />
          </div>

          <Button onClick={onSubmit} className="w-full">
            {t('log_session')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
