import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, List, Map, Locate, Filter, Loader2 } from 'lucide-react';

interface LocationFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  viewMode: 'list' | 'map';
  setViewMode: (mode: 'list' | 'map') => void;
  nearMeMode: boolean;
  setNearMeMode: (mode: boolean) => void;
  discoverMode: boolean;
  setDiscoverMode: (mode: boolean) => void;
  locationLoading: boolean;
  discoverLoading: boolean;
  locationName: string;
  discoverCategory: string;
  setDiscoverCategory: (cat: string) => void;
  userLocation: { lat: number; lng: number } | null;
  onFindNearMe: () => void;
  onChangeLocation: () => void;
  onRefreshDiscover: () => void;
  categories: string[];
}

export function LocationFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode,
  nearMeMode,
  setNearMeMode,
  discoverMode,
  setDiscoverMode,
  locationLoading,
  discoverLoading,
  locationName,
  discoverCategory,
  setDiscoverCategory,
  userLocation,
  onFindNearMe,
  onChangeLocation,
  onRefreshDiscover,
  categories,
}: LocationFiltersProps) {
  const { t } = useTranslation(['locations', 'common']);

  return (
    <div className="flex flex-col gap-4">
      {/* Mode Toggle */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!nearMeMode && !discoverMode ? 'default' : 'outline'}
          onClick={() => { setNearMeMode(false); setDiscoverMode(false); }}
          className="flex-1 md:flex-none"
        >
          <List className="h-4 w-4 mr-2" />
          {t('locations:all_locations')}
        </Button>
        <Button
          variant={nearMeMode ? 'default' : 'outline'}
          onClick={() => { onFindNearMe(); setDiscoverMode(false); }}
          disabled={locationLoading}
          className="flex-1 md:flex-none"
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Locate className="h-4 w-4 mr-2" />
          )}
          {t('locations:find_near_me')}
        </Button>
        <Button
          variant={discoverMode ? 'default' : 'outline'}
          onClick={() => { setDiscoverMode(true); setNearMeMode(false); }}
          className="flex-1 md:flex-none"
        >
          <Search className="h-4 w-4 mr-2" />
          {t('locations:discover_gyms')}
        </Button>
      </div>
      
      {/* Near Me / Discover Location Bar */}
      {(nearMeMode || discoverMode) && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Locate className="h-4 w-4 text-primary" />
              <span className="font-medium">{t('locations:searching_near')}:</span>
              <span className="text-muted-foreground">{locationName || t('locations:your_location')}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onChangeLocation}
                className="ml-auto"
              >
                {t('locations:change_location')}
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <Select value={discoverCategory} onValueChange={setDiscoverCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('locations:filter_category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`locations:categories.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={onRefreshDiscover}
                disabled={discoverLoading || !userLocation}
                variant="outline"
              >
                {discoverLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {t('locations:refresh_search')}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {!nearMeMode && !discoverMode && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('locations:search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        {!discoverMode && (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className={nearMeMode ? "w-full md:w-64" : "w-full md:w-48"}>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('locations:filter_category')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`locations:categories.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {!discoverMode && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('map')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
