import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  feature?: string;
  compact?: boolean;
}

export const UpgradePrompt = ({ feature, compact = false }: UpgradePromptProps) => {
  const navigate = useNavigate();

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-primary text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5" />
            <div>
              <p className="font-semibold">Upgrade to Pro</p>
              <p className="text-xs text-white/90">
                {feature ? `Unlock ${feature}` : 'Get unlimited access'}
              </p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => navigate('/subscription')}
          >
            Upgrade
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
      <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
      <p className="text-white/90 mb-6 max-w-md mx-auto">
        {feature 
          ? `${feature} is a premium feature. Upgrade to unlock this and many more exclusive features.`
          : 'Get access to advanced analytics, AI insights, trainer marketplace, and more.'
        }
      </p>
      <Button 
        size="lg"
        variant="secondary"
        onClick={() => navigate('/subscription')}
        className="gap-2"
      >
        <Crown className="w-5 h-5" />
        View Plans
      </Button>
    </Card>
  );
};
