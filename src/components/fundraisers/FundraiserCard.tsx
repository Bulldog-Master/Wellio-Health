import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Calendar, MapPin, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Fundraiser } from './types';

interface FundraiserCardProps {
  fundraiser: Fundraiser;
  getCategoryLabel: (category: string) => string;
  onDonate: (id: string, title: string) => void;
}

export const FundraiserCard = ({ fundraiser, getCategoryLabel, onDonate }: FundraiserCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('fundraisers');
  
  const progress = (fundraiser.current_amount / fundraiser.goal_amount) * 100;
  const daysLeft = Math.ceil((new Date(fundraiser.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/fundraiser/${fundraiser.id}`)}
    >
      {fundraiser.image_url && (
        <img
          src={fundraiser.image_url}
          alt={fundraiser.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{fundraiser.title}</h3>
            {fundraiser.verified && (
              <Badge variant="default" className="flex-shrink-0">
                <BadgeCheck className="h-3 w-3" />
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {fundraiser.description}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={fundraiser.profiles.avatar_url} />
              <AvatarFallback>{fundraiser.profiles.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{fundraiser.profiles.full_name}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{getCategoryLabel(fundraiser.category)}</Badge>
            {fundraiser.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {fundraiser.location}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-primary">
              ${fundraiser.current_amount.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              {t('of')} ${fundraiser.goal_amount.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{Math.round(progress)}% {t('funded')}</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysLeft > 0 ? `${daysLeft} ${t('days_left')}` : t('ended')}
            </div>
          </div>
        </div>

        <Button 
          className="w-full gap-2" 
          onClick={(e) => {
            e.stopPropagation();
            onDonate(fundraiser.id, fundraiser.title);
          }}
        >
          <Heart className="h-4 w-4" />
          {t('donate')}
        </Button>
      </div>
    </Card>
  );
};
