import { supabase } from '@/integrations/supabase/client';

type AccessType = 'view_score' | 'view_trend' | 'view_details' | 'export';

export const useDataAccessLog = () => {
  const logAccess = async (clientId: string, accessType: AccessType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('data_access_log').insert({
        professional_id: user.id,
        client_id: clientId,
        access_type: accessType
      });
    } catch (error) {
      // Silently fail - logging shouldn't break the app
      console.error('Error logging data access:', error);
    }
  };

  return { logAccess };
};
