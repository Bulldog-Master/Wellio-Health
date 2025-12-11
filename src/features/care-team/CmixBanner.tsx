import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CmixBannerProps {
  className?: string;
}

export const CmixBanner = ({ className = '' }: CmixBannerProps) => {
  const { t } = useTranslation(['care_team']);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg ${className}`}>
      <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary">
          {t('cmix_banner_title')}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('cmix_banner_desc')}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={() => setDismissed(true)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
