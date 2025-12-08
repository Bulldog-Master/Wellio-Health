import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { SupplementFormData, PopularSupplement } from "./types";

interface SupplementFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: SupplementFormData;
  setFormData: (data: SupplementFormData) => void;
  onSave: () => void;
  isSaving: boolean;
  selectedSupplement: PopularSupplement | null;
}

export const SupplementFormDialog = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSave,
  isSaving,
  selectedSupplement,
}: SupplementFormDialogProps) => {
  const { t } = useTranslation('fitness');
  const { t: tCommon } = useTranslation('common');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('add_supplement_title')}</DialogTitle>
          <DialogDescription>
            {selectedSupplement ? t('add_to_personal_list') : t('add_custom_supplement')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t('name_required')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('supplement_name_placeholder')}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="category">{t('category')}</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder={t('category_placeholder')}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="dosage">{t('dosage')}</Label>
            <Input
              id="dosage"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              placeholder={t('dosage_placeholder')}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="frequency">{t('frequency')}</Label>
            <Input
              id="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              placeholder={t('frequency_placeholder')}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="product_link">{t('product_link')}</Label>
            <Input
              id="product_link"
              type="url"
              value={formData.product_link}
              onChange={(e) => setFormData({ ...formData, product_link: e.target.value })}
              placeholder="https://example.com/product"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('benefits_usage')}
              className="mt-1.5"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="notes">{t('notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('personal_notes')}
              className="mt-1.5"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} disabled={isSaving} className="flex-1">
              {isSaving ? t('saving') : t('save_supplement')}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon('cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
