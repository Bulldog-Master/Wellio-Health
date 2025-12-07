import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Monitor, Smartphone, Tablet, Globe, Trash2, Shield, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import SEOHead from '@/components/SEOHead';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  device_type: string;
  browser: string;
  ip_address: string;
  location: string;
  last_active: string;
  is_current: boolean;
  created_at: string;
}

const SessionManagement = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      // Simulated sessions - in production, you'd track these in a database
      const mockSessions: Session[] = [
        {
          id: '1',
          device_type: 'desktop',
          browser: 'Chrome on Windows',
          ip_address: '192.168.1.xxx',
          location: 'New York, US',
          last_active: new Date().toISOString(),
          is_current: true,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          device_type: 'mobile',
          browser: 'Safari on iOS',
          ip_address: '10.0.0.xxx',
          location: 'Los Angeles, US',
          last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          is_current: false,
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error(t('common:error'));
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success(t('settings:session_revoked'));
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error(t('common:error'));
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      await supabase.auth.signOut({ scope: 'others' });
      setSessions(sessions.filter(s => s.is_current));
      toast.success(t('settings:all_sessions_revoked'));
    } catch (error) {
      console.error('Error revoking sessions:', error);
      toast.error(t('common:error'));
    }
  };

  return (
    <Layout>
      <SEOHead 
        titleKey="session_management_title"
        descriptionKey="session_management_description"
        namespace="seo"
      />
      <div className="container max-w-3xl mx-auto px-4 py-8">
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
            <h1 className="text-3xl font-bold">{t('settings:session_management')}</h1>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                {t('settings:revoke_all_others')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('settings:revoke_all_title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('settings:revoke_all_desc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={revokeAllOtherSessions}>
                  {t('settings:revoke_all')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <p className="text-muted-foreground mb-8">{t('settings:session_management_desc')}</p>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('common:loading')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.device_type);
              return (
                <Card key={session.id} className={session.is_current ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <DeviceIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {session.browser}
                            {session.is_current && (
                              <Badge variant="default" className="text-xs">
                                {t('settings:current_session')}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {session.ip_address}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      
                      {!session.is_current && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('settings:revoke_session_title')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('settings:revoke_session_desc')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => revokeSession(session.id)}>
                                {t('settings:revoke')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('settings:last_active')}: {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                      </span>
                      <span>
                        {t('settings:signed_in')}: {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SessionManagement;
