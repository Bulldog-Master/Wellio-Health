import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { NewsFormData, NewsCategory } from './types';

interface NewsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NewsFormData;
  setFormData: (data: NewsFormData) => void;
  categories: NewsCategory[];
  onSubmit: () => void;
  isEdit?: boolean;
}

export const NewsFormDialog = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  categories,
  onSubmit,
  isEdit = false
}: NewsFormDialogProps) => {
  const { t } = useTranslation(['common', 'news']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit News Item' : 'Add News Item'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{t(cat.titleKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Title (English)</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div>
            <Label>Title (Spanish)</Label>
            <Input value={formData.title_es} onChange={(e) => setFormData({ ...formData, title_es: e.target.value })} />
          </div>
          <div>
            <Label>URL</Label>
            <Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Event Date (English)</Label>
            <Input value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} placeholder="e.g. Dec 15, 2025" />
          </div>
          <div>
            <Label>Event Date (Spanish)</Label>
            <Input value={formData.event_date_es} onChange={(e) => setFormData({ ...formData, event_date_es: e.target.value })} placeholder="e.g. 15 de dic, 2025" />
          </div>
          <div>
            <Label>Badge Type</Label>
            <Select value={formData.badge_type} onValueChange={(v) => setFormData({ ...formData, badge_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="live">{t('news:live')}</SelectItem>
                <SelectItem value="upcoming">{t('news:upcoming')}</SelectItem>
                <SelectItem value="recent">{t('news:recent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common:cancel')}
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? t('common:save') : t('common:add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
