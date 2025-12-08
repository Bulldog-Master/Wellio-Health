import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmotionFitnessEngine } from '@/components/wellness/EmotionFitnessEngine';
import { SubscriptionGate, SEOHead } from '@/components/common';

const EmotionFitness: React.FC = () => {
  const { t } = useTranslation(['fitness', 'common', 'seo']);
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        titleKey="emotion_fitness_title"
        descriptionKey="emotion_fitness_description"
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/activity')}
              aria-label={t('common:back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                {t('emotion_fitness_engine')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('emotion_fitness_desc')}
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl">
              <Heart className="w-6 h-6 text-pink-500 mb-2" />
              <h3 className="font-medium text-sm">{t('mood_tracking')}</h3>
              <p className="text-xs text-muted-foreground">{t('mood_tracking_desc')}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-500 mb-2" />
              <h3 className="font-medium text-sm">{t('ai_insights')}</h3>
              <p className="text-xs text-muted-foreground">{t('ai_insights_mood_desc')}</p>
            </div>
          </div>

          {/* Main Content with Gate */}
          <SubscriptionGate
            feature="emotion_fitness"
            fallback={
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t('unlock_emotion_fitness')}</h2>
                <p className="text-muted-foreground mb-4">{t('emotion_fitness_premium_desc')}</p>
              </div>
            }
          >
            <EmotionFitnessEngine />
          </SubscriptionGate>
        </div>
      </div>
    </>
  );
};

export default EmotionFitness;
