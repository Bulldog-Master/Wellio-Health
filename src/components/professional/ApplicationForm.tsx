import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProfessionalApplication, ProfessionalFormData } from './types';
import { StatusBadge } from './StatusBadge';

interface ApplicationFormProps {
  application: ProfessionalApplication | null;
  formData: ProfessionalFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfessionalFormData>>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  specialtiesPlaceholder?: string;
  certificationsPlaceholder?: string;
}

export const ApplicationForm = ({
  application,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  specialtiesPlaceholder,
  certificationsPlaceholder,
}: ApplicationFormProps) => {
  const { t } = useTranslation(['professional', 'common']);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('application_form')}</CardTitle>
            <CardDescription>{t('application_desc')}</CardDescription>
          </div>
          {application && <StatusBadge status={application.status} />}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">{t('personal_info')}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('full_name')} *</Label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('email')} *</Label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('phone')}</Label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('location')}</Label>
                <Input
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('professional_info')}</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('bio')}</Label>
                <Textarea
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={t('bio_placeholder')}
                  rows={4}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('specialties')}</Label>
                  <Input
                    value={formData.specialties}
                    onChange={e => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                    placeholder={specialtiesPlaceholder || t('specialties_placeholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('certifications')}</Label>
                  <Input
                    value={formData.certifications}
                    onChange={e => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                    placeholder={certificationsPlaceholder || t('certifications_placeholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('years_experience')}</Label>
                  <Input
                    type="number"
                    value={formData.years_experience}
                    onChange={e => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('hourly_rate')}</Label>
                  <Input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={e => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || application?.status === 'pending'}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('submitting')}
              </>
            ) : application?.status === 'pending' ? (
              t('application_pending')
            ) : (
              t('submit_application')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
