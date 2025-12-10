import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link2, Search, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FoundProfessional {
  id: string;
  professional_id: string;
  professional_type: 'coach' | 'clinician';
  code: string;
  profile: {
    display_name: string;
    avatar_url?: string;
  };
}

export const JoinByCode = () => {
  const { t } = useTranslation(['professional', 'common']);
  const [code, setCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [found, setFound] = useState<FoundProfessional | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!code.trim()) return;
    
    setSearching(true);
    setError('');
    setFound(null);

    try {
      const { data, error: searchError } = await supabase
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
        .eq('is_active', true)
        .single();

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
    if (!found) return;
    
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
    } catch (err) {
      console.error('Error requesting connection:', err);
      toast.error(t('professional:request_failed'));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <CardTitle>{t('professional:join_by_code')}</CardTitle>
        </div>
        <CardDescription>
          {t('professional:join_by_code_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t('professional:enter_code_placeholder')}
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
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between">
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
                      ? t('professional:coach') 
                      : t('professional:clinician')}
                  </Badge>
                </div>
              </div>
              <Button onClick={handleRequestConnection} disabled={requesting}>
                {requesting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-1" />
                )}
                {t('professional:request_connection')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
