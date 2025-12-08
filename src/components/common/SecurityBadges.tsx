import { Shield, Lock, Atom, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface SecurityBadgesProps {
  className?: string;
  compact?: boolean;
  showLabels?: boolean;
}

export const SecurityBadges = ({ 
  className, 
  compact = false,
  showLabels = true 
}: SecurityBadgesProps) => {
  const { t } = useTranslation(['auth', 'common']);

  const badges = [
    {
      icon: Atom,
      label: t('auth:quantum_resistant'),
      description: t('auth:quantum_resistant_desc'),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Lock,
      label: t('auth:e2e_encryption'),
      description: t('auth:e2e_encryption_desc'),
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: EyeOff,
      label: t('auth:metadata_protection'),
      description: t('auth:metadata_protection_desc'),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
              badge.bgColor
            )}
          >
            <badge.icon className={cn('h-3 w-3', badge.color)} />
            {showLabels && (
              <span className={badge.color}>{badge.label}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3', className)}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg',
            badge.bgColor
          )}
        >
          <div className={cn('p-2 rounded-lg', badge.bgColor)}>
            <badge.icon className={cn('h-5 w-5', badge.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('font-semibold text-sm', badge.color)}>
              {badge.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {badge.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Compact inline version for headers/footers
export const SecurityBadgeInline = ({ className }: { className?: string }) => {
  const { t } = useTranslation(['auth']);
  
  return (
    <div className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <Shield className="h-3.5 w-3.5 text-green-500" />
      <span>{t('auth:secured_by_quantum')}</span>
    </div>
  );
};
