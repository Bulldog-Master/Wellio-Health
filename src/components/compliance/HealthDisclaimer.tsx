import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const HealthDisclaimer = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const disclaimerAccepted = localStorage.getItem('health_disclaimer_accepted');
    if (!disclaimerAccepted) {
      setOpen(true);
    } else {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('health_disclaimer_accepted', new Date().toISOString());
    setAccepted(true);
    setOpen(false);
  };

  if (accepted) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>{t('compliance:health_disclaimer_title')}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {t('compliance:health_disclaimer_1')}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {t('compliance:health_disclaimer_2')}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {t('compliance:health_disclaimer_3')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 border border-border rounded-lg">
            <Checkbox
              id="disclaimer"
              checked={checked}
              onCheckedChange={(c) => setChecked(c === true)}
              aria-label={t('compliance:accept_disclaimer')}
            />
            <label htmlFor="disclaimer" className="text-sm text-muted-foreground cursor-pointer">
              {t('compliance:disclaimer_checkbox')}
            </label>
          </div>

          <Button
            className="w-full"
            disabled={!checked}
            onClick={handleAccept}
          >
            {t('compliance:continue_to_app')}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {t('compliance:consult_professional')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
