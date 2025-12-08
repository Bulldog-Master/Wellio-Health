import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Gift, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ReferralPointsCardProps {
  referralPoints: number;
}

export function ReferralPointsCard({ referralPoints }: ReferralPointsCardProps) {
  const { t } = useTranslation('profile');
  const navigate = useNavigate();

  if (referralPoints <= 0) return null;

  return (
    <Card 
      className="p-6 bg-gradient-hero text-white shadow-glow-secondary cursor-pointer hover:shadow-glow-primary transition-all" 
      onClick={() => navigate('/rewards')}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" />
            <p className="text-white/90 font-medium">{t('your_reward_points')}</p>
          </div>
          <h2 className="text-4xl font-bold">{referralPoints} {t('points')}</h2>
          <p className="text-white/80 text-sm mt-2">
            {referralPoints >= 500 ? t('can_redeem_rewards') : t('earn_more_for_first_reward', { count: 500 - referralPoints })}
          </p>
        </div>
        <div className="text-right">
          <Button 
            variant="secondary"
            className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/rewards');
            }}
          >
            <Gift className="w-4 h-4" />
            {t('rewards_store')}
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            className="mt-2 gap-2 text-white/80 hover:text-white hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/referral');
            }}
          >
            <Users className="w-4 h-4" />
            {t('earn_more')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
