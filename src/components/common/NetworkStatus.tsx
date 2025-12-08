import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Network status indicator shown when offline
 */
export const NetworkStatus = () => {
  const { t } = useTranslation();
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-2 px-4">
      <div className="flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>{t('youre_offline_restore')}</span>
      </div>
    </div>
  );
};

export default NetworkStatus;