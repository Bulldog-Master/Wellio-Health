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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Loader2, Users, Heart, Briefcase, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddSupporterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type RelationshipType = 'friend' | 'family' | 'colleague' | 'other';

const RELATIONSHIP_ICONS: Record<RelationshipType, typeof Users> = {
  friend: Users,
  family: Heart,
  colleague: Briefcase,
  other: HelpCircle,
};

export const AddSupporterDialog = ({ open, onOpenChange, onSuccess }: AddSupporterDialogProps) => {
  const { t } = useTranslation(['care_team', 'common']);
  const [step, setStep] = useState<1 | 2>(1);
  const [relationship, setRelationship] = useState<RelationshipType>('friend');
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
          role: 'supporter',
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
    setRelationship('friend');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('add_supporter_title')}</DialogTitle>
          <DialogDescription className="whitespace-pre-line text-sm">
            {t('supporter_explanation')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <>
              {/* Step 1: Choose relationship type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t('choose_relationship')}</Label>
                <RadioGroup
                  value={relationship}
                  onValueChange={(v) => setRelationship(v as RelationshipType)}
                  className="grid grid-cols-2 gap-2"
                >
                  {(['friend', 'family', 'colleague', 'other'] as RelationshipType[]).map((type) => {
                    const Icon = RELATIONSHIP_ICONS[type];
                    return (
                      <div key={type}>
                        <RadioGroupItem
                          value={type}
                          id={type}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={type}
                          className="flex items-center gap-2 rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{t(type)}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Generate code button */}
              <div className="space-y-2">
                <Button
                  onClick={handleGenerateCode}
                  disabled={generating}
                  className="w-full"
                >
                  {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t('generate_supporter_code')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t('supporter_code_notice')}
                </p>
              </div>
            </>
          )}

          {step === 2 && code && (
            <>
              {/* Step 2: Show generated code */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('share_code_with_supporter')}
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
              </div>

              {/* Footer text */}
              <p className="text-xs text-muted-foreground border-t pt-4">
                {t('supporter_footer')}
              </p>

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
