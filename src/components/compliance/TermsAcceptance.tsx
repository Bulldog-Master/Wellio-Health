import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { FileText, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const CURRENT_TOS_VERSION = '1.0.0';
const CURRENT_PP_VERSION = '1.0.0';

export const TermsAcceptance = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [ppAccepted, setPpAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAcceptance();
  }, []);

  const checkAcceptance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user has accepted current versions
    const { data: consents } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', user.id)
      .in('consent_type', ['terms_of_service', 'privacy_policy']);

    const tosConsent = consents?.find(c => c.consent_type === 'terms_of_service');
    const ppConsent = consents?.find(c => c.consent_type === 'privacy_policy');

    const tosNeedsUpdate = !tosConsent || !tosConsent.granted;
    const ppNeedsUpdate = !ppConsent || !ppConsent.granted;

    if (tosNeedsUpdate || ppNeedsUpdate) {
      setOpen(true);
    }
  };

  const handleAccept = async () => {
    if (!tosAccepted || !ppAccepted) {
      toast.error(t('compliance:must_accept_both'));
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upsert ToS consent
      await supabase.from('user_consents').upsert({
        user_id: user.id,
        consent_type: 'terms_of_service',
        granted: true,
        granted_at: new Date().toISOString(),
      }, { onConflict: 'user_id,consent_type' });

      // Upsert Privacy Policy consent
      await supabase.from('user_consents').upsert({
        user_id: user.id,
        consent_type: 'privacy_policy',
        granted: true,
        granted_at: new Date().toISOString(),
      }, { onConflict: 'user_id,consent_type' });

      toast.success(t('compliance:terms_accepted'));
      setOpen(false);
    } catch (error) {
      console.error('Error accepting terms:', error);
      toast.error(t('common:error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>{t('compliance:terms_update_title')}</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            {t('compliance:terms_update_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Checkbox
              id="tos"
              checked={tosAccepted}
              onCheckedChange={(checked) => setTosAccepted(checked === true)}
            />
            <div className="flex-1">
              <label htmlFor="tos" className="text-sm font-medium cursor-pointer">
                {t('compliance:accept_tos')}
              </label>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => window.open('/terms', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {t('compliance:view_tos')}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Checkbox
              id="pp"
              checked={ppAccepted}
              onCheckedChange={(checked) => setPpAccepted(checked === true)}
            />
            <div className="flex-1">
              <label htmlFor="pp" className="text-sm font-medium cursor-pointer">
                {t('compliance:accept_privacy_policy')}
              </label>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => window.open('/privacy-policy', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {t('compliance:view_privacy_policy')}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAccept} 
            disabled={!tosAccepted || !ppAccepted || loading}
            className="w-full"
          >
            {loading ? t('common:loading') : t('compliance:accept_and_continue')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
