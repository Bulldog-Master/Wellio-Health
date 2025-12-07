import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const CCPADoNotSell = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [userId, setUserId] = useState<string | null>(null);
  const [doNotSell, setDoNotSell] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadPreferences(user.id);
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const loadPreferences = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_privacy_preferences')
        .select('do_not_sell_data')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setDoNotSell(data.do_not_sell_data || false);
      }
    } catch (error) {
      console.error('Error loading CCPA preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (!userId) return;
    setDoNotSell(value);
    try {
      const { error } = await supabase
        .from('user_privacy_preferences')
        .upsert({
          user_id: userId,
          do_not_sell_data: value,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success(t('compliance:ccpa_preference_updated'));
    } catch (error) {
      console.error('Error updating CCPA preference:', error);
      toast.error(t('common:error'));
      setDoNotSell(!value);
    }
  };

  if (loading || !userId) return null;

  return (
    <Card className="border-orange-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-lg">{t('compliance:ccpa_title')}</CardTitle>
        </div>
        <CardDescription>{t('compliance:ccpa_description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="do-not-sell" className="text-base">
              {t('compliance:do_not_sell_label')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('compliance:do_not_sell_desc')}
            </p>
          </div>
          <Switch
            id="do-not-sell"
            checked={doNotSell}
            onCheckedChange={handleToggle}
            aria-label={t('compliance:do_not_sell_label')}
          />
        </div>
        
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {t('compliance:ccpa_rights_notice')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
