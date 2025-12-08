import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Plus, Pill } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Medication, MedicationFormData } from './types';

interface MedicationsTabProps {
  medications: Medication[];
  isLoading: boolean;
  onAddMedication: (formData: MedicationFormData) => Promise<boolean>;
}

const initialFormData: MedicationFormData = {
  medication_name: '',
  dosage: '',
  frequency: '',
  start_date: new Date().toISOString().split('T')[0],
  notes: '',
};

export function MedicationsTab({ medications, isLoading, onAddMedication }: MedicationsTabProps) {
  const { t } = useTranslation(['medical']);
  const [formData, setFormData] = useState<MedicationFormData>(initialFormData);

  const handleSubmit = async () => {
    const success = await onAddMedication(formData);
    if (success) {
      setFormData(initialFormData);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">{t('medical:add_medication')}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="med-name">{t('medical:medication_name')}</Label>
              <Input
                id="med-name"
                placeholder={t('medical:placeholder_medication')}
                value={formData.medication_name}
                onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="dosage">{t('medical:dosage')}</Label>
              <Input
                id="dosage"
                placeholder={t('medical:placeholder_dosage')}
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequency">{t('medical:frequency')}</Label>
              <Input
                id="frequency"
                placeholder={t('medical:placeholder_frequency')}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="start-date">{t('medical:start_date')}</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="med-notes">{t('medical:notes')}</Label>
            <Textarea
              id="med-notes"
              placeholder={t('medical:placeholder_notes')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1.5 min-h-20"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            {t('medical:add_medication')}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">{t('medical:active')}</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : medications.filter(m => m.is_active).length > 0 ? (
            medications.filter(m => m.is_active).map((med) => (
              <div key={med.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      {med.medication_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Started: {format(new Date(med.start_date), "PP")}
                </p>
                {med.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{med.notes}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('medical:no_medications')}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
