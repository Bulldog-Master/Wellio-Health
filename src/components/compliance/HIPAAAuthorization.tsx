import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield, FileCheck, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const HIPAAAuthorization = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [userId, setUserId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [authorizationDate, setAuthorizationDate] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState({
    understand_rights: false,
    consent_processing: false,
    acknowledge_revocation: false
  });

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadAuthorization(user.id);
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const loadAuthorization = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_privacy_preferences')
        .select('hipaa_authorization, hipaa_authorization_date')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAuthorized(data.hipaa_authorization || false);
        setAuthorizationDate(data.hipaa_authorization_date);
      }
    } catch (error) {
      console.error('Error loading HIPAA authorization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    if (!userId) return;
    if (!acceptedTerms.understand_rights || !acceptedTerms.consent_processing || !acceptedTerms.acknowledge_revocation) {
      toast.error(t('compliance:hipaa_accept_all'));
      return;
    }

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_privacy_preferences')
        .upsert({
          user_id: userId,
          hipaa_authorization: true,
          hipaa_authorization_date: now,
          updated_at: now
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Log the authorization
      await supabase.from('hipaa_authorizations').insert({
        user_id: userId,
        authorization_type: 'healthcare_operations',
        authorized_data: ['medical_records', 'medical_test_results', 'medications', 'symptoms'],
        purpose: 'Personal health tracking and management'
      });

      setAuthorized(true);
      setAuthorizationDate(now);
      setShowDialog(false);
      toast.success(t('compliance:hipaa_authorized'));
    } catch (error) {
      console.error('Error saving HIPAA authorization:', error);
      toast.error(t('common:error'));
    }
  };

  const handleRevoke = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('user_privacy_preferences')
        .update({
          hipaa_authorization: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      // Mark authorization as revoked
      await supabase
        .from('hipaa_authorizations')
        .update({
          is_revoked: true,
          revoked_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_revoked', false);

      setAuthorized(false);
      toast.success(t('compliance:hipaa_revoked'));
    } catch (error) {
      console.error('Error revoking HIPAA authorization:', error);
      toast.error(t('common:error'));
    }
  };

  if (loading || !userId) return null;

  return (
    <>
      <Card className="border-blue-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">{t('compliance:hipaa_title')}</CardTitle>
            </div>
            {authorized && (
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                <FileCheck className="h-3 w-3 mr-1" />
                {t('compliance:hipaa_authorized_badge')}
              </Badge>
            )}
          </div>
          <CardDescription>{t('compliance:hipaa_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t('compliance:hipaa_notice')}
            </p>
          </div>

          {authorized ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('compliance:hipaa_authorized_on', { 
                  date: authorizationDate ? new Date(authorizationDate).toLocaleDateString() : '' 
                })}
              </p>
              <Button 
                variant="outline" 
                className="text-destructive border-destructive/30"
                onClick={handleRevoke}
              >
                {t('compliance:hipaa_revoke')}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowDialog(true)}>
              {t('compliance:hipaa_authorize_button')}
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              {t('compliance:hipaa_authorization_title')}
            </DialogTitle>
            <DialogDescription>
              {t('compliance:hipaa_authorization_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-medium">{t('compliance:hipaa_data_used')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('compliance:hipaa_data_medical_records')}</li>
                <li>• {t('compliance:hipaa_data_test_results')}</li>
                <li>• {t('compliance:hipaa_data_medications')}</li>
                <li>• {t('compliance:hipaa_data_symptoms')}</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="understand-rights"
                  checked={acceptedTerms.understand_rights}
                  onCheckedChange={(checked) => 
                    setAcceptedTerms(prev => ({ ...prev, understand_rights: !!checked }))
                  }
                />
                <Label htmlFor="understand-rights" className="text-sm leading-relaxed">
                  {t('compliance:hipaa_checkbox_rights')}
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent-processing"
                  checked={acceptedTerms.consent_processing}
                  onCheckedChange={(checked) => 
                    setAcceptedTerms(prev => ({ ...prev, consent_processing: !!checked }))
                  }
                />
                <Label htmlFor="consent-processing" className="text-sm leading-relaxed">
                  {t('compliance:hipaa_checkbox_consent')}
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="acknowledge-revocation"
                  checked={acceptedTerms.acknowledge_revocation}
                  onCheckedChange={(checked) => 
                    setAcceptedTerms(prev => ({ ...prev, acknowledge_revocation: !!checked }))
                  }
                />
                <Label htmlFor="acknowledge-revocation" className="text-sm leading-relaxed">
                  {t('compliance:hipaa_checkbox_revocation')}
                </Label>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500" />
              <p className="text-xs text-muted-foreground">
                {t('compliance:hipaa_warning')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {t('common:cancel')}
            </Button>
            <Button 
              onClick={handleAuthorize}
              disabled={!acceptedTerms.understand_rights || !acceptedTerms.consent_processing || !acceptedTerms.acknowledge_revocation}
            >
              {t('compliance:hipaa_authorize')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
