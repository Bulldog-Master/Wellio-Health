import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { 
  ProfessionalApplication, 
  ProfessionalClient, 
  ProfessionalFormData,
  ProfessionalType 
} from '@/components/professional/types';

const initialFormData: ProfessionalFormData = {
  full_name: '',
  email: '',
  phone: '',
  bio: '',
  specialties: '',
  certifications: '',
  years_experience: '',
  hourly_rate: '',
  location: '',
  website_url: ''
};

export const useProfessionalPortal = (professionalType: ProfessionalType) => {
  const { t } = useTranslation(['professional', 'common']);
  const [application, setApplication] = useState<ProfessionalApplication | null>(null);
  const [clients, setClients] = useState<ProfessionalClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProfessionalFormData>(initialFormData);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: appData } = await supabase
        .from('professional_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('professional_type', professionalType)
        .maybeSingle();

      if (appData) {
        setApplication(appData);
        setFormData({
          full_name: appData.full_name || '',
          email: user.email || '',
          phone: '',
          bio: appData.bio || '',
          specialties: appData.specialties?.join(', ') || '',
          certifications: appData.certifications?.join(', ') || '',
          years_experience: appData.years_experience?.toString() || '',
          hourly_rate: appData.hourly_rate?.toString() || '',
          location: appData.location || '',
          website_url: appData.website_url || ''
        });

        if (appData.status === 'approved') {
          const { data: clientsData } = await supabase
            .from('professional_clients')
            .select('*')
            .eq('professional_id', user.id)
            .eq('professional_type', professionalType);

          if (clientsData) {
            setClients(clientsData);
          }
        }
      } else {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const applicationData = {
        user_id: user.id,
        professional_type: professionalType,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        bio: formData.bio || null,
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : null,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : null,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        location: formData.location || null,
        website_url: formData.website_url || null
      };

      const { data, error } = await supabase
        .from('professional_applications')
        .upsert(applicationData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      setApplication(data);
      toast.success(t('application_submitted'), {
        description: t('application_submitted_desc')
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(t('common:error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    application,
    clients,
    isLoading,
    isSubmitting,
    formData,
    setFormData,
    handleSubmit,
  };
};
