import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const DoNotSellLink = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [doNotSell, setDoNotSell] = useState(() => {
    return localStorage.getItem('ccpa_do_not_sell') === 'true';
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('ccpa_do_not_sell', doNotSell.toString());
      localStorage.setItem('ccpa_opt_out_date', new Date().toISOString());

      // Update cookie consent if it exists
      const sessionId = localStorage.getItem('session_id');
      if (sessionId) {
        await supabase
          .from('cookie_consents')
          .update({ 
            marketing: !doNotSell,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId);
      }

      toast.success(t('compliance:preferences_saved', 'Your preferences have been saved'));
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving CCPA preference:', error);
      toast.error(t('common:error', 'An error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
          {t('compliance:do_not_sell', 'Do Not Sell or Share My Personal Information')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t('compliance:ccpa_title', 'Your Privacy Choices')}
          </DialogTitle>
          <DialogDescription>
            {t('compliance:ccpa_description', 'Under the California Consumer Privacy Act (CCPA) and similar laws, you have the right to opt out of the sale or sharing of your personal information.')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="space-y-1">
              <Label htmlFor="do-not-sell" className="font-medium">
                {t('compliance:opt_out_sale', 'Opt Out of Sale/Sharing')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('compliance:opt_out_description', 'When enabled, we will not sell or share your personal information with third parties for advertising purposes.')}
              </p>
            </div>
            <Switch
              id="do-not-sell"
              checked={doNotSell}
              onCheckedChange={setDoNotSell}
            />
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              {t('compliance:ccpa_note', 'This preference applies to:')}
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('compliance:ccpa_item_1', 'Targeted advertising cookies')}</li>
              <li>{t('compliance:ccpa_item_2', 'Cross-site tracking')}</li>
              <li>{t('compliance:ccpa_item_3', 'Third-party data sharing for marketing')}</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? t('common:saving', 'Saving...') : t('common:save', 'Save')}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common:cancel', 'Cancel')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {t('compliance:ccpa_more_info', 'For more information about your privacy rights, please see our')}{' '}
            <a href="/privacy-policy" className="text-primary hover:underline inline-flex items-center gap-1">
              {t('legal:privacy_policy', 'Privacy Policy')}
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
