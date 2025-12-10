import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  OnboardingStep1,
  OnboardingStep2,
  OnboardingStep3,
  OnboardingStep4,
  OnboardingStep5
} from "@/components/onboarding";

const Onboarding = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['onboarding']);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [useMetric, setUseMetric] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "leaner",
    fitness_level: "beginner",
    target_weight: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const convertToImperial = (value: number, type: 'height' | 'weight') => {
    if (type === 'height') return value / 2.54; // cm to inches
    return value * 2.20462; // kg to lbs
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Convert values if metric was used
      let height = parseFloat(formData.height);
      let weight = parseFloat(formData.weight);
      let targetWeight = parseFloat(formData.target_weight);

      if (useMetric) {
        height = convertToImperial(height, 'height');
        weight = convertToImperial(weight, 'weight');
        if (targetWeight) targetWeight = convertToImperial(targetWeight, 'weight');
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          username: formData.username,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: height,
          weight: weight,
          target_weight: targetWeight || null,
          goal: formData.goal,
          fitness_level: formData.fitness_level,
          onboarding_completed: true,
          height_unit: useMetric ? "cm" : "inches",
          weight_unit: useMetric ? "kg" : "lbs",
          target_weight_unit: useMetric ? "kg" : "lbs",
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      toast.success(t('welcome_message'));
      navigate("/");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast.error(error.message || t('failed_complete'));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.full_name || !formData.username || !formData.age || !formData.gender)) {
      toast.error(t('fill_all_fields'));
      return;
    }
    if (step === 2 && (!formData.height || !formData.weight)) {
      toast.error(t('fill_all_fields'));
      return;
    }
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 md:p-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s < step ? "bg-primary" : s === step ? "bg-primary/60" : "bg-muted"
                } ${s !== 5 ? "mr-2" : ""}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {t('step_of', { current: step, total: 5 })}
          </p>
        </div>

        {step === 1 && <OnboardingStep1 formData={formData} updateField={updateField} />}
        {step === 2 && <OnboardingStep2 formData={formData} updateField={updateField} useMetric={useMetric} setUseMetric={setUseMetric} />}
        {step === 3 && <OnboardingStep3 formData={formData} updateField={updateField} useMetric={useMetric} />}
        {step === 4 && <OnboardingStep4 />}
        {step === 5 && <OnboardingStep5 />}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          )}
          
          {step < 5 ? (
            <Button onClick={nextStep} className="ml-auto">
              {t('next')}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading} className="ml-auto">
              {loading ? t('completing') : t('get_started')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;