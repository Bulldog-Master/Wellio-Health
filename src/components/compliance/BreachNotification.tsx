import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Breach {
  id: string;
  breach_id: string;
  title: string;
  description: string;
  affected_data: string[];
  severity: string;
  discovered_at: string;
}

export const BreachNotification = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [breach, setBreach] = useState<Breach | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkBreaches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unacknowledged breaches
      const { data: breaches } = await supabase
        .from('data_breach_notifications')
        .select('*')
        .not('id', 'in', 
          supabase
            .from('user_breach_acknowledgments')
            .select('breach_id')
            .eq('user_id', user.id)
        )
        .order('discovered_at', { ascending: false })
        .limit(1);

      if (breaches && breaches.length > 0) {
        setBreach(breaches[0]);
        setOpen(true);
      }
    };

    checkBreaches();
  }, []);

  const acknowledgeBreach = async () => {
    if (!breach) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('user_breach_acknowledgments').insert({
      user_id: user.id,
      breach_id: breach.id,
    });

    setOpen(false);
    setBreach(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  if (!breach) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getSeverityColor(breach.severity)}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle>{t('compliance:security_notice')}</DialogTitle>
          </div>
          <DialogDescription className="text-left pt-2">
            {breach.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{breach.description}</p>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">
              {t('compliance:affected_data')}:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {breach.affected_data.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            {t('compliance:discovered_at')}: {new Date(breach.discovered_at).toLocaleDateString()}
          </p>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={acknowledgeBreach}>
              {t('compliance:acknowledge')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('compliance:breach_support')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
