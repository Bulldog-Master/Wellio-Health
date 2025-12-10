import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Stethoscope, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClinicianDashboardScreen } from '@/features/clinician/ClinicianDashboardFeature';
import { SEOHead } from '@/components/common';

const ClinicianDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['clinician', 'common', 'seo']);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkClinicianRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has clinician or practitioner role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['clinician', 'practitioner', 'admin']);

      if (roles && roles.length > 0) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };

    checkClinicianRole();
  }, [navigate]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead titleKey="seo:clinician_dashboard_title" descriptionKey="seo:clinician_dashboard_description" />
        <div className="container max-w-4xl py-8 px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common:back')}
          </Button>

          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t('clinician:clinician_access_required')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('clinician:clinician_access_required_desc')}
            </p>
            <Button onClick={() => navigate('/practitioner-portal')}>
              {t('clinician:apply_as_practitioner')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead titleKey="seo:clinician_dashboard_title" descriptionKey="seo:clinician_dashboard_description" />
      <div className="container max-w-6xl py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common:back')}
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('clinician:clinician_dashboard')}</h1>
            <p className="text-muted-foreground">
              {t('clinician:clinician_dashboard_desc')}
            </p>
          </div>
        </div>

        <ClinicianDashboardScreen />
      </div>
    </div>
  );
};

export default ClinicianDashboard;
