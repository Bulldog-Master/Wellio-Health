import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Professional } from './types';
import type { CareTeamRole } from './careTeamVisibility';

export interface CareTeamVisibilityModel {
  hasCoach: boolean;
  hasClinician: boolean;
  visibleRoles: CareTeamRole[];
}
export const useCareTeam = () => {
  const { t } = useTranslation(['professional', 'common']);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch coach relationships
      const { data: coachData } = await supabase
        .from('coach_clients')
        .select(`
          id,
          coach_id,
          created_at,
          coach:profiles!coach_clients_coach_id_fkey(display_name, avatar_url)
        `)
        .eq('client_id', user.id)
        .eq('status', 'active');

      // Fetch clinician relationships
      const { data: clinicianData } = await supabase
        .from('clinician_patients')
        .select(`
          id,
          clinician_id,
          created_at,
          clinician:profiles!clinician_patients_clinician_id_fkey(display_name, avatar_url)
        `)
        .eq('patient_id', user.id)
        .eq('status', 'active');

      const combined: Professional[] = [];

      if (coachData) {
        coachData.forEach((item: any) => {
          combined.push({
            id: item.id,
            professional_id: item.coach_id,
            professional_type: 'coach',
            started_at: item.created_at,
            professional: item.coach
          });
        });
      }

      if (clinicianData) {
        clinicianData.forEach((item: any) => {
          combined.push({
            id: item.id,
            professional_id: item.clinician_id,
            professional_type: 'clinician',
            started_at: item.created_at,
            professional: item.clinician
          });
        });
      }

      setProfessionals(combined);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const handleRevokeAccess = async (professional: Professional) => {
    setRevoking(professional.id);
    try {
      const table = professional.professional_type === 'coach' ? 'coach_clients' : 'clinician_patients';
      
      const { error } = await supabase
        .from(table)
        .update({ status: 'inactive' })
        .eq('id', professional.id);

      if (error) throw error;

      setProfessionals(prev => prev.filter(p => p.id !== professional.id));
      toast.success(t('access_revoked'));
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error(t('common:error'));
    } finally {
      setRevoking(null);
    }
  };

  const coaches = professionals.filter(p => p.professional_type === 'coach');
  const clinicians = professionals.filter(p => p.professional_type === 'clinician');
  const hasCoach = coaches.length > 0;
  const hasClinician = clinicians.length > 0;

  const visibility: CareTeamVisibilityModel = {
    hasCoach,
    hasClinician,
    visibleRoles: [
      ...(hasCoach ? (['coach'] as CareTeamRole[]) : []),
      ...(hasClinician ? (['clinician'] as CareTeamRole[]) : []),
    ],
  };

  return {
    professionals,
    coaches,
    clinicians,
    loading,
    revoking,
    hasCoach,
    hasClinician,
    visibility,
    fetchProfessionals,
    handleRevokeAccess
  };
};
