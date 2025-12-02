import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Advertisement {
  id: string;
  title: string;
  title_es: string | null;
  description: string | null;
  description_es: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
}

interface AdBannerProps {
  placement: 'dashboard' | 'activity' | 'feed' | 'news' | 'global';
  className?: string;
  variant?: 'banner' | 'card' | 'minimal';
}

const AdBanner = ({ placement, className, variant = 'banner' }: AdBannerProps) => {
  const { t, i18n } = useTranslation(['ads']);
  const [dismissed, setDismissed] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const { data: ads } = useQuery({
    queryKey: ['advertisements', placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .or(`placement.eq.${placement},placement.eq.global`)
        .eq('is_active', true);
      
      if (error) throw error;
      return data as Advertisement[];
    },
  });

  // Rotate ads every 30 seconds
  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [ads]);

  if (dismissed || !ads || ads.length === 0) return null;

  const ad = ads[currentAdIndex];
  
  const getTitle = () => {
    if (i18n.language?.startsWith('es') && ad.title_es) {
      return ad.title_es;
    }
    return ad.title;
  };

  const getDescription = () => {
    if (i18n.language?.startsWith('es') && ad.description_es) {
      return ad.description_es;
    }
    return ad.description;
  };

  const handleClick = () => {
    if (ad.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm", className)}>
        <Badge variant="secondary" className="text-xs">
          <Megaphone className="h-3 w-3 mr-1" />
          {t('ads:sponsored')}
        </Badge>
        <span className="flex-1 truncate">{getTitle()}</span>
        {ad.link_url && (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={handleClick}>
            {t('ads:learn_more')}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {ad.image_url && (
              <img
                src={ad.image_url}
                alt={getTitle()}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-xs">
                  <Megaphone className="h-3 w-3 mr-1" />
                  {t('ads:sponsored')}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setDismissed(true)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <h4 className="font-semibold truncate">{getTitle()}</h4>
              {getDescription() && (
                <p className="text-sm text-muted-foreground line-clamp-2">{getDescription()}</p>
              )}
              {ad.link_url && (
                <Button variant="link" size="sm" className="h-auto p-0 mt-2" onClick={handleClick}>
                  {t('ads:learn_more')}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default banner variant
  return (
    <div
      className={cn(
        "relative flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border rounded-lg",
        className
      )}
    >
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={getTitle()}
          className="w-16 h-16 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            <Megaphone className="h-3 w-3 mr-1" />
            {t('ads:sponsored')}
          </Badge>
        </div>
        <h4 className="font-semibold">{getTitle()}</h4>
        {getDescription() && (
          <p className="text-sm text-muted-foreground line-clamp-1">{getDescription()}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {ad.link_url && (
          <Button size="sm" onClick={handleClick}>
            {t('ads:learn_more')}
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Multiple ads indicator */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {ads.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                idx === currentAdIndex ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdBanner;
