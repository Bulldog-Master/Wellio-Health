import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, Loader2 } from 'lucide-react';
import { SubscriptionGate } from '@/components/common';
import { useProfessionalPortal } from '@/hooks/professional';
import { ApplicationForm, ApprovedDashboard } from '@/components/professional';

const TrainerPortal = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['professional', 'common']);
  
  const {
    application,
    clients,
    isLoading,
    isSubmitting,
    formData,
    setFormData,
    handleSubmit,
  } = useProfessionalPortal('trainer');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <SubscriptionGate feature="trainer_portal">
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8 px-4">
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
              <Dumbbell className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('trainer_portal')}</h1>
              <p className="text-muted-foreground">{t('trainer_portal_desc')}</p>
            </div>
          </div>

          {application?.status === 'approved' ? (
            <ApprovedDashboard
              clients={clients}
              formData={formData}
              setFormData={setFormData}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              clientLabel="Client"
              professionalType="coach"
            />
          ) : (
            <ApplicationForm
              application={application}
              formData={formData}
              setFormData={setFormData}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              specialtiesPlaceholder={t('specialties_placeholder')}
              certificationsPlaceholder={t('certifications_placeholder')}
            />
          )}
        </div>
      </div>
    </SubscriptionGate>
  );
};

export default TrainerPortal;
