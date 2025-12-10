import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteCode {
  id: string;
  code: string;
  professional_type: 'coach' | 'clinician';
  current_uses: number;
  max_uses: number | null;
  is_active: boolean;
}

interface InviteCodePanelProps {
  professionalType: 'coach' | 'clinician';
}

export const InviteCodePanel = ({ professionalType }: InviteCodePanelProps) => {
  const { t } = useTranslation(['professional', 'common']);
  const [code, setCode] = useState<InviteCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('professional_invite_codes')
        .select('*')
        .eq('professional_id', user.id)
        .eq('professional_type', professionalType)
        .eq('is_active', true)
        .maybeSingle();

      setCode(data as InviteCode);
    } catch (error) {
      console.error('Error fetching invite code:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCode();
  }, [professionalType]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate a random 6-character code
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { data, error } = await supabase
        .from('professional_invite_codes')
        .insert({
          professional_id: user.id,
          professional_type: professionalType,
          code: newCode,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setCode(data as InviteCode);
      toast.success(t('code_generated'));
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error(t('common:error'));
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code.code);
      toast.success(t('code_copied'));
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
          <Key className="h-5 w-5 text-primary" />
          <CardTitle>{t('your_invite_code')}</CardTitle>
        </div>
        <CardDescription>
          {t('invite_code_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {code ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-mono text-2xl tracking-widest font-bold">
                {code.code}
              </span>
              <Button variant="ghost" size="sm" onClick={copyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{t('times_used', { count: code.current_uses })}</span>
              <Badge variant={code.is_active ? 'default' : 'secondary'}>
                {code.is_active ? t('active') : t('inactive')}
              </Badge>
            </div>
          </div>
        ) : (
          <Button onClick={generateCode} disabled={generating} className="w-full">
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {t('generate_code')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
