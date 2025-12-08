import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, ShieldOff, Lock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePrivateMessaging } from '@/hooks/social';

interface PrivacyStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PrivacyStatusIndicator = ({
  className,
  showLabel = true,
  size = 'md',
}: PrivacyStatusIndicatorProps) => {
  const { t } = useTranslation(['messages']);
  const { isE2EReady, isMixnetReady, isInitializing, initializePrivacy, getPrivacyStatus } = usePrivateMessaging();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializePrivacy();
      setInitialized(true);
    };
    init();
  }, [initializePrivacy]);

  const status = getPrivacyStatus();
  
  const iconSize = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  const getStatusColor = () => {
    if (status.level === 'full') return 'text-green-500';
    if (status.level === 'partial') return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  const getStatusBgColor = () => {
    if (status.level === 'full') return 'bg-green-500/10 border-green-500/20';
    if (status.level === 'partial') return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-muted/50 border-muted';
  };

  const StatusIcon = () => {
    if (isInitializing || !initialized) {
      return <Loader2 className={cn(iconSize, 'animate-spin text-muted-foreground')} />;
    }
    
    if (status.level === 'full') {
      return <ShieldCheck className={cn(iconSize, getStatusColor())} />;
    }
    
    if (status.level === 'partial') {
      return <Lock className={cn(iconSize, getStatusColor())} />;
    }
    
    return <ShieldOff className={cn(iconSize, getStatusColor())} />;
  };

  const getStatusLabel = () => {
    if (isInitializing || !initialized) {
      return t('messages:initializing_privacy');
    }
    
    if (status.level === 'full') {
      return t('messages:full_privacy');
    }
    
    if (status.level === 'partial') {
      return t('messages:partial_privacy');
    }
    
    return t('messages:e2e_encrypted');
  };

  const getTooltipContent = () => {
    if (isInitializing || !initialized) {
      return t('messages:initializing_privacy');
    }
    
    if (status.level === 'full') {
      return (
        <div className="space-y-1">
          <p className="font-semibold text-green-400">{t('messages:full_privacy')}</p>
          <p className="text-xs">✓ {t('messages:e2e_encrypted')}</p>
          <p className="text-xs">✓ {t('messages:mixnet_connected')}</p>
        </div>
      );
    }
    
    if (status.level === 'partial') {
      return (
        <div className="space-y-1">
          <p className="font-semibold text-yellow-400">{t('messages:partial_privacy')}</p>
          <p className="text-xs">✓ {t('messages:e2e_encrypted')}</p>
          <p className="text-xs text-muted-foreground">✗ {t('messages:mixnet_disconnected')}</p>
        </div>
      );
    }
    
    return t('messages:e2e_encrypted');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            'gap-1.5 cursor-help transition-colors',
            getStatusBgColor(),
            className
          )}
        >
          <StatusIcon />
          {showLabel && (
            <span className={cn('text-xs', getStatusColor())}>
              {status.level === 'full' 
                ? 'E2E + cMix' 
                : status.level === 'partial' 
                  ? 'E2E' 
                  : '...'}
            </span>
          )}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        {getTooltipContent()}
      </TooltipContent>
    </Tooltip>
  );
};
