import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Star, ExternalLink, Phone, Navigation, 
  CheckCircle, Locate, Trash2, Pencil
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { FitnessLocation, getCountryFlag, getDirectionsUrl, categoryIcons } from '@/lib/locationUtils';

interface LocationCardProps {
  location: FitnessLocation;
  isAdmin: boolean;
  showDistance?: boolean;
  showCountryFlag?: boolean;
  onEdit?: (location: FitnessLocation) => void;
  onDelete?: (locationId: string) => void;
}

export const LocationCard = ({ 
  location, 
  isAdmin, 
  showDistance = false,
  showCountryFlag = false,
  onEdit, 
  onDelete 
}: LocationCardProps) => {
  const { t } = useTranslation(['locations', 'common']);
  const CategoryIcon = categoryIcons[location.category] || MapPin;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {location.image_url && (
        <div className="h-32 overflow-hidden">
          <img
            src={location.image_url}
            alt={location.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{location.name}</CardTitle>
          </div>
          {location.is_verified && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('locations:verified')}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {showCountryFlag && (
              <span className="text-base mr-1">{getCountryFlag(location.country)}</span>
            )}
            <MapPin className="h-3 w-3" />
            {location.city}{location.state ? `, ${location.state}` : ''}
            {showCountryFlag && `, ${location.country}`}
          </div>
          {showDistance && location.distance !== undefined && (
            <Badge variant="outline" className="text-xs bg-primary/10">
              <Locate className="h-3 w-3 mr-1" />
              {t('locations:miles_away', { distance: location.distance.toFixed(1) })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            {t(`locations:categories.${location.category}`)}
          </Badge>
          {location.price_range && (
            <span className="text-sm text-muted-foreground">
              {location.price_range}
            </span>
          )}
        </div>
        
        {location.total_reviews > 0 && (
          <div className="flex items-center gap-2">
            {renderStars(location.average_rating)}
            <span className="text-sm text-muted-foreground">
              ({location.total_reviews} {t('locations:reviews')})
            </span>
          </div>
        )}

        {location.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {location.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" asChild>
            <a href={getDirectionsUrl(location)} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-3 w-3 mr-1" />
              {t('locations:get_directions')}
            </a>
          </Button>
          {location.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${location.phone}`}>
                <Phone className="h-3 w-3 mr-1" />
                {t('locations:call')}
              </a>
            </Button>
          )}
          {location.website_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={location.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                {t('locations:visit_website')}
              </a>
            </Button>
          )}
          {isAdmin && onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(location)}>
              <Pencil className="h-3 w-3 mr-1" />
              {t('common:edit')}
            </Button>
          )}
          {isAdmin && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('common:delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('locations:delete_location')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('locations:delete_location_confirm')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(location.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('common:delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
