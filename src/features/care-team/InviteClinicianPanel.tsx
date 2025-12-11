import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, Copy, RefreshCw, Loader2, Shield, Eye, EyeOff,
  TrendingUp, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

interface CareTeamInvite {
  id: string;
  invite_code: string;
  role: string;
  expires_at: string;
  accepted_at: string | null;
  viewer_id: string | null;
}

interface InviteClinicianPanelProps {
  onInviteGenerated?: () => void;
}

export const InviteClinicianPanel = ({ onInviteGenerated }: InviteClinicianPanelProps) => {
  const { t } = useTranslation(['care_team', 'professional', 'common']);
  const [invite, setInvite] = useState<CareTeamInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchInvite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch active invite for clinician role
      const { data } = await supabase
        .from('care_team_invites')
        .select('*')
        .eq('subject_id', user.id)
        .eq('role', 'clinician')
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      setInvite(data as CareTeamInvite);
    } catch (error) {
      console.error('Error fetching clinician invite:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvite();
  }, []);

  const generateInvite = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate unique code using the database function
      const { data: codeResult } = await supabase.rpc('generate_care_team_invite_code');
      const newCode = codeResult || Math.random().toString(36).substring(2, 10).toUpperCase();

      // Delete any existing pending invites for this role (due to partial unique index)
      await supabase
        .from('care_team_invites')
        .delete()
        .eq('subject_id', user.id)
        .eq('role', 'clinician')
        .is('accepted_at', null);

      // Create new invite with 7-day expiry
      const { data, error } = await supabase
        .from('care_team_invites')
        .insert({
          subject_id: user.id,
          role: 'clinician',
          invite_code: newCode,
          expires_at: addDays(new Date(), 7).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setInvite(data as CareTeamInvite);
      toast.success(t('care_team:invite_generated'));
      onInviteGenerated?.();
    } catch (error) {
      console.error('Error generating clinician invite:', error);
      toast.error(t('common:error'));
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (invite) {
      navigator.clipboard.writeText(invite.invite_code);
      toast.success(t('care_team:code_copied'));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {t('care_team:add_clinician', 'Add a Clinician')}
          </CardTitle>
        </div>
        <CardDescription>
          {t('care_team:clinician_invite_desc', 
            'Share your functional wellness patterns with a clinician you trust. They will see your FWI, trends, and adherence signals — not your raw logs, journals, or Medical Vault.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Privacy Notice */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Shield className="h-4 w-4 text-primary" />
            {t('care_team:what_they_will_see', 'What they will see')}
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground pl-6">
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3 text-green-500" />
              {t('care_team:fwi_and_trends', 'FWI, trends, and adherence signals')}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium mt-3">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            {t('care_team:what_they_cannot_see', 'What they cannot see')}
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground pl-6">
            <div className="flex items-center gap-2">
              <EyeOff className="h-3 w-3 text-red-500" />
              {t('care_team:no_raw_logs_vault', 'Raw logs, journals, or Medical Vault')}
            </div>
          </div>
        </div>

        {/* Invite Code Section */}
        {invite ? (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{t('care_team:share_with_clinician', 'Share this code with your clinician')}</span>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {t('care_team:valid_until', 'Valid until {{date}}', {
                  date: format(new Date(invite.expires_at), 'MMM d, yyyy')
                })}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-mono text-2xl tracking-widest font-bold">
                {invite.invite_code}
              </span>
              <Button variant="ghost" size="sm" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateInvite} 
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t('care_team:generate_new_code', 'Generate New Code')}
            </Button>
          </div>
        ) : (
          <Button onClick={generateInvite} disabled={generating} className="w-full">
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            {t('care_team:generate_clinician_invite', 'Generate Clinician Invite Code')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteClinicianPanel;
