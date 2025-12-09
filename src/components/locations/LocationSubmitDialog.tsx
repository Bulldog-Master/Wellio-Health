import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { AddressAutocomplete, GymNameAutocomplete } from '@/components/locations';
import { PhoneInput } from '@/components/common';
import { type LocationFormData } from '@/hooks/locations';

interface LocationSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: LocationFormData;
  setFormData: (data: LocationFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  categories: string[];
}

export function LocationSubmitDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isPending,
  categories,
}: LocationSubmitDialogProps) {
  const { t } = useTranslation(['locations', 'common']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('locations:submit_location')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('locations:submit_location')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>{t('locations:form.name')}</Label>
            <GymNameAutocomplete
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              onPlaceSelect={(place) => {
                setFormData({
                  ...formData,
                  name: place.name,
                  address: place.street || formData.address,
                  city: place.city || formData.city,
                  state: place.state || formData.state,
                  country: place.country || formData.country,
                  postal_code: place.postalCode || formData.postal_code,
                  phone: place.phone || formData.phone,
                  website_url: place.website || formData.website_url,
                });
              }}
            />
          </div>
          <div>
            <Label>{t('locations:form.category')}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(c => c !== 'all').map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`locations:categories.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('locations:form.description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>{t('locations:form.address')}</Label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              onAddressSelect={(addr) => {
                setFormData({
                  ...formData,
                  address: addr.street,
                  city: addr.city || formData.city,
                  state: addr.state || formData.state,
                  country: addr.country || formData.country,
                  postal_code: addr.postalCode || formData.postal_code,
                });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('locations:form.city')}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t('locations:form.state')}</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('locations:form.country')}</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{t('locations:form.postal_code')}</Label>
              <Input
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>{t('locations:form.phone')}</Label>
            <PhoneInput
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              country={formData.country}
            />
          </div>
          <div>
            <Label>{t('locations:form.website')}</Label>
            <Input
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {t('locations:form.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
