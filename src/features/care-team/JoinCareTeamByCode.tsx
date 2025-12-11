import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Link2, Search, UserPlus, Loader2, AlertCircle, Stethoscope, 
  Shield, Eye, EyeOff, Lock, CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getVisibilityForRole, CareTeamRole } from './careTeamVisibility';

interface FoundInvite {
  id: string;
  subject_id: string;
  role: string;
  invite_code: string;
  expires_at: string;
  profile?: {
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

interface JoinCareTeamByCodeProps {
  onSuccess?: () => void;
}

/**
 * Component for professionals (clinicians) to join a care team using an invite code.
 * This uses the care_team_invites table where individuals create invites.
 */
export const JoinCareTeamByCode = ({ onSuccess }: JoinCareTeamByCodeProps) => {
  const { t } = useTranslation(['professional', 'common', 'care_team']);
  const [code, setCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [found, setFound] = useState<FoundInvite | null>(null);
  const [error, setError] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  // Get visibility rules for clinician
  const visibility = getVisibilityForRole('clinician');

  const handleSearch = async () => {
    if (!code.trim()) return;
    
    setSearching(true);
    setError('');
    setFound(null);
    setConsentChecked(false);

    try {
      // Look up invite by code
      const { data: invite, error: searchError } = await supabase
        .from('care_team_invites')
        .select('*')
        .eq('invite_code', code.trim().toUpperCase())
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (searchError || !invite) {
        setError(t('professional:code_not_found', 'Invalid or expired code'));
        return;
      }

      // Check if role matches clinician
      if (invite.role !== 'clinician') {
        setError(t('professional:code_wrong_role', 'This code is not for clinicians'));
        return;
      }

      // Get profile of the individual
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', invite.subject_id)
        .single();

      // Check if already connected
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (invite.viewer_id === user.id) {
        setError(t('professional:already_connected', 'You are already connected'));
        return;
      }

      const { data: existingRelation } = await supabase
        .from('clinician_patients')
        .select('status')
        .eq('clinician_id', user.id)
        .eq('patient_id', invite.subject_id)
        .maybeSingle();

      if (existingRelation) {
        if (existingRelation.status === 'active') {
          setError(t('professional:already_connected', 'You are already connected'));
        } else if (existingRelation.status === 'pending') {
          setError(t('professional:connection_pending', 'Connection already pending'));
        }
        return;
      }

      setFound({
        ...invite,
        profile: profile || undefined
      } as FoundInvite);
    } catch (err) {
      console.error('Error searching code:', err);
      setError(t('professional:search_error', 'Error looking up code'));
    } finally {
      setSearching(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!found || !consentChecked) return;
    
    setAccepting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update invite with viewer_id and accepted_at
      const { error: updateError } = await supabase
        .from('care_team_invites')
        .update({
          viewer_id: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', found.id);

      if (updateError) throw updateError;

      // Create clinician-patient relationship
      const { error: relationError } = await supabase
        .from('clinician_patients')
        .insert({
          clinician_id: user.id,
          patient_id: found.subject_id,
          status: 'active',
        });

      if (relationError) throw relationError;

      toast.success(t('professional:connection_established', 'Connection established'));
      setFound(null);
      setCode('');
      setConsentChecked(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error accepting invite:', err);
      toast.error(t('professional:accept_failed', 'Failed to accept invite'));
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">
            {t('professional:join_care_team', 'Join Care Team by Code')}
          </CardTitle>
        </div>
        <CardDescription className="text-sm">
          {t('professional:enter_patient_code', 'Enter the invite code from your patient')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t('professional:enter_code_placeholder', 'Enter code')}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono tracking-wider"
            maxLength={10}
          />
          <Button onClick={handleSearch} disabled={searching || !code.trim()}>
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {found && (
          <div className="space-y-4">
            {/* Patient Info */}
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={found.profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {(found.profile?.full_name || found.profile?.username)?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {found.profile?.full_name || found.profile?.username || t('professional:anonymous_patient', 'Patient')}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {t('professional:individual', 'Individual')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* What You WILL See */}
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">
                  {t('care_team:what_you_will_see', 'What you will see')}
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {visibility.canSeeFunctionalIndex && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-3 w-3 text-green-500" />
                    {t('care_team:functional_wellness_index', 'Functional Wellness Index (FWI)')}
                  </li>
                )}
                {visibility.canSeeDerivedTrends && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-3 w-3 text-green-500" />
                    {t('care_team:derived_trends', 'Trend patterns and adherence')}
                  </li>
                )}
              </ul>
            </div>

            {/* What You Will NOT See */}
            <div className="p-4 rounded-lg border border-muted bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm text-muted-foreground">
                  {t('care_team:what_you_cannot_see', 'What you cannot see')}
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {!visibility.canSeeRawLogs && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <EyeOff className="h-3 w-3 text-red-500" />
                    {t('care_team:raw_logs', 'Raw activity logs and entries')}
                  </li>
                )}
                {!visibility.canSeeMedicalDocuments && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <EyeOff className="h-3 w-3 text-red-500" />
                    {t('care_team:medical_vault', 'Medical Vault documents')}
                  </li>
                )}
              </ul>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                id="clinician-consent"
                checked={consentChecked}
                onCheckedChange={(checked) => setConsentChecked(checked === true)}
              />
              <label htmlFor="clinician-consent" className="text-sm cursor-pointer">
                {t('professional:clinician_accept_consent', 
                  'I understand I will only see functional patterns and trends — no raw logs or Medical Vault contents.'
                )}
              </label>
            </div>

            {/* Accept Button */}
            <Button 
              onClick={handleAcceptInvite} 
              disabled={accepting || !consentChecked} 
              className="w-full"
            >
              {accepting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {t('professional:accept_and_connect', 'Accept & Connect')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JoinCareTeamByCode;
