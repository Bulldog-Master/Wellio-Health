import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Users } from "lucide-react";

interface ReferralBannerProps {
  hasReferralCode: boolean;
}

export const ReferralBanner = ({ hasReferralCode }: ReferralBannerProps) => {
  const { t } = useTranslation('auth');

  return (
    <Card className="mb-6 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-primary/20 animate-fade-in">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
            <Gift className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              {hasReferralCode ? t('bonus_points') : t('signup_rewards')}
              <Badge variant="secondary" className="text-xs">
                {hasReferralCode ? "75 pts" : "25 pts"}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasReferralCode 
                ? t('signup_points_desc')
                : t('signup_base_desc')
              }
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-background/50 text-center">
            <div className="font-semibold flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              {t('share_earn')}
            </div>
            <div className="text-muted-foreground mt-1">150 pts {t('per_friend')}</div>
          </div>
          <div className="p-2 rounded bg-background/50 text-center">
            <div className="font-semibold">{t('redeem_rewards')}</div>
            <div className="text-muted-foreground mt-1">500 pts = 1 {t('month_pro')}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
