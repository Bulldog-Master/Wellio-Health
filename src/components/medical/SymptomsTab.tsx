import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Plus, AlertCircle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import type { Symptom } from './types';

interface SymptomsTabProps {
  symptoms: Symptom[];
  isLoading: boolean;
  onAddSymptom: (name: string, severity: number, description: string) => Promise<boolean>;
  onDeleteSymptom: (id: string) => Promise<boolean>;
}

const getSeverityColor = (severity: number) => {
  if (severity <= 3) return "text-yellow-600";
  if (severity <= 7) return "text-orange-600";
  return "text-red-600";
};

export function SymptomsTab({ symptoms, isLoading, onAddSymptom, onDeleteSymptom }: SymptomsTabProps) {
  const { t } = useTranslation(['medical']);
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState([5]);
  const [symptomDescription, setSymptomDescription] = useState('');

  const handleSubmit = async () => {
    const success = await onAddSymptom(symptomName, severity[0], symptomDescription);
    if (success) {
      setSymptomName('');
      setSeverity([5]);
      setSymptomDescription('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">{t('medical:log_symptom')}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="symptom-name">{t('medical:symptom_name')}</Label>
            <Input
              id="symptom-name"
              placeholder={t('medical:placeholder_symptom')}
              value={symptomName}
              onChange={(e) => setSymptomName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="severity">{t('medical:severity')}</Label>
            <div className="flex items-center gap-4 mt-1.5">
              <Slider
                id="severity"
                min={1}
                max={10}
                step={1}
                value={severity}
                onValueChange={setSeverity}
                className="flex-1"
              />
              <span className="text-lg font-semibold w-8">{severity[0]}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="symptom-description">{t('medical:description')}</Label>
            <Textarea
              id="symptom-description"
              placeholder={t('medical:placeholder_symptom_description')}
              value={symptomDescription}
              onChange={(e) => setSymptomDescription(e.target.value)}
              className="mt-1.5 min-h-20"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            {t('medical:log_symptom')}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Symptoms</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : symptoms.length > 0 ? (
            symptoms.map((symptom) => (
              <div key={symptom.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <h4 className="font-semibold">{symptom.symptom_name}</h4>
                    </div>
                    {symptom.severity && (
                      <p className={`text-sm font-medium ${getSeverityColor(symptom.severity)}`}>
                        {t('medical:severity_level', { level: symptom.severity })}
                      </p>
                    )}
                    {symptom.description && (
                      <p className="text-sm text-muted-foreground mt-2">{symptom.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {symptom.logged_at && format(new Date(symptom.logged_at), "PPp")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteSymptom(symptom.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('medical:no_symptoms')}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
