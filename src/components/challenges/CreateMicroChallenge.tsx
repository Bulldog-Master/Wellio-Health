import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Zap, Flame, Users, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateMicroChallengeProps {
  onCreated?: () => void;
}

export const CreateMicroChallenge = ({ onCreated }: CreateMicroChallengeProps) => {
  const { t } = useTranslation(['challenges', 'common']);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challenge_type: 'quick_burst',
    target_value: 10,
    target_unit: 'reps',
    duration_minutes: 5,
    points_reward: 10
  });

  const challengeTypes = [
    { value: 'quick_burst', icon: Zap, color: 'text-yellow-500' },
    { value: 'daily_dare', icon: Flame, color: 'text-orange-500' },
    { value: 'friend_face_off', icon: Users, color: 'text-blue-500' },
    { value: 'community_wave', icon: Trophy, color: 'text-purple-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate share code
      const { data: shareCode } = await supabase.rpc('generate_share_code');

      const { error } = await supabase
        .from('micro_challenges')
        .insert({
          ...formData,
          creator_id: user.id,
          share_code: shareCode
        });

      if (error) throw error;

      toast.success(t('micro_challenge_created'));
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        challenge_type: 'quick_burst',
        target_value: 10,
        target_unit: 'reps',
        duration_minutes: 5,
        points_reward: 10
      });
      onCreated?.();
    } catch (error) {
      console.error('Error creating micro challenge:', error);
      toast.error(t('failed_to_create'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('create_micro_challenge')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('create_micro_challenge')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('challenge_title')}</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('micro_challenge_title_placeholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('micro_challenge_desc_placeholder')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('challenge_type')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {challengeTypes.map(({ value, icon: Icon, color }) => (
                <Button
                  key={value}
                  type="button"
                  variant={formData.challenge_type === value ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setFormData({ ...formData, challenge_type: value })}
                >
                  <Icon className={`w-4 h-4 mr-2 ${formData.challenge_type === value ? '' : color}`} />
                  {t(`micro_${value}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">{t('target_value')}</Label>
              <Input
                id="target"
                type="number"
                min={1}
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">{t('unit')}</Label>
              <Select
                value={formData.target_unit}
                onValueChange={(value) => setFormData({ ...formData, target_unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reps">{t('reps')}</SelectItem>
                  <SelectItem value="seconds">{t('seconds')}</SelectItem>
                  <SelectItem value="minutes">{t('minutes')}</SelectItem>
                  <SelectItem value="meters">{t('meters')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">{t('duration_minutes')}</Label>
              <Select
                value={formData.duration_minutes.toString()}
                onValueChange={(value) => setFormData({ ...formData, duration_minutes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 {t('minute')}</SelectItem>
                  <SelectItem value="2">2 {t('minutes')}</SelectItem>
                  <SelectItem value="5">5 {t('minutes')}</SelectItem>
                  <SelectItem value="10">10 {t('minutes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">{t('points_reward')}</Label>
              <Input
                id="points"
                type="number"
                min={1}
                max={100}
                value={formData.points_reward}
                onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) || 10 })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common:loading') : t('create_challenge')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
