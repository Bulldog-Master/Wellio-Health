import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Phone, Plus, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categoryIcons } from '@/lib/location';

interface DiscoveredGym {
  osm_id: string;
  name: string;
  category?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  website?: string;
  lat?: number;
  lon?: number;
  state?: string;
  postal_code?: string;
}

interface DiscoveredGymCardProps {
  gym: DiscoveredGym;
  onAdd: (gym: DiscoveredGym) => void;
  isAdding: boolean;
}

export const DiscoveredGymCard = ({ gym, onAdd, isAdding }: DiscoveredGymCardProps) => {
  const { t } = useTranslation(['locations', 'common']);
  const CategoryIcon = categoryIcons[gym.category || 'gym'] || MapPin;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{gym.name}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500">
            {t('locations:external_source')}
          </Badge>
        </div>
        {(gym.city || gym.address) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {gym.address || gym.city}{gym.country ? `, ${gym.country}` : ''}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant="outline">
          {t(`locations:categories.${gym.category || 'gym'}`)}
        </Badge>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {gym.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={gym.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                {t('locations:visit_website')}
              </a>
            </Button>
          )}
          {gym.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${gym.phone}`}>
                <Phone className="h-3 w-3 mr-1" />
                {t('locations:call')}
              </a>
            </Button>
          )}
          <Button 
            size="sm"
            onClick={() => onAdd(gym)}
            disabled={isAdding}
          >
            {isAdding ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}
            {t('locations:add_to_directory')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscoveredGymCard;
