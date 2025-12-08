import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UpgradePromptProps {
  feature?: string;
  compact?: boolean;
}

export const UpgradePrompt = ({ feature, compact = false }: UpgradePromptProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-primary text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5" />
            <div>
              <p className="font-semibold">{t('upgrade_to_pro')}</p>
              <p className="text-xs text-white/90">
                {feature ? t('unlock_feature', { feature }) : t('get_unlimited_access')}
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => navigate('/subscription')}
          >
            {t('upgrade')}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-hero text-white text-center">
      <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold mb-2">{t('upgrade_to_premium')}</h3>
      <p className="text-white/90 mb-6 max-w-md mx-auto">
        {feature 
          ? t('upgrade_description', { feature })
          : t('upgrade_description_default')
        }
      </p>
      <Button 
        size="lg"
        variant="secondary"
        onClick={() => navigate('/subscription')}
        className="gap-2"
      >
        <Crown className="w-5 h-5" />
        {t('view_plans')}
      </Button>
    </Card>
  );
};
