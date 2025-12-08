import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Advertisement {
  id: string;
  title: string;
  title_es: string | null;
  description: string | null;
  description_es: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  impression_count: number | null;
  click_count: number | null;
}

interface AdBannerProps {
  placement?: 'feed' | 'sidebar' | 'header' | 'footer';
  className?: string;
}

export const AdBanner = ({ placement = 'feed', className = '' }: AdBannerProps) => {
  const { i18n } = useTranslation();
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      const { data } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .eq('placement', placement)
        .limit(1)
        .single();
      
      if (data) {
        setAd(data);
        await supabase
          .from('advertisements')
          .update({ impression_count: (data.impression_count || 0) + 1 })
          .eq('id', data.id);
      }
    };

    fetchAd();
  }, [placement]);

  if (!ad || isDismissed) return null;

  const isSpanish = i18n.language?.startsWith('es');
  const title = isSpanish && ad.title_es ? ad.title_es : ad.title;
  const description = isSpanish && ad.description_es ? ad.description_es : ad.description;

  const handleClick = async () => {
    await supabase
      .from('advertisements')
      .update({ click_count: (ad.click_count || 0) + 1 })
      .eq('id', ad.id);
    
    if (ad.link_url) {
      window.open(ad.link_url, '_blank');
    }
  };

  return (
    <div className={`relative bg-muted/50 border border-border rounded-lg p-4 ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="cursor-pointer" onClick={handleClick}>
        {ad.image_url && (
          <img src={ad.image_url} alt={title} className="w-full h-32 object-cover rounded-md mb-3" />
        )}
        <h4 className="font-medium text-sm">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        <span className="text-xs text-muted-foreground mt-2 block">Sponsored</span>
      </div>
    </div>
  );
};

export default AdBanner;
