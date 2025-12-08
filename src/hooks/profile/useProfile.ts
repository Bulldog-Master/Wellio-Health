import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { profileUpdateSchema, validateAndSanitize } from "@/lib/validationSchemas";
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimit";

export interface ProfileFormData {
  name: string;
  username: string;
  age: string;
  gender: string;
  height: string;
  heightUnit: string;
  weight: string;
  weightUnit: string;
  targetWeight: string;
  targetWeightUnit: "lbs" | "kg";
  goal: string;
  moveGoal: string;
  exerciseGoal: string;
  standGoal: string;
}

export const initialProfileFormData: ProfileFormData = {
  name: "",
  username: "",
  age: "",
  gender: "male",
  height: "",
  heightUnit: "inches",
  weight: "",
  weightUnit: "lbs",
  targetWeight: "",
  targetWeightUnit: "lbs",
  goal: "leaner",
  moveGoal: "500",
  exerciseGoal: "30",
  standGoal: "12"
};

export function useProfile() {
  const { t } = useTranslation('profile');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [referralPoints, setReferralPoints] = useState(0);
  const [formData, setFormData] = useState<ProfileFormData>(initialProfileFormData);

  useEffect(() => {
    fetchProfile();
    fetchReferralPoints();
  }, []);

  const fetchReferralPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_points')
        .eq('id', user.id)
        .single();

      setReferralPoints(profile?.referral_points || 0);
    } catch (error) {
      console.error('Error fetching referral points:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || "",
          username: profile.username || "",
          age: profile.age?.toString() || "",
          gender: profile.gender || "male",
          height: profile.height?.toString() || "",
          heightUnit: profile.height_unit || "inches",
          weight: profile.weight?.toString() || "",
          weightUnit: profile.weight_unit || "lbs",
          targetWeight: profile.target_weight?.toString() || "",
          targetWeightUnit: (profile.target_weight_unit as "lbs" | "kg") || "lbs",
          goal: profile.goal || "leaner",
          moveGoal: profile.move_goal?.toString() || "500",
          exerciseGoal: profile.exercise_goal?.toString() || "30",
          standGoal: profile.stand_goal?.toString() || "12"
        }));
        setAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            avatar_url: base64
          }, {
            onConflict: 'id'
          });

        if (error) throw error;

        setAvatarUrl(base64);
        toast({
          title: t('avatar_updated'),
          description: t('profile_picture_updated'),
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: t('error'),
        description: t('failed_to_upload'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const rateLimitKey = `profile:${user.id}`;
      const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.PROFILE_UPDATE);

      if (!rateLimit.allowed) {
        toast({
          title: t('too_many_updates'),
          description: t('wait_before_updating', { minutes: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000) }),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const validation = validateAndSanitize(profileUpdateSchema, {
        full_name: formData.name || undefined,
        username: formData.username || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
      });

      if (validation.success === false) {
        toast({
          title: t('validation_error'),
          description: validation.error,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: validation.data.full_name,
          username: validation.data.username,
          age: validation.data.age,
          gender: formData.gender,
          height: validation.data.height,
          height_unit: formData.heightUnit,
          weight: validation.data.weight,
          weight_unit: formData.weightUnit,
          target_weight: formData.targetWeight ? parseFloat(formData.targetWeight) : null,
          target_weight_unit: formData.targetWeightUnit,
          goal: formData.goal,
          move_goal: formData.moveGoal ? parseInt(formData.moveGoal) : 500,
          exercise_goal: formData.exerciseGoal ? parseInt(formData.exerciseGoal) : 30,
          stand_goal: formData.standGoal ? parseInt(formData.standGoal) : 12,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: t('profile_updated'),
        description: t('profile_saved'),
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: t('error'),
        description: error?.message || t('failed_to_save'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    avatarUrl,
    referralPoints,
    handleAvatarUpload,
    handleSave,
  };
}
