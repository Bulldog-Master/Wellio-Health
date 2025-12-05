import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UnitSystem } from '@/lib/unitConversion';

export const useUserPreferences = () => {
  const [preferredUnit, setPreferredUnit] = useState<UnitSystem>(() => {
    const cached = localStorage.getItem('preferredUnit');
    return (cached as UnitSystem) || 'imperial';
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        // Only fetch from DB if no local preference exists
        const cachedUnit = localStorage.getItem('preferredUnit');
        if (cachedUnit) {
          setIsLoading(false);
          return; // Use localStorage value, don't overwrite with DB
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('preferred_unit')
          .eq('id', user.id)
          .single();

        if (profile?.preferred_unit) {
          setPreferredUnit(profile.preferred_unit as UnitSystem);
          localStorage.setItem('preferredUnit', profile.preferred_unit);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const updatePreferredUnit = useCallback(async (unit: UnitSystem) => {
    // Update UI and localStorage immediately
    setPreferredUnit(unit);
    localStorage.setItem('preferredUnit', unit);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_unit: unit })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating preferred unit:', error);
      }
    } catch (error) {
      console.error('Error updating preferred unit:', error);
    }
  }, []);

  const toggleUnit = useCallback(() => {
    const newUnit = preferredUnit === 'imperial' ? 'metric' : 'imperial';
    updatePreferredUnit(newUnit);
  }, [preferredUnit, updatePreferredUnit]);

  return { preferredUnit, updatePreferredUnit, toggleUnit, isLoading };
};
