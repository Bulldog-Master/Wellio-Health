import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import type { AdFormData, AdPlacement, Advertisement } from './types';

interface AdFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingAd: Advertisement | null;
  formData: AdFormData;
  setFormData: (data: AdFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export function AdFormDialog({
  isOpen,
  onOpenChange,
  editingAd,
  formData,
  setFormData,
  onSubmit,
  onReset,
}: AdFormDialogProps) {
  const { t } = useTranslation(['ads', 'common']);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) onReset();
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('ads:admin.add_ad')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAd ? t('ads:admin.edit_ad') : t('ads:admin.add_ad')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>{t('ads:admin.title')}</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>{t('ads:admin.title_es')}</Label>
            <Input
              value={formData.title_es}
              onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('ads:admin.description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label>{t('ads:admin.description_es')}</Label>
            <Textarea
              value={formData.description_es}
              onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label>{t('ads:admin.image_url')}</Label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>{t('ads:admin.link_url')}</Label>
            <Input
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label>{t('ads:admin.placement')}</Label>
            <Select
              value={formData.placement}
              onValueChange={(value: AdPlacement) => 
                setFormData({ ...formData, placement: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">{t('ads:admin.placements.dashboard')}</SelectItem>
                <SelectItem value="activity">{t('ads:admin.placements.activity')}</SelectItem>
                <SelectItem value="feed">{t('ads:admin.placements.feed')}</SelectItem>
                <SelectItem value="news">{t('ads:admin.placements.news')}</SelectItem>
                <SelectItem value="global">{t('ads:admin.placements.global')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('ads:admin.start_date')}</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('ads:admin.end_date')}</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>{t('ads:admin.is_active')}</Label>
          </div>
          <Button type="submit" className="w-full">
            {editingAd ? t('common:save') : t('ads:admin.add_ad')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
