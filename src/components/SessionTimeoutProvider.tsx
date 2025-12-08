import { useEffect, useState } from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Clock, RefreshCw } from 'lucide-react';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const SessionTimeoutProvider = ({ 
  children, 
  timeoutMinutes = 30,
  warningMinutes = 5 
}: SessionTimeoutProviderProps) => {
  const { t } = useTranslation(['common', 'settings']);
  const [showWarning, setShowWarning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { extendSession, getTimeRemaining } = useSessionTimeout({
    timeoutMinutes,
    warningMinutes,
    onWarning: () => setShowWarning(true),
    onTimeout: () => {
      setShowWarning(false);
      window.location.href = '/auth';
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setShowWarning(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleExtendSession = () => {
    extendSession();
    setShowWarning(false);
  };

  // Only show dialog when authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              {t('settings:session_expiring')}
            </DialogTitle>
            <DialogDescription>
              {t('settings:session_expiring_desc', { 
                minutes: warningMinutes 
              })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowWarning(false)}>
              {t('common:dismiss')}
            </Button>
            <Button onClick={handleExtendSession}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('settings:stay_logged_in')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
