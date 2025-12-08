import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { PRFormData, exerciseCategories, commonExercises, defaultFormData } from "./types";

interface RecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PRFormData;
  setFormData: (data: PRFormData) => void;
  isEditing: boolean;
  onSubmit: () => void;
  t: (key: string, options?: any) => string;
}

export const RecordFormDialog = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  isEditing,
  onSubmit,
  t
}: RecordFormDialogProps) => {
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setFormData(defaultFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('records:add_pr')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('records:update_record') : t('records:add_record')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('records:exercise_category')}</Label>
            <Select
              value={formData.exercise_category}
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  exercise_category: value,
                  exercise_name: "" 
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exerciseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {t(`records:${cat.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('records:exercise_name')}</Label>
            <Select
              value={formData.exercise_name}
              onValueChange={(value) => setFormData({ ...formData, exercise_name: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('records:select_or_type')} />
              </SelectTrigger>
              <SelectContent>
                {commonExercises[formData.exercise_category]?.map((exercise) => (
                  <SelectItem key={exercise} value={exercise}>
                    {exercise}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="mt-2"
              placeholder={t('records:or_enter_custom')}
              value={formData.exercise_name}
              onChange={(e) => setFormData({ ...formData, exercise_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('records:record_type')}</Label>
              <Select
                value={formData.record_type}
                onValueChange={(value) => setFormData({ ...formData, record_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">{t('records:weight')}</SelectItem>
                  <SelectItem value="reps">{t('records:reps')}</SelectItem>
                  <SelectItem value="time">{t('records:time')}</SelectItem>
                  <SelectItem value="distance">{t('records:distance')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('records:unit')}</Label>
              <Select
                value={formData.record_unit}
                onValueChange={(value) => setFormData({ ...formData, record_unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.record_type === "weight" && (
                    <>
                      <SelectItem value="lbs">{t('records:lbs')}</SelectItem>
                      <SelectItem value="kg">{t('records:kg')}</SelectItem>
                    </>
                  )}
                  {formData.record_type === "time" && (
                    <>
                      <SelectItem value="seconds">{t('records:seconds')}</SelectItem>
                      <SelectItem value="minutes">{t('records:minutes')}</SelectItem>
                      <SelectItem value="hours">{t('records:hours')}</SelectItem>
                    </>
                  )}
                  {formData.record_type === "distance" && (
                    <>
                      <SelectItem value="miles">{t('records:miles')}</SelectItem>
                      <SelectItem value="km">{t('records:km')}</SelectItem>
                      <SelectItem value="meters">{t('records:meters')}</SelectItem>
                    </>
                  )}
                  {formData.record_type === "reps" && (
                    <SelectItem value="reps">{t('records:reps')}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t('records:value')}</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.record_value}
              onChange={(e) => setFormData({ ...formData, record_value: e.target.value })}
              placeholder={t('records:placeholder_value')}
            />
          </div>

          <div>
            <Label>{t('records:date_achieved')}</Label>
            <Input
              type="date"
              value={formData.achieved_at}
              onChange={(e) => setFormData({ ...formData, achieved_at: e.target.value })}
            />
          </div>

          <div>
            <Label>{t('records:notes_optional')}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('records:placeholder_notes')}
              rows={3}
            />
          </div>

          <Button onClick={onSubmit} className="w-full">
            {isEditing ? t('records:update') : t('records:add')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
