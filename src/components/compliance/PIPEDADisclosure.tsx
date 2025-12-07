import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Leaf, FileCheck, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const PIPEDADisclosure = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [userId, setUserId] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const [consentDate, setConsentDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadConsent(user.id);
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const loadConsent = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_privacy_preferences')
        .select('pipeda_consent, pipeda_consent_date')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setConsented(data.pipeda_consent || false);
        setConsentDate(data.pipeda_consent_date);
      }
    } catch (error) {
      console.error('Error loading PIPEDA consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (value: boolean) => {
    if (!userId) return;
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_privacy_preferences')
        .upsert({
          user_id: userId,
          pipeda_consent: value,
          pipeda_consent_date: value ? now : null,
          updated_at: now
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setConsented(value);
      setConsentDate(value ? now : null);
      toast.success(t('compliance:pipeda_consent_updated'));
    } catch (error) {
      console.error('Error updating PIPEDA consent:', error);
      toast.error(t('common:error'));
    }
  };

  if (loading || !userId) return null;

  return (
    <Card className="border-red-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">{t('compliance:pipeda_title')}</CardTitle>
          </div>
          {consented && (
            <Badge variant="outline" className="text-green-500 border-green-500/30">
              <FileCheck className="h-3 w-3 mr-1" />
              {t('compliance:pipeda_consented')}
            </Badge>
          )}
        </div>
        <CardDescription>{t('compliance:pipeda_description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="pipeda-consent" className="text-base">
              {t('compliance:pipeda_consent_label')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('compliance:pipeda_consent_desc')}
            </p>
          </div>
          <Switch
            id="pipeda-consent"
            checked={consented}
            onCheckedChange={handleConsentChange}
            aria-label={t('compliance:pipeda_consent_label')}
          />
        </div>

        {consentDate && (
          <p className="text-xs text-muted-foreground">
            {t('compliance:pipeda_consented_on', {
              date: new Date(consentDate).toLocaleDateString()
            })}
          </p>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="principles">
            <AccordionTrigger className="text-sm">
              {t('compliance:pipeda_principles_title')}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li><strong>1.</strong> {t('compliance:pipeda_principle_1')}</li>
                <li><strong>2.</strong> {t('compliance:pipeda_principle_2')}</li>
                <li><strong>3.</strong> {t('compliance:pipeda_principle_3')}</li>
                <li><strong>4.</strong> {t('compliance:pipeda_principle_4')}</li>
                <li><strong>5.</strong> {t('compliance:pipeda_principle_5')}</li>
                <li><strong>6.</strong> {t('compliance:pipeda_principle_6')}</li>
                <li><strong>7.</strong> {t('compliance:pipeda_principle_7')}</li>
                <li><strong>8.</strong> {t('compliance:pipeda_principle_8')}</li>
                <li><strong>9.</strong> {t('compliance:pipeda_principle_9')}</li>
                <li><strong>10.</strong> {t('compliance:pipeda_principle_10')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rights">
            <AccordionTrigger className="text-sm">
              {t('compliance:pipeda_rights_title')}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• {t('compliance:pipeda_right_access')}</li>
                <li>• {t('compliance:pipeda_right_correct')}</li>
                <li>• {t('compliance:pipeda_right_withdraw')}</li>
                <li>• {t('compliance:pipeda_right_complain')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => window.open('https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('compliance:pipeda_learn_more')}
        </Button>
      </CardContent>
    </Card>
  );
};
