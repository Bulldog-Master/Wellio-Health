import { Activity, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function OnboardingStep5() {
  const { t } = useTranslation(['onboarding']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const requestNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast.success(t('notifications_enabled'));
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Activity className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">{t('step5_title')}</h2>
        <p className="text-muted-foreground">{t('step5_subtitle')}</p>
      </div>

      <div className="space-y-4">
        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold mb-2">📱 {t('enable_notifications')}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t('notifications_desc')}
          </p>
          {notificationsEnabled ? (
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">{t('notifications_enabled')}</span>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={requestNotifications}>
              {t('allow_notifications')}
            </Button>
          )}
        </Card>

        <div className="text-sm text-muted-foreground">
          {t('notifications_settings_hint')}
        </div>
      </div>
    </div>
  );
}