import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LocationFormData {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  website_url: string;
}

export const initialFormData: LocationFormData = {
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
};

export function useLocationMutations(callbacks?: {
  onSubmitSuccess?: () => void;
  onEditSuccess?: () => void;
}) {
  const { t } = useTranslation(['locations', 'common']);
  const queryClient = useQueryClient();

  const submitLocation = useMutation({
    mutationFn: async (location: LocationFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let latitude: number | null = null;
      let longitude: number | null = null;
      
      const addressQuery = [location.address, location.city, location.state, location.country]
        .filter(Boolean)
        .join(', ');
      
      if (addressQuery) {
        try {
          const { data: geoData } = await supabase.functions.invoke('geocode-location', {
            body: { query: addressQuery }
          });
          
          if (geoData?.results?.[0]) {
            latitude = parseFloat(geoData.results[0].lat);
            longitude = parseFloat(geoData.results[0].lon);
          }
        } catch (geoError) {
          console.error('Geocoding failed:', geoError);
        }
      }

      const { data, error } = await supabase
        .from('fitness_locations')
        .insert([{
          ...location,
          latitude,
          longitude,
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
      callbacks?.onSubmitSuccess?.();
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
    mutationFn: async ({ id, data }: { id: string; data: LocationFormData }) => {
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
      callbacks?.onEditSuccess?.();
    },
    onError: () => {
      toast.error(t('common:error'));
    },
  });

  const invalidateLocations = () => {
    queryClient.invalidateQueries({ queryKey: ['fitness-locations'] });
  };

  return {
    submitLocation,
    deleteLocation,
    updateLocation,
    invalidateLocations,
  };
}
