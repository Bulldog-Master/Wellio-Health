import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PrivacySettingsCardProps {
  isPrivate: boolean;
  allowMentions: boolean;
  showActivity: boolean;
  showHealthMetrics: boolean;
  onPrivateChange: (value: boolean) => void;
  onMentionsChange: (value: boolean) => void;
  onActivityChange: (value: boolean) => void;
  onHealthMetricsChange: (value: boolean) => void;
}

const PrivacySettingsCard = ({
  isPrivate,
  allowMentions,
  showActivity,
  showHealthMetrics,
  onPrivateChange,
  onMentionsChange,
  onActivityChange,
  onHealthMetricsChange,
}: PrivacySettingsCardProps) => {
  const { t } = useTranslation('privacy');

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent/10 rounded-xl">
            <UserCheck className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle>{t('profile_privacy')}</CardTitle>
            <CardDescription>
              {t('profile_privacy_description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('private_account')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('private_account_description')}
            </p>
          </div>
          <Switch checked={isPrivate} onCheckedChange={onPrivateChange} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('allow_mentions')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('allow_mentions_description')}
            </p>
          </div>
          <Switch checked={allowMentions} onCheckedChange={onMentionsChange} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('show_activity')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('show_activity_description')}
            </p>
          </div>
          <Switch checked={showActivity} onCheckedChange={onActivityChange} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('show_health_metrics')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('show_health_metrics_description')}
            </p>
          </div>
          <Switch checked={showHealthMetrics} onCheckedChange={onHealthMetricsChange} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettingsCard;
