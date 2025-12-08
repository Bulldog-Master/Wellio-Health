import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useSubscription } from "@/hooks/subscription";
import { ProgressToReward } from "@/components/dashboard";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/profile";
import {
  ProfileHeader,
  ReferralPointsCard,
  PersonalInfoSection,
  FitnessGoalsSection,
  SettingsSection,
  ReferralSection
} from "@/components/profile";

const Profile = () => {
  const { t } = useTranslation('profile');
  const { tier, isLoading: subscriptionLoading } = useSubscription();
  
  const {
    formData,
    setFormData,
    isLoading,
    avatarUrl,
    referralPoints,
    handleAvatarUpload,
    handleSave,
  } = useProfile();

  const [openPersonalInfo, setOpenPersonalInfo] = useState(false);
  const [openFitnessGoals, setOpenFitnessGoals] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl pb-20">
      <ProfileHeader tier={tier} subscriptionLoading={subscriptionLoading} />

      <ReferralPointsCard referralPoints={referralPoints} />

      <PersonalInfoSection
        open={openPersonalInfo}
        onOpenChange={setOpenPersonalInfo}
        formData={formData}
        setFormData={setFormData}
        avatarUrl={avatarUrl}
        isLoading={isLoading}
        onAvatarUpload={handleAvatarUpload}
      />

      <FitnessGoalsSection
        open={openFitnessGoals}
        onOpenChange={setOpenFitnessGoals}
        formData={formData}
        setFormData={setFormData}
      />

      <SettingsSection
        open={openSettings}
        onOpenChange={setOpenSettings}
      />

      <ReferralSection />

      <ProgressToReward currentPoints={referralPoints} />

      <Button 
        onClick={handleSave} 
        disabled={isLoading}
        className="w-full gap-2"
      >
        <Save className="w-4 h-4" />
        {isLoading ? t('saving') : t('save_changes')}
      </Button>
    </div>
  );
};

export default Profile;
