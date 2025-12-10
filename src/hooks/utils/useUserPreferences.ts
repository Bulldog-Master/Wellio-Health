import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UnitSystem } from '@/lib/utils';

const STORAGE_KEY = 'wellio-preferred-unit';

export const useUserPreferences = () => {
  const [preferredUnit, setPreferredUnit] = useState<UnitSystem>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    return (cached as UnitSystem) || 'imperial';
  });

  const updatePreferredUnit = useCallback(async (unit: UnitSystem) => {
    setPreferredUnit(unit);
    localStorage.setItem(STORAGE_KEY, unit);

    // Sync to DB in background (non-blocking)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ preferred_unit: unit })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error syncing unit preference:', error);
    }
  }, []);

  const toggleUnit = useCallback(() => {
    const newUnit = preferredUnit === 'imperial' ? 'metric' : 'imperial';
    updatePreferredUnit(newUnit);
  }, [preferredUnit, updatePreferredUnit]);

  return { preferredUnit, updatePreferredUnit, toggleUnit, isLoading: false };
};
