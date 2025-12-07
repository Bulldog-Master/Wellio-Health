import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BreachNotification {
  id: string;
  breach_id: string;
  title: string;
  description: string;
  severity: string;
  affected_data: string[];
  discovered_at: string;
  notified_at: string | null;
}

export const DataBreachNotification = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [notifications, setNotifications] = useState<BreachNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<BreachNotification | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const acknowledgedBreaches = JSON.parse(
        localStorage.getItem('acknowledged_breaches') || '[]'
      );

      const { data, error } = await supabase
        .from('data_breach_notifications')
        .select('*')
        .order('discovered_at', { ascending: false });

      if (error) {
        console.error('Error fetching breach notifications:', error);
        return;
      }

      const unacknowledged = (data || []).filter(
        (n) => !acknowledgedBreaches.includes(n.id)
      ) as BreachNotification[];

      setNotifications(unacknowledged);
      if (unacknowledged.length > 0) {
        setSelectedNotification(unacknowledged[0]);
        setIsOpen(true);
      }
    };

    fetchNotifications();
  }, []);

  const handleAcknowledge = (notificationId: string) => {
    const acknowledgedBreaches = JSON.parse(
      localStorage.getItem('acknowledged_breaches') || '[]'
    );
    acknowledgedBreaches.push(notificationId);
    localStorage.setItem('acknowledged_breaches', JSON.stringify(acknowledgedBreaches));

    const remaining = notifications.filter(n => n.id !== notificationId);
    setNotifications(remaining);

    if (remaining.length > 0) {
      setSelectedNotification(remaining[0]);
    } else {
      setIsOpen(false);
      setSelectedNotification(null);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          icon: ShieldAlert,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          badgeVariant: 'destructive' as const,
        };
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          badgeVariant: 'destructive' as const,
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          badgeVariant: 'secondary' as const,
        };
      default:
        return {
          icon: Info,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          badgeVariant: 'outline' as const,
        };
    }
  };

  if (!selectedNotification) return null;

  const severityConfig = getSeverityConfig(selectedNotification.severity);
  const Icon = severityConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${severityConfig.color}`} />
            {t('compliance:security_notice', 'Security Notice')}
          </DialogTitle>
          <DialogDescription>
            {t('compliance:breach_notification_desc', 'Important information about your account security')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className={severityConfig.bgColor}>
            <Icon className={`h-4 w-4 ${severityConfig.color}`} />
            <AlertTitle className="flex items-center gap-2">
              {selectedNotification.title}
              <Badge variant={severityConfig.badgeVariant} className="ml-2">
                {t(`compliance:severity_${selectedNotification.severity}`, selectedNotification.severity)}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2">
              {selectedNotification.description}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {t('compliance:affected_data', 'Affected Data Types')}:
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedNotification.affected_data.map((data, index) => (
                <Badge key={index} variant="outline">
                  {t(`compliance:data_type_${data}`, data)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              {t('compliance:discovered_on', 'Discovered on')}:{' '}
              <span className="font-medium">
                {format(new Date(selectedNotification.discovered_at), 'PPP')}
              </span>
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">
              {t('compliance:recommended_actions', 'Recommended Actions')}:
            </h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>{t('compliance:action_password', 'Change your password immediately')}</li>
              <li>{t('compliance:action_2fa', 'Enable two-factor authentication')}</li>
              <li>{t('compliance:action_monitor', 'Monitor your account for suspicious activity')}</li>
              <li>{t('compliance:action_support', 'Contact support if you notice anything unusual')}</li>
            </ul>
          </div>

          {notifications.length > 1 && (
            <p className="text-sm text-muted-foreground">
              {t('compliance:more_notifications', '{{count}} more notification(s)', {
                count: notifications.length - 1,
              })}
            </p>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={() => handleAcknowledge(selectedNotification.id)}
              className="flex-1"
            >
              {t('compliance:acknowledge', 'I Understand')}
            </Button>
            <Button variant="outline" asChild>
              <a href="/settings">
                {t('compliance:go_to_security', 'Security Settings')}
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
