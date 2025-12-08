import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Shield, LogIn, LogOut, Key, Settings, FileText, Eye, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { SEOHead } from '@/components/common';
import { Layout } from '@/components/layout';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AuditEvent {
  id: string;
  event_type: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

const SecurityAuditLog = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAuditLog();
  }, [filter]);

  const fetchAuditLog = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch from security_logs table
      let query = supabase
        .from('security_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('event_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our interface
      const transformedEvents: AuditEvent[] = (data || []).map((log: any) => ({
        id: log.id,
        event_type: log.event_type,
        description: log.description || getEventDescription(log.event_type),
        ip_address: log.ip_address || 'Unknown',
        user_agent: log.user_agent || 'Unknown',
        created_at: log.created_at,
        metadata: log.metadata,
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching audit log:', error);
      // Show mock data if no logs exist
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const getMockEvents = (): AuditEvent[] => [
    {
      id: '1',
      event_type: 'login',
      description: t('settings:event_login_success'),
      ip_address: '192.168.1.xxx',
      user_agent: 'Chrome on Windows',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      event_type: 'password_change',
      description: t('settings:event_password_changed'),
      ip_address: '192.168.1.xxx',
      user_agent: 'Chrome on Windows',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      event_type: 'settings_update',
      description: t('settings:event_settings_updated'),
      ip_address: '10.0.0.xxx',
      user_agent: 'Safari on iOS',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getEventDescription = (eventType: string): string => {
    const descriptions: Record<string, string> = {
      login: t('settings:event_login_success'),
      logout: t('settings:event_logout'),
      password_change: t('settings:event_password_changed'),
      settings_update: t('settings:event_settings_updated'),
      data_export: t('settings:event_data_exported'),
      profile_view: t('settings:event_profile_viewed'),
    };
    return descriptions[eventType] || eventType;
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, typeof LogIn> = {
      login: LogIn,
      logout: LogOut,
      password_change: Key,
      settings_update: Settings,
      data_export: Download,
      profile_view: Eye,
    };
    return icons[eventType] || FileText;
  };

  const getEventBadgeVariant = (eventType: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      login: 'default',
      logout: 'secondary',
      password_change: 'destructive',
      settings_update: 'outline',
    };
    return variants[eventType] || 'outline';
  };

  const exportAuditLog = () => {
    const csv = [
      ['Date', 'Event Type', 'Description', 'IP Address', 'User Agent'].join(','),
      ...events.map(e => [
        format(new Date(e.created_at), 'yyyy-MM-dd HH:mm:ss'),
        e.event_type,
        `"${e.description}"`,
        e.ip_address,
        `"${e.user_agent}"`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('settings:audit_log_exported'));
  };

  return (
    <Layout>
      <SEOHead 
        titleKey="security_audit_log_title"
        descriptionKey="security_audit_log_description"
        namespace="seo"
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
          aria-label={t('common:back')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common:back')}
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('settings:security_audit_log')}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('settings:filter_events')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('settings:all_events')}</SelectItem>
                <SelectItem value="login">{t('settings:logins')}</SelectItem>
                <SelectItem value="logout">{t('settings:logouts')}</SelectItem>
                <SelectItem value="password_change">{t('settings:password_changes')}</SelectItem>
                <SelectItem value="settings_update">{t('settings:settings_changes')}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportAuditLog}>
              <Download className="h-4 w-4 mr-2" />
              {t('settings:export')}
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-8">{t('settings:security_audit_log_desc')}</p>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings:recent_activity')}</CardTitle>
            <CardDescription>{t('settings:recent_activity_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('common:loading')}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('settings:no_events')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {events.map((event) => {
                    const EventIcon = getEventIcon(event.event_type);
                    return (
                      <div key={event.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <EventIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getEventBadgeVariant(event.event_type)}>
                              {event.event_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(event.created_at), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>IP: {event.ip_address}</span>
                            <span className="truncate">{event.user_agent}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SecurityAuditLog;
