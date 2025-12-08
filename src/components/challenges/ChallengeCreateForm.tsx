import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChallengeFormData } from './types';

interface ChallengeCreateFormProps {
  formData: ChallengeFormData;
  setFormData: (data: ChallengeFormData) => void;
  onSubmit: () => void;
}

export function ChallengeCreateForm({ formData, setFormData, onSubmit }: ChallengeCreateFormProps) {
  const { t } = useTranslation(['challenges', 'common']);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('challenges:create_new_challenge')}</CardTitle>
        <CardDescription>{t('challenges:setup_custom_challenge')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('challenges:challenge_title')}</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('challenges:challenge_title_placeholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('challenges:description')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('challenges:description_placeholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="challenge_type">{t('challenges:challenge_type')}</Label>
            <Select value={formData.challenge_type} onValueChange={(value) => setFormData({ ...formData, challenge_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workout_count">{t('challenges:workout_count')}</SelectItem>
                <SelectItem value="distance">{t('challenges:distance')}</SelectItem>
                <SelectItem value="weight_loss">{t('challenges:weight_loss')}</SelectItem>
                <SelectItem value="streak">{t('challenges:streak')}</SelectItem>
                <SelectItem value="custom">{t('challenges:custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">{t('challenges:difficulty')}</Label>
            <Select value={formData.difficulty_level} onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">{t('challenges:easy')}</SelectItem>
                <SelectItem value="medium">{t('challenges:medium')}</SelectItem>
                <SelectItem value="hard">{t('challenges:hard')}</SelectItem>
                <SelectItem value="extreme">{t('challenges:extreme')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target_value">{t('challenges:target_value')}</Label>
            <Input
              id="target_value"
              type="number"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target_unit">{t('challenges:unit')}</Label>
            <Input
              id="target_unit"
              value={formData.target_unit}
              onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
              placeholder={t('challenges:unit_placeholder')}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">{t('challenges:start_date')}</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">{t('challenges:end_date')}</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="points_reward">{t('challenges:points_reward')}</Label>
          <Input
            id="points_reward"
            type="number"
            value={formData.points_reward}
            onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
          />
        </div>

        <Button onClick={onSubmit} className="w-full">
          {t('challenges:create_challenge')}
        </Button>
      </CardContent>
    </Card>
  );
}
