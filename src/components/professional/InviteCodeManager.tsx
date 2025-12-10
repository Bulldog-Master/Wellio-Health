import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Link2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface InviteCode {
  id: string;
  code: string;
  professional_type: 'coach' | 'clinician';
  created_at: string;
  expires_at: string | null;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
}

interface InviteCodeManagerProps {
  professionalType: 'coach' | 'clinician';
}

export const InviteCodeManager = ({ professionalType }: InviteCodeManagerProps) => {
  const { t } = useTranslation(['professional', 'common']);
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, [professionalType]);

  const fetchCodes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('professional_invite_codes')
        .select('*')
        .eq('professional_id', user.id)
        .eq('professional_type', professionalType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes((data as InviteCode[]) || []);
    } catch (error) {
      console.error('Error fetching invite codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate a random 8-character code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data, error } = await supabase
        .from('professional_invite_codes')
        .insert({
          professional_id: user.id,
          code,
          professional_type: professionalType,
          max_uses: 10,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      setCodes(prev => [data as InviteCode, ...prev]);
      toast.success(t('professional:code_generated'));
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error(t('professional:code_generation_failed'));
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('professional:code_copied'));
  };

  const copyShareLink = (code: string) => {
    const link = `${window.location.origin}/join/${professionalType}/${code}`;
    navigator.clipboard.writeText(link);
    toast.success(t('professional:link_copied'));
  };

  const deactivateCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('professional_invite_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) throw error;
      
      setCodes(prev => prev.map(c => 
        c.id === codeId ? { ...c, is_active: false } : c
      ));
      toast.success(t('professional:code_deactivated'));
    } catch (error) {
      console.error('Error deactivating code:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const activeCode = codes.find(c => c.is_active);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          <CardTitle>{t('professional:invite_codes')}</CardTitle>
        </div>
        <CardDescription>
          {t('professional:invite_codes_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeCode ? (
          <div className="p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {t('professional:your_invite_code')}
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-2xl font-mono font-bold tracking-wider">
                    {activeCode.code}
                  </code>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {activeCode.current_uses}/{activeCode.max_uses}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCode(activeCode.code)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {t('common:copy')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyShareLink(activeCode.code)}
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  {t('professional:copy_link')}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-3">
              {t('professional:share_code_instruction')}
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              {t('professional:no_active_code')}
            </p>
            <Button onClick={generateCode} disabled={generating}>
              <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              {t('professional:generate_code')}
            </Button>
          </div>
        )}

        {codes.length > 1 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">{t('professional:previous_codes')}</p>
            <div className="space-y-2">
              {codes.filter(c => c.id !== activeCode?.id).slice(0, 3).map(code => (
                <div 
                  key={code.id}
                  className="flex items-center justify-between text-sm p-2 rounded bg-muted/30"
                >
                  <code className="font-mono">{code.code}</code>
                  <Badge variant={code.is_active ? 'secondary' : 'outline'}>
                    {code.is_active ? t('common:active') : t('common:inactive')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
