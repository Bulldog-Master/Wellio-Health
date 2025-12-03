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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import SEOHead from '@/components/SEOHead';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import PhoneInput from '@/components/PhoneInput';
import { 
  MapPin, Search, Plus, Star, ExternalLink, Phone, Navigation, 
  Dumbbell, Swords, Heart, Waves, Bike, Mountain, Award, ArrowLeft,
  List, Map, CheckCircle, Clock, DollarSign, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
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

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // User denied location or error
        }
      );
    }
  }, []);

  const { data: locations, isLoading } = useQuery({
    queryKey: ['fitness-locations', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('fitness_locations')
        .select('*')
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('average_rating', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FitnessLocation[];
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
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('locations:search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {location.city}, {location.country}
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
              <h3 className="text-xl font-semibold mb-2">{t('locations:no_locations')}</h3>
              <p className="text-muted-foreground mb-4">{t('locations:no_locations_desc')}</p>
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
      </div>
    </div>
  );
};

export default FitnessLocations;
