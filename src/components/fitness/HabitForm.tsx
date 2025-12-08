import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import type { HabitFormData } from "@/hooks/fitness/useHabits";

interface HabitFormProps {
  formData: HabitFormData;
  setFormData: React.Dispatch<React.SetStateAction<HabitFormData>>;
  onSubmit: () => void;
  onCancel: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel 
}) => {
  const { t } = useTranslation('fitness');
  const { t: tCommon } = useTranslation('common');

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Plus className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{t('new_habit')}</h3>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="habit-name">{t('habit_name')}</Label>
          <Input
            id="habit-name"
            placeholder={t('habit_name_placeholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="habit-description">{t('description_optional')}</Label>
          <Textarea
            id="habit-description"
            placeholder={t('add_details')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1.5 min-h-20"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={onSubmit}>{t('create_habit')}</Button>
          <Button variant="outline" onClick={onCancel}>{tCommon('cancel')}</Button>
        </div>
      </div>
    </Card>
  );
};
