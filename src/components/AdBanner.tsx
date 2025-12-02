import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ExternalLink, Megaphone, Heart } from 'lucide-react';
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
  type: 'ad';
}

interface Fundraiser {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  goal_amount: number;
  current_amount: number;
  end_date: string;
  type: 'fundraiser';
}

type DisplayItem = Advertisement | Fundraiser;

interface AdBannerProps {
  placement: 'dashboard' | 'activity' | 'feed' | 'news' | 'global';
  className?: string;
  variant?: 'banner' | 'card' | 'minimal';
}

const AdBanner = ({ placement, className, variant = 'banner' }: AdBannerProps) => {
  const { t, i18n } = useTranslation(['ads', 'fundraisers']);
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch paid advertisements
  const { data: ads } = useQuery({
    queryKey: ['advertisements', placement],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .or(`placement.eq.${placement},placement.eq.global`)
        .eq('is_active', true);
      
      if (error) throw error;
      return (data || []).map(ad => ({ ...ad, type: 'ad' as const }));
    },
  });

  // Fetch active fundraisers for free advertising
  const { data: fundraisers } = useQuery({
    queryKey: ['active-fundraisers-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fundraisers')
        .select('id, title, description, image_url, goal_amount, current_amount, end_date')
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return (data || []).map(f => ({ ...f, type: 'fundraiser' as const }));
    },
  });

  // Combine ads and fundraisers - fundraisers get free advertising
  const displayItems: DisplayItem[] = [
    ...(ads || []),
    ...(fundraisers || [])
  ];

  // Rotate items every 30 seconds
  useEffect(() => {
    if (displayItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [displayItems.length]);

  if (dismissed || displayItems.length === 0) return null;

  const item = displayItems[currentIndex];
  const isFundraiser = item.type === 'fundraiser';
  
  const getTitle = () => {
    if (isFundraiser) return (item as Fundraiser).title;
    const ad = item as Advertisement;
    if (i18n.language?.startsWith('es') && ad.title_es) {
      return ad.title_es;
    }
    return ad.title;
  };

  const getDescription = () => {
    if (isFundraiser) return (item as Fundraiser).description;
    const ad = item as Advertisement;
    if (i18n.language?.startsWith('es') && ad.description_es) {
      return ad.description_es;
    }
    return ad.description;
  };

  const handleClick = () => {
    if (isFundraiser) {
      navigate(`/fundraiser/${item.id}`);
    } else {
      const ad = item as Advertisement;
      if (ad.link_url) {
        window.open(ad.link_url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const getBadgeContent = () => {
    if (isFundraiser) {
      return (
        <>
          <Heart className="h-3 w-3 mr-1" />
          {t('fundraisers:title')}
        </>
      );
    }
    return (
      <>
        <Megaphone className="h-3 w-3 mr-1" />
        {t('ads:sponsored')}
      </>
    );
  };

  const getActionText = () => {
    if (isFundraiser) return t('fundraisers:donate_now');
    return t('ads:learn_more');
  };

  // Fundraiser progress indicator
  const renderFundraiserProgress = () => {
    if (!isFundraiser) return null;
    const f = item as Fundraiser;
    const progress = Math.min((f.current_amount / f.goal_amount) * 100, 100);
    return (
      <div className="mt-2 space-y-1">
        <Progress value={progress} className="h-1.5" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${f.current_amount.toLocaleString()}</span>
          <span>{Math.round(progress)}% {t('fundraisers:funded')}</span>
        </div>
      </div>
    );
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm", className)}>
        <Badge variant={isFundraiser ? "default" : "secondary"} className="text-xs">
          {getBadgeContent()}
        </Badge>
        <span className="flex-1 truncate">{getTitle()}</span>
        <Button variant="link" size="sm" className="h-auto p-0" onClick={handleClick}>
          {getActionText()}
        </Button>
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
            {item.image_url && (
              <img
                src={item.image_url}
                alt={getTitle()}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <Badge variant={isFundraiser ? "default" : "secondary"} className="text-xs">
                  {getBadgeContent()}
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
              {renderFundraiserProgress()}
              <Button variant="link" size="sm" className="h-auto p-0 mt-2" onClick={handleClick}>
                {getActionText()}
                {!isFundraiser && <ExternalLink className="h-3 w-3 ml-1" />}
              </Button>
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
        "relative flex items-center gap-4 p-4 border rounded-lg",
        isFundraiser 
          ? "bg-gradient-to-r from-primary/10 to-accent/10" 
          : "bg-gradient-to-r from-primary/5 to-secondary/5",
        className
      )}
    >
      {item.image_url && (
        <img
          src={item.image_url}
          alt={getTitle()}
          className="w-16 h-16 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={isFundraiser ? "default" : "secondary"} className="text-xs">
            {getBadgeContent()}
          </Badge>
        </div>
        <h4 className="font-semibold">{getTitle()}</h4>
        {getDescription() && (
          <p className="text-sm text-muted-foreground line-clamp-1">{getDescription()}</p>
        )}
        {renderFundraiserProgress()}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleClick}>
          {getActionText()}
          {!isFundraiser && <ExternalLink className="h-4 w-4 ml-2" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Multiple items indicator */}
      {displayItems.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {displayItems.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                idx === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdBanner;
