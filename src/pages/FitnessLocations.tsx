import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/common';
import { useAdminStatus } from '@/hooks/auth';
import { MapPin, Plus, ExternalLink, Phone, ArrowLeft, Map, Locate, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateDistance, getCountryFlag, groupLocationsByCountry, categoryIcons, FitnessLocation } from '@/lib/location';
import { useLocationDiscovery, useLocationMutations, initialFormData, type LocationFormData } from '@/hooks/locations';
import { LocationCard, LocationSubmitDialog, LocationEditDialog, LocationSearchDialog, LocationFilters } from '@/components/locations';

const categories = [
  'all', 'gym', 'crossfit', 'mma', 'yoga', 'swimming', 
  'cycling', 'climbing', 'boxing', 'pilates', 'health_store', 'restaurant', 'other'
];

const FitnessLocations = () => {
  const { t } = useTranslation(['locations', 'common']);
  const { isAdmin } = useAdminStatus();
  
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<FitnessLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [formData, setFormData] = useState<LocationFormData>(initialFormData);
  const [editFormData, setEditFormData] = useState<LocationFormData>(initialFormData);
  
  const discovery = useLocationDiscovery();
  const mutations = useLocationMutations({
    onSubmitSuccess: () => { setIsSubmitDialogOpen(false); setFormData(initialFormData); },
    onEditSuccess: () => { setIsEditDialogOpen(false); setEditingLocation(null); },
  });

  const { data: locations, isLoading } = useQuery({
    queryKey: ['fitness-locations', selectedCategory, searchQuery, discovery.nearMeMode, discovery.userLocation?.lat],
    queryFn: async () => {
      let query = supabase.from('fitness_locations').select('*').eq('is_active', true);
      if (selectedCategory !== 'all') query = query.eq('category', selectedCategory);
      if (searchQuery && !discovery.nearMeMode) query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      if (discovery.nearMeMode) query = query.not('latitude', 'is', null).not('longitude', 'is', null);
      const { data, error } = await query;
      if (error) throw error;
      let results = (data || []) as FitnessLocation[];
      if (discovery.nearMeMode && discovery.userLocation) {
        results = results.map(loc => ({ ...loc, distance: loc.latitude && loc.longitude ? calculateDistance(discovery.userLocation!.lat, discovery.userLocation!.lng, loc.latitude, loc.longitude) : null }))
          .filter(loc => loc.distance !== null && loc.distance <= 50)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0)) as FitnessLocation[];
      } else {
        results = results.sort((a, b) => a.name.localeCompare(b.name));
      }
      return results;
    },
  });

  const handleEdit = (location: FitnessLocation) => {
    setEditingLocation(location);
    setEditFormData({ name: location.name, category: location.category, description: location.description || '', address: location.address || '', city: location.city, state: location.state || '', country: location.country, postal_code: location.postal_code || '', phone: location.phone || '', website_url: location.website_url || '' });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <SEOHead titleKey="seo:locations.title" descriptionKey="seo:locations.description" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2"><MapPin className="h-8 w-8 text-primary" />{t('locations:title')}</h1>
              <p className="text-muted-foreground">{t('locations:subtitle')}</p>
            </div>
          </div>
          <LocationSubmitDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen} formData={formData} setFormData={setFormData} onSubmit={(e) => { e.preventDefault(); mutations.submitLocation.mutate(formData); }} isPending={mutations.submitLocation.isPending} categories={categories} />
        </div>

        <LocationFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} viewMode={viewMode} setViewMode={setViewMode} nearMeMode={discovery.nearMeMode} setNearMeMode={discovery.setNearMeMode} discoverMode={discovery.discoverMode} setDiscoverMode={discovery.setDiscoverMode} locationLoading={discovery.locationLoading} discoverLoading={discovery.discoverLoading} locationName={discovery.locationName} discoverCategory={discovery.discoverCategory} setDiscoverCategory={discovery.setDiscoverCategory} userLocation={discovery.userLocation} onFindNearMe={() => discovery.handleUseGpsLocation(false)} onChangeLocation={() => setIsLocationDialogOpen(true)} onRefreshDiscover={() => discovery.userLocation && discovery.handleDiscoverAtLocation(discovery.userLocation.lat, discovery.userLocation.lng)} categories={categories} />

        {discovery.discoverMode && (
          <div className="space-y-4">
            {discovery.discoverLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-48" />)}</div>
            ) : discovery.discoveredGyms.length > 0 ? (
              <>
                <p className="text-muted-foreground">{t('locations:discover_results', { count: discovery.discoveredGyms.length })}</p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {discovery.discoveredGyms.map((gym) => {
                    const CategoryIcon = categoryIcons[gym.category] || MapPin;
                    return (
                      <Card key={gym.osm_id} className="overflow-hidden hover:shadow-lg transition-shadow border-primary/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2"><CategoryIcon className="h-5 w-5 text-primary" /><CardTitle className="text-lg">{gym.name}</CardTitle></div>
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500">{t('locations:external_source')}</Badge>
                          </div>
                          {(gym.city || gym.address) && <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-3 w-3" />{gym.address || gym.city}{gym.country ? `, ${gym.country}` : ''}</div>}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Badge variant="outline">{t(`locations:categories.${gym.category}`)}</Badge>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {gym.website && <Button variant="outline" size="sm" asChild><a href={gym.website} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3 mr-1" />{t('locations:visit_website')}</a></Button>}
                            {gym.phone && <Button variant="outline" size="sm" asChild><a href={`tel:${gym.phone}`}><Phone className="h-3 w-3 mr-1" />{t('locations:call')}</a></Button>}
                            <Button size="sm" onClick={() => discovery.handleAddDiscoveredGym(gym, mutations.invalidateLocations)} disabled={discovery.addingGymId === gym.osm_id}>{discovery.addingGymId === gym.osm_id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}{t('locations:add_to_directory')}</Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : discovery.userLocation ? (
              <Card className="p-8 text-center"><MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{t('locations:no_locations')}</h3><p className="text-muted-foreground">{t('locations:discover_no_results')}</p><div className="flex gap-2 justify-center mt-4"><Button variant="outline" onClick={() => setIsLocationDialogOpen(true)}>{t('locations:increase_radius')}</Button><Button onClick={() => setIsSubmitDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('locations:add_location')}</Button></div></Card>
            ) : (
              <Card className="p-8 text-center"><Locate className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{t('locations:discover_title')}</h3><p className="text-muted-foreground mb-4">{t('locations:discover_desc')}</p><Button onClick={() => discovery.handleUseGpsLocation(false)} disabled={discovery.locationLoading}>{discovery.locationLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Locate className="h-4 w-4 mr-2" />}{t('locations:find_near_me')}</Button></Card>
            )}
          </div>
        )}

        {!discovery.discoverMode && (isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-64" />)}</div>
        ) : locations && locations.length > 0 ? (
          viewMode === 'list' ? (
            <div className="space-y-8">
              {!discovery.nearMeMode ? Object.entries(groupLocationsByCountry(locations)).sort(([a], [b]) => a.localeCompare(b)).map(([country, countryLocations]) => (
                <div key={country} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-border pb-2"><span className="text-2xl">{getCountryFlag(country)}</span><h2 className="text-xl font-semibold">{country}</h2><Badge variant="secondary" className="ml-auto">{countryLocations.length} {countryLocations.length === 1 ? t('locations:location') : t('locations:locations_count')}</Badge></div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{countryLocations.map((location) => <LocationCard key={location.id} location={location} isAdmin={isAdmin} onEdit={() => handleEdit(location)} onDelete={() => mutations.deleteLocation.mutate(location.id)} />)}</div>
                </div>
              )) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{locations.map((location) => <LocationCard key={location.id} location={location} isAdmin={isAdmin} showDistance showCountryFlag onEdit={() => handleEdit(location)} onDelete={() => mutations.deleteLocation.mutate(location.id)} />)}</div>
              )}
            </div>
          ) : <Card className="h-96 flex items-center justify-center"><Map className="h-16 w-16 text-muted-foreground" /></Card>
        ) : (
          <Card className="text-center py-12"><MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-xl font-semibold mb-2">{discovery.nearMeMode ? t('locations:no_nearby') : t('locations:no_locations')}</h3><p className="text-muted-foreground mb-4">{discovery.nearMeMode ? t('locations:no_nearby_desc') : t('locations:no_locations_desc')}</p><Button onClick={() => setIsSubmitDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('locations:submit_location')}</Button></Card>
        ))}

        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20"><CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6"><div><h3 className="text-xl font-semibold">{t('locations:submit_location')}</h3><p className="text-muted-foreground">{t('locations:submit_location_desc')}</p></div><Button size="lg" onClick={() => setIsSubmitDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('locations:submit_location')}</Button></CardContent></Card>

        <LocationEditDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} formData={editFormData} setFormData={setEditFormData} onSubmit={(e) => { e.preventDefault(); if (editingLocation) mutations.updateLocation.mutate({ id: editingLocation.id, data: editFormData }); }} isPending={mutations.updateLocation.isPending} categories={categories} />
        <LocationSearchDialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen} locationInput={discovery.locationInput} setLocationInput={discovery.setLocationInput} discoverCategory={discovery.discoverCategory} setDiscoverCategory={discovery.setDiscoverCategory} searchRadius={discovery.searchRadius} setSearchRadius={discovery.setSearchRadius} radiusUnit={discovery.radiusUnit} setRadiusUnit={discovery.setRadiusUnit} locationLoading={discovery.locationLoading} geocodeLoading={discovery.geocodeLoading} onUseGps={() => discovery.handleUseGpsLocation(true, () => setIsLocationDialogOpen(false))} onSearch={() => discovery.handleLocationSearch(() => setIsLocationDialogOpen(false))} categories={categories} />
      </div>
    </div>
  );
};

export default FitnessLocations;
