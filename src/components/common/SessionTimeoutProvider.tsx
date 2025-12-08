import { ReactNode } from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';

interface SessionTimeoutProviderProps {
  children: ReactNode;
}

export const SessionTimeoutProvider = ({ children }: SessionTimeoutProviderProps) => {
  const { t } = useTranslation('auth');
  const { showWarning, remainingTime, extendSession, logout } = useSessionTimeout();
  
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  
  return (
    <>
      {children}
      
      <AlertDialog open={showWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('session_timeout_title', 'Session Expiring')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('session_timeout_message', 'Your session will expire in {{time}}. Do you want to stay logged in?', {
                time: `${minutes}:${seconds.toString().padStart(2, '0')}`
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={logout}>
              {t('logout', 'Log out')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={extendSession}>
              {t('stay_logged_in', 'Stay logged in')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionTimeoutProvider;
