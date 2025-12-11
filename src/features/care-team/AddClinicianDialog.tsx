import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Loader2, Stethoscope, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddClinicianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddClinicianDialog = ({ open, onOpenChange, onSuccess }: AddClinicianDialogProps) => {
  const { t } = useTranslation(['care_team', 'common']);
  const [step, setStep] = useState<1 | 2>(1);
  const [generating, setGenerating] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate a random 8-character code with hyphen
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const newCode = `${part1}-${part2}`;

      const { error } = await supabase
        .from('care_team_invites')
        .insert({
          subject_id: user.id,
          role: 'clinician',
          invite_code: newCode,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        });

      if (error) throw error;

      setCode(newCode);
      setStep(2);
      onSuccess?.();
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error(t('common:error'));
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      toast.success(t('common:copied'));
    }
  };

  const handleClose = () => {
    setStep(1);
    setCode(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <DialogTitle>{t('share_patterns_clinician')}</DialogTitle>
          </div>
          <DialogDescription className="whitespace-pre-line text-sm">
            {t('clinician_explanation')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <>
              {/* Step 1: Info notice */}
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400 whitespace-pre-line">
                  {t('clinician_trust_notice')}
                </p>
              </div>

              {/* Generate code button */}
              <Button
                onClick={handleGenerateCode}
                disabled={generating}
                className="w-full"
              >
                {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('generate_clinician_code')}
              </Button>
            </>
          )}

          {step === 2 && code && (
            <>
              {/* Step 2: Show generated code */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('share_code_with_clinician')}
                </p>

                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="font-mono text-2xl tracking-widest font-bold text-primary">
                    {code}
                  </span>
                  <Button variant="ghost" size="sm" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Badge variant="outline" className="text-xs">
                  {t('valid_for_days', { days: 7 })}
                </Badge>

                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {t('clinician_code_desc')}
                </p>
              </div>

              <Button variant="outline" onClick={handleClose} className="w-full">
                {t('common:done')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
