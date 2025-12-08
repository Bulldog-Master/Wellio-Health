import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { FundraiserFormData } from './types';

interface FundraiserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FundraiserFormData;
  setFormData: (data: FundraiserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  categories: { value: string; label: string }[];
}

export const FundraiserFormDialog = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  categories,
}: FundraiserFormDialogProps) => {
  const { t } = useTranslation('fundraisers');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('create_fundraiser')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('create_new_fundraiser')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="image">{t('form.cover_image')}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image')?.click()}
                className="shrink-0"
              >
                {t('form.choose_file')}
              </Button>
              <span className="text-sm text-muted-foreground truncate">
                {formData.image?.name || t('form.no_file_selected')}
              </span>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                className="sr-only"
                style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{t('form.title')} *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('form.title_placeholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description')} *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('form.description_placeholder')}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal_amount">{t('form.goal_amount')} *</Label>
              <Input
                id="goal_amount"
                type="number"
                required
                min="1"
                value={formData.goal_amount}
                onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                placeholder={t('form.goal_amount_placeholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('form.category')} *</Label>
              <Select 
                required
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('form.select_category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('form.location')}</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('form.location_placeholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">{t('form.end_date')} *</Label>
            <Input
              id="end_date"
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <Button type="submit" className="w-full">
            {t('create_fundraiser')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
