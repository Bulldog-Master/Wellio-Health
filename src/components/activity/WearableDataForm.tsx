import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface WearableFormData {
  deviceName: string;
  customDevice: string;
  steps: string;
  caloriesBurned: string;
  heartRate: string;
  sleepHours: string;
  dataDate: string;
}

interface WearableDataFormProps {
  formData: WearableFormData;
  setFormData: React.Dispatch<React.SetStateAction<WearableFormData>>;
  onSubmit: () => void;
  isSaving: boolean;
}

const commonDevices = [
  { value: "fitbit", label: "Fitbit" },
  { value: "apple_watch", label: "Apple Watch" },
  { value: "garmin", label: "Garmin" },
  { value: "samsung_health", label: "Samsung Health" },
  { value: "suunto", label: "Suunto" },
  { value: "whoop", label: "Whoop" },
  { value: "oura", label: "Oura Ring" },
  { value: "custom", label: "Custom" },
];

export const WearableDataForm = ({ formData, setFormData, onSubmit, isSaving }: WearableDataFormProps) => {
  const { t } = useTranslation('fitness');

  return (
    <Card className="p-6 bg-gradient-card shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">{t('log_wearable_data')}</h3>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="deviceName">{t('device')}</Label>
          <Select 
            value={formData.deviceName} 
            onValueChange={(value) => setFormData({ ...formData, deviceName: value })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {commonDevices.map((device) => (
                <SelectItem key={device.value} value={device.value}>
                  {device.value === 'custom' ? t('custom_device') : device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.deviceName === "custom" && (
          <div>
            <Label htmlFor="customDevice">{t('custom_device_name')}</Label>
            <Input
              id="customDevice"
              value={formData.customDevice}
              onChange={(e) => setFormData({ ...formData, customDevice: e.target.value })}
              placeholder={t('enter_device_name')}
              className="mt-1.5"
            />
          </div>
        )}

        <div>
          <Label htmlFor="dataDate">{t('date')}</Label>
          <Input
            id="dataDate"
            type="date"
            value={formData.dataDate}
            onChange={(e) => setFormData({ ...formData, dataDate: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="steps">{t('steps')}</Label>
            <Input
              id="steps"
              type="number"
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              placeholder="10000"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="caloriesBurned">{t('calories_burned')}</Label>
            <Input
              id="caloriesBurned"
              type="number"
              value={formData.caloriesBurned}
              onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
              placeholder="500"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="heartRate">{t('heart_rate_bpm')}</Label>
            <Input
              id="heartRate"
              type="number"
              value={formData.heartRate}
              onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
              placeholder="75"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="sleepHours">{t('sleep_hours')}</Label>
            <Input
              id="sleepHours"
              type="number"
              step="0.1"
              value={formData.sleepHours}
              onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
              placeholder="7.5"
              className="mt-1.5"
            />
          </div>
        </div>

        <Button 
          onClick={onSubmit} 
          className="w-full gap-2"
          disabled={isSaving}
        >
          <Plus className="w-4 h-4" />
          {isSaving ? t('saving') : t('save_wearable_data')}
        </Button>
      </div>
    </Card>
  );
};

export default WearableDataForm;
