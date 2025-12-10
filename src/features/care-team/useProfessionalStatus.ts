import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfessionalStatus {
  isCoach: boolean;
  isClinician: boolean;
  isProfessional: boolean;
  professionalType: 'coach' | 'clinician' | null;
  loading: boolean;
}

export const useProfessionalStatus = (): ProfessionalStatus => {
  const [status, setStatus] = useState<ProfessionalStatus>({
    isCoach: false,
    isClinician: false,
    isProfessional: false,
    professionalType: null,
    loading: true
  });

  useEffect(() => {
    const checkProfessionalStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setStatus(prev => ({ ...prev, loading: false }));
          return;
        }

        // Check if user has an approved coach application
        const { data: coachApp } = await supabase
          .from('professional_applications')
          .select('status')
          .eq('user_id', user.id)
          .eq('professional_type', 'coach')
          .eq('status', 'approved')
          .maybeSingle();

        // Check if user has an approved clinician application
        const { data: clinicianApp } = await supabase
          .from('professional_applications')
          .select('status')
          .eq('user_id', user.id)
          .eq('professional_type', 'clinician')
          .eq('status', 'approved')
          .maybeSingle();

        const isCoach = !!coachApp;
        const isClinician = !!clinicianApp;

        setStatus({
          isCoach,
          isClinician,
          isProfessional: isCoach || isClinician,
          professionalType: isCoach ? 'coach' : isClinician ? 'clinician' : null,
          loading: false
        });
      } catch (error) {
        console.error('Error checking professional status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkProfessionalStatus();
  }, []);

  return status;
};
