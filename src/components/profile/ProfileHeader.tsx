import { User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ProfileHeaderProps {
  tier: string;
  subscriptionLoading: boolean;
}

export function ProfileHeader({ tier, subscriptionLoading }: ProfileHeaderProps) {
  const { t } = useTranslation('profile');
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{t('profile')}</h1>
            {!subscriptionLoading && (
              <Badge 
                variant={tier === 'free' ? 'secondary' : 'default'}
                className={tier !== 'free' ? 'bg-gradient-primary text-white' : ''}
              >
                {tier === 'free' ? (
                  t('free')
                ) : (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    {tier.toUpperCase()}
                  </>
                )}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{t('manage_account')}</p>
        </div>
      </div>
      {tier === 'free' && (
        <Button 
          variant="default"
          className="bg-gradient-primary hover:opacity-90 gap-2"
          onClick={() => navigate('/subscription')}
        >
          <Crown className="w-4 h-4" />
          {t('upgrade')}
        </Button>
      )}
    </div>
  );
}
