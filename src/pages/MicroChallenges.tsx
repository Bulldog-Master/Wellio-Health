import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MicroChallengeHub } from '@/components/challenges/MicroChallengeHub';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { SEOHead } from '@/components/SEOHead';

const MicroChallenges = () => {
  const { t } = useTranslation(['challenges', 'common', 'seo']);
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        titleKey="micro_challenges_title"
        descriptionKey="micro_challenges_description"
        namespace="seo"
      />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/activity')}
            aria-label={t('common:back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            <h1 className="text-2xl font-bold">{t('micro_challenges')}</h1>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          {t('micro_challenges_desc')}
        </p>

        <SubscriptionGate feature="micro_challenges">
          <MicroChallengeHub />
        </SubscriptionGate>
      </div>
    </>
  );
};

export default MicroChallenges;
