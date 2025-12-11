import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Link2, Search, UserPlus, Loader2, AlertCircle, Dumbbell, Stethoscope, 
  Shield, Eye, EyeOff, Lock 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getVisibilityForRole, CareTeamRole } from './careTeamVisibility';
import type { FoundProfessional } from './types';

interface JoinByCodeProps {
  role?: 'coach' | 'clinician';
  onSuccess?: () => void;
}

export const JoinByCode = ({ role, onSuccess }: JoinByCodeProps) => {
  const { t } = useTranslation(['professional', 'common', 'care_team']);
  const [code, setCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [found, setFound] = useState<FoundProfessional | null>(null);
  const [error, setError] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const roleLabel = role === 'coach' ? t('coach') : role === 'clinician' ? t('clinician') : t('professional');
  const RoleIcon = role === 'coach' ? Dumbbell : role === 'clinician' ? Stethoscope : Link2;

  // Get visibility rules for the selected role
  const visibilityRole: CareTeamRole = role === 'coach' ? 'coach' : role === 'clinician' ? 'clinician' : 'coach';
  const visibility = getVisibilityForRole(visibilityRole);

  const handleSearch = async () => {
    if (!code.trim()) return;
    
    setSearching(true);
    setError('');
    setFound(null);
    setConsentChecked(false);

    try {
      let query = supabase
        .from('professional_invite_codes')
        .select(`
          id,
          professional_id,
          professional_type,
          code,
          profiles:professional_id (
            display_name,
            avatar_url
          )
        `)
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true);

      // Filter by role if specified
      if (role) {
        query = query.eq('professional_type', role);
      }

      const { data, error: searchError } = await query.single();

      if (searchError || !data) {
        setError(t('professional:code_not_found'));
        return;
      }

      // Check if already connected or pending
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingRequest } = await supabase
        .from('professional_relationship_requests')
        .select('status')
        .eq('professional_id', data.professional_id)
        .eq('client_id', user.id)
        .eq('professional_type', data.professional_type)
        .maybeSingle();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          setError(t('professional:request_already_pending'));
        } else if (existingRequest.status === 'accepted') {
          setError(t('professional:already_connected'));
        }
        return;
      }

      setFound({
        ...data,
        profile: data.profiles as any
      } as FoundProfessional);
    } catch (err) {
      console.error('Error searching code:', err);
      setError(t('professional:search_error'));
    } finally {
      setSearching(false);
    }
  };

  const handleRequestConnection = async () => {
    if (!found || !consentChecked) return;
    
    setRequesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('professional_relationship_requests')
        .insert({
          professional_id: found.professional_id,
          client_id: user.id,
          professional_type: found.professional_type,
          invite_code_id: found.id,
          status: 'pending'
        });

      if (error) throw error;

      // Increment code usage
      await supabase
        .from('professional_invite_codes')
        .update({ current_uses: (await supabase.from('professional_invite_codes').select('current_uses').eq('id', found.id).single()).data?.current_uses + 1 || 1 })
        .eq('id', found.id);

      toast.success(t('professional:request_sent'));
      setFound(null);
      setCode('');
      setConsentChecked(false);
      onSuccess?.();
    } catch (err) {
      console.error('Error requesting connection:', err);
      toast.error(t('professional:request_failed'));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <RoleIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">
            {role ? t('connect_with_role', { role: roleLabel }) : t('join_by_code')}
          </CardTitle>
        </div>
        <CardDescription className="text-sm">
          {t('enter_code_from_role', { role: roleLabel.toLowerCase() })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t('enter_code_placeholder')}
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
            {/* Professional Info */}
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={found.profile.avatar_url} />
                  <AvatarFallback>
                    {found.profile.display_name?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{found.profile.display_name}</p>
                  <Badge variant="outline" className="text-xs">
                    {found.professional_type === 'coach' 
                      ? t('coach') 
                      : t('clinician')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Privacy Notice - What they WILL see */}
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">
                  {t('care_team:what_they_will_see', 'What they will see')}
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {visibility.canSeeHighLevelWellbeing && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-3 w-3 text-green-500" />
                    {t('care_team:high_level_wellbeing', 'High-level wellbeing status')}
                  </li>
                )}
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

            {/* Privacy Notice - What they will NOT see */}
            <div className="p-4 rounded-lg border border-muted bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm text-muted-foreground">
                  {t('care_team:what_they_cannot_see', 'What they cannot see')}
                </span>
              </div>
              <ul className="space-y-2 text-sm">
                {!visibility.canSeeRawLogs && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <EyeOff className="h-3 w-3 text-red-500" />
                    {t('care_team:raw_logs', 'Raw activity logs and entries')}
                  </li>
                )}
                {!visibility.canSeeMealDetails && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <EyeOff className="h-3 w-3 text-red-500" />
                    {t('care_team:meal_details', 'Specific meal details')}
                  </li>
                )}
                {!visibility.canSeeMoodLogs && (
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <EyeOff className="h-3 w-3 text-red-500" />
                    {t('care_team:mood_logs', 'Personal mood and journal entries')}
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

            {/* Consent Checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                id="consent"
                checked={consentChecked}
                onCheckedChange={(checked) => setConsentChecked(checked === true)}
              />
              <label htmlFor="consent" className="text-sm cursor-pointer">
                {t('care_team:consent_statement', 
                  'I understand and consent to sharing my derived wellness insights with this professional. I can revoke access at any time.'
                )}
              </label>
            </div>

            {/* Connect Button */}
            <Button 
              onClick={handleRequestConnection} 
              disabled={requesting || !consentChecked} 
              className="w-full"
            >
              {requesting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {t('request_connection')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
