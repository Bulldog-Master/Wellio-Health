import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiscoveredGym {
  osm_id: string;
  name: string;
  category: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  website?: string;
  lat: number;
  lon: number;
}

interface UseLocationDiscoveryReturn {
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number } | null) => void;
  locationName: string;
  setLocationName: (name: string) => void;
  locationInput: string;
  setLocationInput: (input: string) => void;
  nearMeMode: boolean;
  setNearMeMode: (mode: boolean) => void;
  discoverMode: boolean;
  setDiscoverMode: (mode: boolean) => void;
  locationLoading: boolean;
  geocodeLoading: boolean;
  discoverLoading: boolean;
  discoveredGyms: DiscoveredGym[];
  setDiscoveredGyms: (gyms: DiscoveredGym[]) => void;
  discoverCategory: string;
  setDiscoverCategory: (cat: string) => void;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  radiusUnit: 'miles' | 'km';
  setRadiusUnit: (unit: 'miles' | 'km') => void;
  addingGymId: string | null;
  handleUseGpsLocation: (fromDialog?: boolean, onCloseDialog?: () => void) => void;
  handleLocationSearch: (onCloseDialog?: () => void) => Promise<void>;
  handleDiscoverAtLocation: (lat: number, lng: number) => Promise<void>;
  handleAddDiscoveredGym: (gym: DiscoveredGym, invalidateLocations: () => void) => Promise<void>;
}

export function useLocationDiscovery(): UseLocationDiscoveryReturn {
  const { t } = useTranslation(['locations', 'common']);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [locationInput, setLocationInput] = useState('');
  const [nearMeMode, setNearMeMode] = useState(false);
  const [discoverMode, setDiscoverMode] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoveredGyms, setDiscoveredGyms] = useState<DiscoveredGym[]>([]);
  const [discoverCategory, setDiscoverCategory] = useState<string>('all');
  const [searchRadius, setSearchRadius] = useState(10);
  const [radiusUnit, setRadiusUnit] = useState<'miles' | 'km'>('miles');
  const [addingGymId, setAddingGymId] = useState<string | null>(null);

  const handleDiscoverAtLocation = async (lat: number, lng: number) => {
    setDiscoverLoading(true);
    setDiscoveredGyms([]);
    
    const radiusInMeters = radiusUnit === 'miles' 
      ? searchRadius * 1609.34 
      : searchRadius * 1000;
    
    try {
      const { data, error } = await supabase.functions.invoke('discover-gyms', {
        body: { lat, lon: lng, radius: radiusInMeters, category: discoverCategory }
      });
      
      if (error) {
        console.error('Discover error:', error);
        return;
      }
      
      if (data?.results?.length > 0) {
        setDiscoveredGyms(data.results);
        toast.success(t('locations:discover_found', { count: data.results.length }));
      }
    } catch (error) {
      console.error('Discover error:', error);
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleUseGpsLocation = (fromDialog = false, onCloseDialog?: () => void) => {
    if (!('geolocation' in navigator)) {
      toast.error(t('locations:location_not_supported'));
      return;
    }
    
    toast.info(t('locations:getting_location'));
    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        toast.success(`${t('locations:location_coords_found')}: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        
        setUserLocation(coords);
        setNearMeMode(true);
        setDiscoverMode(true);
        
        if (fromDialog && onCloseDialog) {
          onCloseDialog();
        }
        
        // Reverse geocode
        supabase.functions.invoke('geocode-location', {
          body: { query: `${coords.lat}, ${coords.lng}` }
        }).then(({ data }) => {
          if (data?.results?.[0]?.display_name) {
            const name = data.results[0].display_name.split(',').slice(0, 2).join(',');
            setLocationName(name);
            setLocationInput(name);
          } else {
            setLocationName(t('locations:your_location'));
            setLocationInput(t('locations:your_location'));
          }
        }).catch(() => {
          setLocationName(t('locations:your_location'));
          setLocationInput(t('locations:your_location'));
        });
        
        setLocationLoading(false);
        
        // Immediately search
        await handleDiscoverAtLocation(coords.lat, coords.lng);
      },
      (error) => {
        console.error('GPS error:', error);
        setLocationLoading(false);
        if (!fromDialog) {
          // Will trigger dialog open in parent
        } else {
          toast.error(t('locations:location_denied'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLocationSearch = async (onCloseDialog?: () => void) => {
    if (!locationInput.trim() && !userLocation) return;
    
    setGeocodeLoading(true);
    
    let lat: number;
    let lng: number;
    
    if (userLocation && locationInput === locationName) {
      lat = userLocation.lat;
      lng = userLocation.lng;
    } else {
      try {
        const { data, error } = await supabase.functions.invoke('geocode-location', {
          body: { query: locationInput }
        });
        
        if (error || !data?.results?.length) {
          toast.error(t('locations:location_not_found'));
          setGeocodeLoading(false);
          return;
        }
        
        const result = data.results[0];
        lat = parseFloat(result.lat);
        lng = parseFloat(result.lon);
        
        if (isNaN(lat) || isNaN(lng)) {
          toast.error(t('locations:location_not_found'));
          setGeocodeLoading(false);
          return;
        }
        
        setUserLocation({ lat, lng });
      } catch (error) {
        console.error('Geocoding error:', error);
        toast.error(t('locations:location_not_found'));
        setGeocodeLoading(false);
        return;
      }
    }
    
    setLocationName(locationInput);
    setNearMeMode(true);
    setDiscoverMode(true);
    onCloseDialog?.();
    setGeocodeLoading(false);
    toast.success(t('locations:location_found'));
    
    await handleDiscoverAtLocation(lat, lng);
  };

  const handleAddDiscoveredGym = async (gym: DiscoveredGym, invalidateLocations: () => void) => {
    setAddingGymId(gym.osm_id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('fitness_locations')
        .insert([{
          name: gym.name,
          category: gym.category || 'gym',
          address: gym.address,
          city: gym.city || '',
          state: gym.state,
          country: gym.country || '',
          postal_code: gym.postal_code,
          phone: gym.phone,
          website_url: gym.website,
          latitude: gym.lat,
          longitude: gym.lon,
          submitted_by: user.id,
        }]);
      
      if (error) throw error;
      
      invalidateLocations();
      toast.success(t('locations:location_submitted'));
      
      setDiscoveredGyms(prev => prev.filter(g => g.osm_id !== gym.osm_id));
    } catch (error) {
      console.error('Add gym error:', error);
      toast.error(t('common:error'));
    } finally {
      setAddingGymId(null);
    }
  };

  return {
    userLocation,
    setUserLocation,
    locationName,
    setLocationName,
    locationInput,
    setLocationInput,
    nearMeMode,
    setNearMeMode,
    discoverMode,
    setDiscoverMode,
    locationLoading,
    geocodeLoading,
    discoverLoading,
    discoveredGyms,
    setDiscoveredGyms,
    discoverCategory,
    setDiscoverCategory,
    searchRadius,
    setSearchRadius,
    radiusUnit,
    setRadiusUnit,
    addingGymId,
    handleUseGpsLocation,
    handleLocationSearch,
    handleDiscoverAtLocation,
    handleAddDiscoveredGym,
  };
}
