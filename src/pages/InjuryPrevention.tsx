import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import InjuryPrevention from '@/components/workout/InjuryPrevention';
import { SEOHead } from '@/components/SEOHead';

const InjuryPreventionPage: React.FC = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const navigate = useNavigate();

  return (
    <Layout>
      <SEOHead 
        titleKey="injury_prevention"
        descriptionKey="injury_prevention_desc"
        namespace="fitness"
      />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/activity')}
            aria-label={t('common:back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('injury_prevention')}</h1>
        </div>

        <SubscriptionGate feature="ai_coach">
          <InjuryPrevention />
        </SubscriptionGate>
      </div>
    </Layout>
  );
};

export default InjuryPreventionPage;
