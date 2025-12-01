import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Footprints, TrendingUp, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';

const StepCount = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['fitness', 'common']);
  const dateLocale = i18n.language?.startsWith('es') ? es : undefined;

  return (
    <Layout>
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        {/* Back Button */}
        <div className="px-6 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/activity')}
            className="gap-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common:back_to_activity')}
          </Button>
        </div>

        {/* Summary Header */}
        <div className="px-6 pt-2 pb-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {format(new Date(), 'EEEE, MMM dd', { locale: dateLocale }).toUpperCase()}
          </p>
          <h1 className="text-5xl font-bold mt-1">{t('fitness:summary')}</h1>
        </div>

        <div className="space-y-3 px-6">
          {/* Activity Ring Card - Coming Soon */}
          <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden opacity-60">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">{t('fitness:activity_ring')}</h2>
              <div className="flex items-center gap-8">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <div className="w-full h-full rounded-full border-8 border-muted/30" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-1">{t('fitness:move')}</h3>
                  <p className="text-3xl font-bold text-muted-foreground">
                    ---/---
                    <span className="text-xl">CAL</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Step Count Card - Coming Soon */}
          <Card className="hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('fitness:step_count')}</h2>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>
              
              <div className="text-center py-12 space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                  <Footprints className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="font-bold text-2xl">{t('common:coming_soon')}</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                    {t('fitness:step_count_description')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Step Distance Card - Coming Soon */}
          <Card className="hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('fitness:step_distance')}</h2>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>
              
              <div className="text-center py-12 space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="font-bold text-2xl">{t('common:coming_soon')}</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                    {t('fitness:step_distance_description')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Sessions Card - Coming Soon */}
          <Card className="hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur border-border/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('fitness:sessions')}</h2>
                <ChevronRight className="w-6 h-6 text-muted-foreground" />
              </div>
              
              <p className="text-center text-muted-foreground py-8">
                {t('fitness:no_sessions_recorded')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StepCount;
