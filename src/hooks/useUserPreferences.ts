import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UnitSystem } from '@/lib/unitConversion';

export const useUserPreferences = () => {
  const [preferredUnit, setPreferredUnit] = useState<UnitSystem>('imperial');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
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
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const updatePreferredUnit = async (unit: UnitSystem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferred_unit: unit,
        });

      if (!error) {
        setPreferredUnit(unit);
      }
    } catch (error) {
      console.error('Error updating preferred unit:', error);
    }
  };

  return { preferredUnit, updatePreferredUnit, isLoading };
};
