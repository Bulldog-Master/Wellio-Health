import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { ShareDialog } from './ShareDialog';
import { ContentType } from '@/hooks/useContentSharing';
import { useTranslation } from 'react-i18next';

interface ShareButtonProps {
  contentPath: string;
  contentType: ContentType;
  contentPreview?: string;
  contentTitle?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export const ShareButton = ({
  contentPath,
  contentType,
  contentPreview,
  contentTitle,
  variant = 'ghost',
  size = 'icon',
  className,
  showLabel = false,
}: ShareButtonProps) => {
  const { t } = useTranslation('common');
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setDialogOpen(true)}
        aria-label={t('share')}
      >
        <Share2 className="w-4 h-4" />
        {showLabel && <span className="ml-2">{t('share')}</span>}
      </Button>

      <ShareDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contentPath={contentPath}
        contentType={contentType}
        contentPreview={contentPreview}
        contentTitle={contentTitle}
      />
    </>
  );
};
