import { Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from "react-i18next";

interface OnboardingStep1Props {
  formData: {
    full_name: string;
    username: string;
    age: string;
    gender: string;
  };
  updateField: (field: string, value: string) => void;
}

export function OnboardingStep1({ formData, updateField }: OnboardingStep1Props) {
  const { t } = useTranslation(['onboarding']);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Activity className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">{t('step1_title')}</h2>
        <p className="text-muted-foreground">{t('step1_subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="full_name">{t('full_name')}</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            placeholder={t('full_name_placeholder')}
          />
        </div>

        <div>
          <Label htmlFor="username">{t('username')}</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => updateField("username", e.target.value)}
            placeholder={t('username_placeholder')}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t('username_hint')}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="age">{t('age')}</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => updateField("age", e.target.value)}
              placeholder={t('age_placeholder')}
            />
          </div>

          <div>
            <Label>{t('gender')}</Label>
            <RadioGroup value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal">{t('gender_male')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal">{t('gender_female')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal">{t('gender_other')}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
}