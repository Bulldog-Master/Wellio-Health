import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead, SubscriptionGate } from '@/components/common';
import { CircadianOptimizer } from '@/components/wellness/CircadianOptimizer';

const CircadianRhythm: React.FC = () => {
  const { t } = useTranslation(['fitness', 'common', 'seo']);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        titleKey="seo:circadian_title"
        descriptionKey="seo:circadian_description"
      />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/activity')}
            aria-label={t('common:back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('circadian_optimizer')}</h1>
          </div>
        </div>

        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium">{t('optimize_your_rhythm')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('circadian_intro')}
              </p>
            </div>
          </div>
        </div>

        <SubscriptionGate feature="circadian_optimizer">
          <CircadianOptimizer />
        </SubscriptionGate>
      </div>
    </div>
  );
};

export default CircadianRhythm;
