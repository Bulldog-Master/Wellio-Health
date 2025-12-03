import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '@/components/SEOHead';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import PhoneInput from '@/components/PhoneInput';
import GymNameAutocomplete from '@/components/GymNameAutocomplete';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { 
  MapPin, Search, Plus, Star, ExternalLink, Phone, Navigation, 
  Dumbbell, Swords, Heart, Waves, Bike, Mountain, ArrowLeft,
  List, Map, CheckCircle, Filter, Trash2, Pencil, Locate, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

interface FitnessLocation {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website_url: string | null;
  image_url: string | null;
  amenities: string[] | null;
  hours_of_operation: any;
  price_range: string | null;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
}

const categoryIcons: Record<string, any> = {
  gym: Dumbbell,
  crossfit: Dumbbell,
  mma: Swords,
  yoga: Heart,
  swimming: Waves,
  cycling: Bike,
  climbing: Mountain,
  boxing: Swords,
  pilates: Heart,
  other: MapPin,
};

const FitnessLocations = () => {
  const { t } = useTranslation(['locations', 'common']);
  const queryClient = useQueryClient();
  const { isAdmin } = useAdminStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<FitnessLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeMode, setNearMeMode] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualLocationQuery, setManualLocationQuery] = useState('');
  const [isManualLocationDialogOpen, setIsManualLocationDialogOpen] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [nearMeCategoryFilter, setNearMeCategoryFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'gym',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    phone: '',
    website_url: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'gym',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    phone: '',
    website_url: '',
  });

  // Find Near Me handler - with fallback to manual entry
  const handleFindNearMe = () => {
    if (!('geolocation' in navigator)) {
      // Show manual location dialog as fallback
      setIsManualLocationDialogOpen(true);
      return;
    }
    
    setLocationLoading(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setNearMeMode(true);
        setLocationLoading(false);
        setSearchQuery(''); // Clear search when using near me
      },
      (error) => {
        setLocationLoading(false);
        // Instead of just showing error, offer manual entry
        setIsManualLocationDialogOpen(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Geocode a location string to coordinates via edge function
  const handleManualLocationSearch = async () => {
    if (!manualLocationQuery.trim()) return;
    
    setGeocodeLoading(true);
    try {
      console.log('Starting geocode search for:', manualLocationQuery);
      
      const { data, error } = await supabase.functions.invoke('geocode-location', {
        body: { query: manualLocationQuery }
      });
      
      console.log('Geocode response - data:', data, 'error:', error);
      
      if (error) {
        console.error('Geocoding error:', error);
        toast.error(t('locations:location_not_found'));
        setGeocodeLoading(false);
        return;
      }
      
      if (!data) {
        console.error('No data returned from geocode');
        toast.error(t('locations:location_not_found'));
        setGeocodeLoading(false);
        return;
      }
      
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const result = data.results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        if (isNaN(lat) || isNaN(lng)) {
          console.error('Invalid coordinates:', result.lat, result.lon);
          toast.error(t('locations:location_not_found'));
          setGeocodeLoading(false);
          return;
        }
        
        console.log('Setting user location:', { lat, lng });
        
        setUserLocation({ lat, lng });
        setNearMeMode(true);
        // Apply category filter if specified
        if (nearMeCategoryFilter !== 'all') {
          setSelectedCategory(nearMeCategoryFilter);
        }
        setIsManualLocationDialogOpen(false);
        setManualLocationQuery('');
        setNearMeCategoryFilter('all');
        toast.success(t('locations:location_found'));
      } else {
        console.log('No results in geocode response:', data);
        toast.error(t('locations:location_not_found'));
      }
    } catch (error) {
      console.error('Geocoding catch error:', error);
      toast.error(t('locations:location_not_found'));
    } finally {
      setGeocodeLoading(false);
    }
  };

  const { data: locations, isLoading } = useQuery({
    queryKey: ['fitness-locations', selectedCategory, searchQuery, nearMeMode, userLocation?.lat, userLocation?.lng],
    queryFn: async () => {
      let query = supabase
        .from('fitness_locations')
        .select('*')
        .eq('is_active', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery && !nearMeMode) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      // For near me mode, only get locations with coordinates
      if (nearMeMode) {
        query = query.not('latitude', 'is', null).not('longitude', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let results = data as FitnessLocation[];
      
      // If near me mode, calculate distance and sort by it
      if (nearMeMode && userLocation) {
        results = results
          .map(loc => ({
            ...loc,
            distance: loc.latitude && loc.longitude 
              ? calculateDistance(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude)
              : null
          }))
          .filter(loc => loc.distance !== null && loc.distance <= 50) // Within 50 miles
          .sort((a, b) => (a.distance || 0) - (b.distance || 0)) as FitnessLocation[];
      } else {
        // Sort alphabetically when not in near me mode
        results = results.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      return results;
    },
  });

  const submitLocation = useMutation({
    mutationFn: async (location: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fitness_locations')
        .insert([{
          ...location,
          submitted_by: user.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitness-locations'] });
      toast.success(t('locations:location_submitted'));
      setIsSubmitDialogOpen(false);
      setFormData({
        name: '',
        category: 'gym',
        description: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        phone: '',
        website_url: '',
      });
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const deleteLocation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('fitness_locations')
        .delete()
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitness-locations'] });
      toast.success(t('locations:location_deleted'));
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const updateLocation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editFormData }) => {
      const { error } = await supabase
        .from('fitness_locations')
        .update({
          name: data.name,
          category: data.category,
          description: data.description || null,
          address: data.address || null,
          city: data.city,
          state: data.state || null,
          country: data.country,
          postal_code: data.postal_code || null,
          phone: data.phone || null,
          website_url: data.website_url || null,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitness-locations'] });
      toast.success(t('locations:location_updated'));
      setIsEditDialogOpen(false);
      setEditingLocation(null);
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const handleEdit = (location: FitnessLocation) => {
    setEditingLocation(location);
    setEditFormData({
      name: location.name,
      category: location.category,
      description: location.description || '',
      address: location.address || '',
      city: location.city,
      state: location.state || '',
      country: location.country,
      postal_code: location.postal_code || '',
      phone: location.phone || '',
      website_url: location.website_url || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateLocation.mutate({ id: editingLocation.id, data: editFormData });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLocation.mutate(formData);
  };

  const categories = [
    'all', 'gym', 'crossfit', 'mma', 'yoga', 'swimming', 
    'cycling', 'climbing', 'boxing', 'pilates', 'other'
  ];

  const getDirectionsUrl = (location: FitnessLocation) => {
    const address = [location.address, location.city, location.state, location.country]
      .filter(Boolean)
      .join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  };

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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <SEOHead
        titleKey="seo:locations.title"
        descriptionKey="seo:locations.description"
      />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <MapPin className="h-8 w-8 text-primary" />
                {t('locations:title')}
              </h1>
              <p className="text-muted-foreground">{t('locations:subtitle')}</p>
            </div>
          </div>
          
          <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('locations:submit_location')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('locations:submit_location')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>{t('locations:form.name')}</Label>
                  <GymNameAutocomplete
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    onPlaceSelect={(place) => {
                      setFormData(prev => ({
                        ...prev,
                        name: place.name,
                        address: place.street || prev.address,
                        city: place.city || prev.city,
                        state: place.state || prev.state,
                        country: place.country || prev.country,
                        postal_code: place.postalCode || prev.postal_code,
                        phone: place.phone || prev.phone,
                        website_url: place.website || prev.website_url,
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label>{t('locations:form.category')}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'all').map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {t(`locations:categories.${cat}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('locations:form.description')}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>{t('locations:form.address')}</Label>
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={(value) => setFormData({ ...formData, address: value })}
                    onAddressSelect={(addr) => {
                      setFormData(prev => ({
                        ...prev,
                        address: addr.street,
                        city: addr.city || prev.city,
                        state: addr.state || prev.state,
                        country: addr.country || prev.country,
                        postal_code: addr.postalCode || prev.postal_code,
                      }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('locations:form.city')}</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>{t('locations:form.state')}</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('locations:form.country')}</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>{t('locations:form.postal_code')}</Label>
                    <Input
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>{t('locations:form.phone')}</Label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    country={formData.country}
                  />
                </div>
                <div>
                  <Label>{t('locations:form.website')}</Label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitLocation.isPending}>
                  {t('locations:form.submit')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          {/* Near Me / All Locations Toggle */}
          <div className="flex gap-2">
            <Button
              variant={nearMeMode ? 'outline' : 'default'}
              onClick={() => setNearMeMode(false)}
              className="flex-1 md:flex-none"
            >
              <List className="h-4 w-4 mr-2" />
              {t('locations:all_locations')}
            </Button>
            <Button
              variant={nearMeMode ? 'default' : 'outline'}
              onClick={handleFindNearMe}
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
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            {!nearMeMode && (
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
          </div>
        </div>

        {/* Locations */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : locations && locations.length > 0 ? (
          viewMode === 'list' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => {
                const CategoryIcon = categoryIcons[location.category] || MapPin;
                return (
                  <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                          <MapPin className="h-3 w-3" />
                          {location.city}, {location.country}
                        </div>
                        {nearMeMode && (location as any).distance !== undefined && (
                          <Badge variant="outline" className="text-xs bg-primary/10">
                            <Locate className="h-3 w-3 mr-1" />
                            {t('locations:miles_away', { distance: ((location as any).distance as number).toFixed(1) })}
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
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={getDirectionsUrl(location)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
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
                            <a
                              href={location.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {t('locations:visit_website')}
                            </a>
                          </Button>
                        )}
                        {isAdmin && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEdit(location)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              {t('common:edit')}
                            </Button>
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
                                    onClick={() => deleteLocation.mutate(location.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t('common:delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent className="text-center">
                <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Map view requires Mapbox API key configuration.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Contact admin to enable map functionality.
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {nearMeMode ? t('locations:no_nearby') : t('locations:no_locations')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {nearMeMode ? t('locations:no_nearby_desc') : t('locations:no_locations_desc')}
              </p>
              <Button onClick={() => setIsSubmitDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('locations:submit_location')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Submit Location CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
            <div>
              <h3 className="text-xl font-semibold">{t('locations:submit_location')}</h3>
              <p className="text-muted-foreground">{t('locations:submit_location_desc')}</p>
            </div>
            <Button size="lg" onClick={() => setIsSubmitDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('locations:submit_location')}
            </Button>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('locations:edit_location')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>{t('locations:form.name')}</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>{t('locations:form.category')}</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'all').map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`locations:categories.${cat}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('locations:form.description')}</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>{t('locations:form.address')}</Label>
                <Input
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('locations:form.city')}</Label>
                  <Input
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{t('locations:form.state')}</Label>
                  <Input
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('locations:form.country')}</Label>
                  <Input
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>{t('locations:form.postal_code')}</Label>
                  <Input
                    value={editFormData.postal_code}
                    onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t('locations:form.phone')}</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('locations:form.website')}</Label>
                <Input
                  value={editFormData.website_url}
                  onChange={(e) => setEditFormData({ ...editFormData, website_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateLocation.isPending}>
                {t('locations:form.save_changes')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Manual Location Dialog */}
        <Dialog open={isManualLocationDialogOpen} onOpenChange={setIsManualLocationDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('locations:enter_location')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('locations:enter_location_desc')}
              </p>
              <div>
                <Label>{t('locations:city_or_address')}</Label>
                <Input
                  value={manualLocationQuery}
                  onChange={(e) => setManualLocationQuery(e.target.value)}
                  placeholder={t('locations:city_placeholder')}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualLocationSearch()}
                />
              </div>
              <div>
                <Label>{t('locations:facility_type')}</Label>
                <Select
                  value={nearMeCategoryFilter}
                  onValueChange={setNearMeCategoryFilter}
                >
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
              <Button 
                onClick={handleManualLocationSearch} 
                className="w-full"
                disabled={geocodeLoading || !manualLocationQuery.trim()}
              >
                {geocodeLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {t('locations:search_location')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FitnessLocations;
