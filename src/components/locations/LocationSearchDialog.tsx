import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Locate, Loader2, Search } from 'lucide-react';

interface LocationSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationInput: string;
  setLocationInput: (input: string) => void;
  discoverCategory: string;
  setDiscoverCategory: (cat: string) => void;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  radiusUnit: 'miles' | 'km';
  setRadiusUnit: (unit: 'miles' | 'km') => void;
  locationLoading: boolean;
  geocodeLoading: boolean;
  onUseGps: () => void;
  onSearch: () => void;
  categories: string[];
}

export function LocationSearchDialog({
  open,
  onOpenChange,
  locationInput,
  setLocationInput,
  discoverCategory,
  setDiscoverCategory,
  searchRadius,
  setSearchRadius,
  radiusUnit,
  setRadiusUnit,
  locationLoading,
  geocodeLoading,
  onUseGps,
  onSearch,
  categories,
}: LocationSearchDialogProps) {
  const { t } = useTranslation(['locations', 'common']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('locations:enter_location')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('locations:enter_location_desc')}
          </p>
          
          <Button 
            onClick={onUseGps} 
            variant="outline"
            className="w-full"
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Locate className="h-4 w-4 mr-2" />
            )}
            {t('locations:use_my_location')}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('common:or')}</span>
            </div>
          </div>
          
          <div>
            <Label>{t('locations:city_or_address')}</Label>
            <Input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder={t('locations:city_placeholder')}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
          </div>
          <div>
            <Label>{t('locations:facility_type')}</Label>
            <Select value={discoverCategory} onValueChange={setDiscoverCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`locations:categories.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('locations:search_radius')}</Label>
            <div className="flex gap-2">
              <Select
                value={searchRadius.toString()}
                onValueChange={(val) => setSearchRadius(parseInt(val))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 5, 10, 15, 25, 50].map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={radiusUnit} onValueChange={(val) => setRadiusUnit(val as 'miles' | 'km')}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="miles">{t('locations:miles')}</SelectItem>
                  <SelectItem value="km">{t('locations:km')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={onSearch} 
            className="w-full"
            disabled={geocodeLoading || !locationInput.trim()}
          >
            {geocodeLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {t('locations:search')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
