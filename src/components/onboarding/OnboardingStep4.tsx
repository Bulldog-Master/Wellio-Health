import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function OnboardingStep4() {
  const { t } = useTranslation(['onboarding']);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Target className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('step4_title')}</h2>
        <p className="text-muted-foreground">{t('step4_subtitle')}</p>
      </div>

      <div className="space-y-4">
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <h3 className="font-semibold mb-3 text-lg">🎁 {t('how_it_works')}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">{t('share_link')}</p>
                <p className="text-muted-foreground">{t('share_link_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">{t('complete_onboarding')}</p>
                <p className="text-muted-foreground">{t('complete_onboarding_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">{t('redeem_rewards')}</p>
                <p className="text-muted-foreground">{t('redeem_rewards_desc')}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold mb-2">✨ {t('what_you_earn')}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 rounded bg-background/50">
              <p className="font-medium">{t('one_month_pro')}</p>
              <p className="text-xs text-muted-foreground">500 {t('points')}</p>
            </div>
            <div className="p-2 rounded bg-background/50">
              <p className="font-medium">{t('verified_badge')}</p>
              <p className="text-xs text-muted-foreground">100 {t('points')}</p>
            </div>
            <div className="p-2 rounded bg-background/50">
              <p className="font-medium">{t('six_months_pro')}</p>
              <p className="text-xs text-muted-foreground">2,500 {t('points')}</p>
            </div>
            <div className="p-2 rounded bg-background/50">
              <p className="font-medium">{t('and_more')}</p>
              <p className="text-xs text-muted-foreground">{t('keep_sharing')}</p>
            </div>
          </div>
        </Card>

        <div className="text-xs text-center text-muted-foreground bg-primary/5 p-3 rounded">
          🎯 {t('referral_tip')}
        </div>
      </div>
    </div>
  );
}