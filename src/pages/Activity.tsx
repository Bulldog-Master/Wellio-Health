import { Activity as ActivityIcon } from "lucide-react";
import { useUserPreferences } from "@/hooks/utils";
import { useTranslation } from "react-i18next";
import { useActivityData, useWearableForm } from "@/hooks/fitness";
import { 
  ActivityHubGrid, 
  ActivityStatsCards, 
  WearableDataForm, 
  WearableDataList, 
  RecentActivityList 
} from "@/components/activity";
import AdBanner from "@/components/AdBanner";

const Activity = () => {
  const { t } = useTranslation('fitness');
  const { preferredUnit } = useUserPreferences();
  
  const { activityLogs, isLoading, weeklyStats } = useActivityData();
  const { 
    wearableData, 
    wearableForm, 
    setWearableForm, 
    isSaving, 
    commonDevices, 
    handleSaveWearableData 
  } = useWearableForm();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <ActivityIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t('activity')}</h1>
          <p className="text-muted-foreground">{t('activity_description')}</p>
        </div>
      </div>

      <AdBanner placement="activity" variant="card" />

      <ActivityHubGrid />

      <ActivityStatsCards weeklyStats={weeklyStats} preferredUnit={preferredUnit} />

      <WearableDataForm
        formData={wearableForm}
        setFormData={setWearableForm}
        isSaving={isSaving}
        onSubmit={handleSaveWearableData}
      />

      <WearableDataList wearableData={wearableData} />

      <RecentActivityList 
        activityLogs={activityLogs} 
        isLoading={isLoading} 
        preferredUnit={preferredUnit} 
      />
    </div>
  );
};

export default Activity;
