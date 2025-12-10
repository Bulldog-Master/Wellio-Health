import { TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

interface OnboardingStep2Props {
  formData: {
    height: string;
    weight: string;
  };
  updateField: (field: string, value: string) => void;
  useMetric: boolean;
  setUseMetric: (value: boolean) => void;
}

export function OnboardingStep2({ formData, updateField, useMetric, setUseMetric }: OnboardingStep2Props) {
  const { t } = useTranslation(['onboarding']);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">{t('step2_title')}</h2>
        <p className="text-muted-foreground">{t('step2_subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <Label htmlFor="metric-toggle" className="cursor-pointer">
            {useMetric ? t('use_metric') : t('use_imperial')}
          </Label>
          <Switch
            id="metric-toggle"
            checked={useMetric}
            onCheckedChange={setUseMetric}
          />
        </div>

        <div>
          <Label htmlFor="height">
            {useMetric ? t('height_cm') : t('height_inches')}
          </Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => updateField("height", e.target.value)}
            placeholder={useMetric ? t('height_placeholder_cm') : t('height_placeholder')}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {useMetric ? t('height_hint_cm') : t('height_hint')}
          </p>
        </div>

        <div>
          <Label htmlFor="weight">
            {useMetric ? t('weight_kg') : t('weight_lbs')}
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => updateField("weight", e.target.value)}
            placeholder={useMetric ? t('weight_placeholder_kg') : t('weight_placeholder')}
          />
        </div>
      </div>
    </div>
  );
}