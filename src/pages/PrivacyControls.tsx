import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Settings, Download, Trash2, Clock, Shield, Brain, Mail, Users, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CCPADoNotSell, HIPAAAuthorization, PIPEDADisclosure, AccessibilitySettings, DoNotSellLink } from '@/components/compliance';
import { BillingTerms } from '@/components/compliance/BillingTerms';

interface PrivacyPreferences {
  data_retention_days: number;
  allow_analytics: boolean;
  allow_marketing_emails: boolean;
  allow_ai_processing: boolean;
  share_with_trainers: boolean;
  share_with_practitioners: boolean;
}

const PrivacyControls: React.FC = () => {
  const { t } = useTranslation(['privacy', 'common', 'controls', 'compliance']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    data_retention_days: 365,
    allow_analytics: true,
    allow_marketing_emails: false,
    allow_ai_processing: true,
    share_with_trainers: false,
    share_with_practitioners: false,
  });
  const [pendingDeletion, setPendingDeletion] = useState<{ scheduled_deletion_at: string } | null>(null);
  const [pendingExport, setPendingExport] = useState<{ status: string; requested_at: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load privacy preferences
      const { data: prefs } = await supabase
        .from('user_privacy_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefs) {
        setPreferences({
          data_retention_days: prefs.data_retention_days || 365,
          allow_analytics: prefs.allow_analytics ?? true,
          allow_marketing_emails: prefs.allow_marketing_emails ?? false,
          allow_ai_processing: prefs.allow_ai_processing ?? true,
          share_with_trainers: prefs.share_with_trainers ?? false,
          share_with_practitioners: prefs.share_with_practitioners ?? false,
        });
      }

      // Check for pending deletion request
      const { data: deletion } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .single();

      if (deletion) {
        setPendingDeletion(deletion);
      }

      // Check for pending export
      const { data: exportReq } = await supabase
        .from('data_export_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(1)
        .single();

      if (exportReq && (exportReq.status === 'pending' || exportReq.status === 'processing')) {
        setPendingExport(exportReq);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof PrivacyPreferences, value: boolean | number) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_privacy_preferences')
        .upsert({
          user_id: user.id,
          [key]: value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, [key]: value }));
      toast.success(t('privacy:toast_privacy_updated'));
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error(t('privacy:toast_failed_update_settings'));
    } finally {
      setSaving(false);
    }
  };

  const requestDataExport = async () => {
    setExportLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call the edge function to get the export
      const response = await supabase.functions.invoke('export-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      // Create blob and download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t('controls:export_complete'));
    } catch (error) {
      console.error('Error requesting export:', error);
      toast.error(t('privacy:toast_failed_export'));
    } finally {
      setExportLoading(false);
    }
  };

  const requestAccountDeletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Schedule deletion for 30 days from now
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 30);

      const { error } = await supabase
        .from('account_deletion_requests')
        .insert({
          user_id: user.id,
          status: 'scheduled',
          reason: deleteReason,
          scheduled_deletion_at: scheduledDate.toISOString(),
        });

      if (error) throw error;

      setPendingDeletion({ scheduled_deletion_at: scheduledDate.toISOString() });
      toast.success(t('controls:deletion_scheduled'));
    } catch (error) {
      console.error('Error requesting deletion:', error);
      toast.error(t('privacy:toast_failed_delete'));
    }
  };

  const cancelDeletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .eq('status', 'scheduled');

      if (error) throw error;

      setPendingDeletion(null);
      toast.success(t('controls:deletion_cancelled'));
    } catch (error) {
      console.error('Error cancelling deletion:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead 
        titleKey="title"
        descriptionKey="description"
        namespace="controls"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/settings')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common:back')}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            {t('controls:title')}
          </h1>
          <p className="text-muted-foreground">{t('controls:description')}</p>
        </div>

        <div className="space-y-6">
          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t('controls:data_retention')}
              </CardTitle>
              <CardDescription>{t('controls:retention_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.data_retention_days.toString()}
                onValueChange={(value) => updatePreference('data_retention_days', parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">{t('controls:90_days')}</SelectItem>
                  <SelectItem value="180">{t('controls:180_days')}</SelectItem>
                  <SelectItem value="365">{t('controls:1_year')}</SelectItem>
                  <SelectItem value="730">{t('controls:2_years')}</SelectItem>
                  <SelectItem value="0">{t('controls:indefinite')}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Consent Toggles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t('controls:consent_settings')}
              </CardTitle>
              <CardDescription>{t('controls:consent_description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    {t('controls:ai_processing')}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t('controls:ai_processing_desc')}</p>
                </div>
                <Switch
                  checked={preferences.allow_ai_processing}
                  onCheckedChange={(checked) => updatePreference('allow_ai_processing', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('controls:analytics')}</Label>
                  <p className="text-sm text-muted-foreground">{t('controls:analytics_desc')}</p>
                </div>
                <Switch
                  checked={preferences.allow_analytics}
                  onCheckedChange={(checked) => updatePreference('allow_analytics', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('controls:marketing_emails')}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t('controls:marketing_desc')}</p>
                </div>
                <Switch
                  checked={preferences.allow_marketing_emails}
                  onCheckedChange={(checked) => updatePreference('allow_marketing_emails', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t('controls:professional_sharing')}
              </CardTitle>
              <CardDescription>{t('controls:professional_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('controls:share_trainers')}</Label>
                  <p className="text-sm text-muted-foreground">{t('controls:share_trainers_desc')}</p>
                </div>
                <Switch
                  checked={preferences.share_with_trainers}
                  onCheckedChange={(checked) => updatePreference('share_with_trainers', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('controls:share_practitioners')}</Label>
                  <p className="text-sm text-muted-foreground">{t('controls:share_practitioners_desc')}</p>
                </div>
                <Switch
                  checked={preferences.share_with_practitioners}
                  onCheckedChange={(checked) => updatePreference('share_with_practitioners', checked)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                {t('controls:data_export')}
              </CardTitle>
              <CardDescription>{t('controls:export_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={requestDataExport} disabled={exportLoading}>
                {exportLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {t('controls:export_button')}
              </Button>
            </CardContent>
          </Card>

          {/* Account Deletion */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                {t('privacy:delete_account')}
              </CardTitle>
              <CardDescription>{t('controls:delete_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDeletion ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span className="text-destructive">
                      {t('controls:deletion_pending', { 
                        date: new Date(pendingDeletion.scheduled_deletion_at).toLocaleDateString() 
                      })}
                    </span>
                  </div>
                  <Button variant="outline" onClick={cancelDeletion}>
                    {t('controls:cancel_deletion')}
                  </Button>
                </div>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('privacy:delete_button')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('privacy:delete_confirm')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('controls:delete_warning')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label>{t('controls:deletion_reason')}</Label>
                      <Textarea
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder={t('controls:reason_placeholder')}
                        className="mt-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('privacy:cancel')}</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={requestAccountDeletion}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('controls:confirm_deletion')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>

          {/* CCPA Do Not Sell */}
          <CCPADoNotSell />

          {/* HIPAA Authorization */}
          <HIPAAAuthorization />

          {/* PIPEDA Disclosure */}
          <PIPEDADisclosure />

          {/* Accessibility Settings */}
          <AccessibilitySettings />

          {/* Legal Links */}
          <Card>
            <CardHeader>
              <CardTitle>{t('controls:legal_documents')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => navigate('/privacy-policy')}>
                  {t('controls:privacy_policy')}
                </Button>
                <Button variant="outline" onClick={() => navigate('/terms')}>
                  {t('controls:terms_of_service')}
                </Button>
                <Button variant="outline" onClick={() => navigate('/refund-policy')}>
                  {t('controls:refund_policy')}
                </Button>
                <Button variant="outline" onClick={() => navigate('/accessibility')}>
                  {t('controls:accessibility_statement')}
                </Button>
              </div>
              <div className="pt-2 border-t">
                <DoNotSellLink />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyControls;