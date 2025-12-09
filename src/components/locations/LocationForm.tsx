import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddressAutocomplete, GymNameAutocomplete } from '@/components/locations';
import { PhoneInput } from '@/components/common';
import { locationCategories } from '@/lib/locationUtils';

export interface LocationFormData {
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  website_url: string;
}

interface LocationFormProps {
  formData: LocationFormData;
  setFormData: React.Dispatch<React.SetStateAction<LocationFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isSubmitting: boolean;
  isEdit?: boolean;
}

export const LocationForm = ({
  formData,
  setFormData,
  onSubmit,
  isOpen,
  setIsOpen,
  isSubmitting,
  isEdit = false
}: LocationFormProps) => {
  const { t } = useTranslation(['locations', 'common']);
  const categories = locationCategories.filter(c => c !== 'all');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('locations:submit_location')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('locations:edit_location') : t('locations:submit_location')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>{t('locations:form.name')}</Label>
            <GymNameAutocomplete
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              onPlaceSelect={(place) => {
                setFormData(prev => ({
                  ...prev,
                  name: place.name,
                  address: place.street || prev.address,
                  city: place.city || prev.city,
                  state: place.state || prev.state,
                  country: place.country || prev.country,
                  postal_code: place.postalCode || prev.postal_code,
                  phone: place.phone || prev.phone,
                  website_url: place.website || prev.website_url,
                }));
              }}
            />
          </div>
          <div>
            <Label>{t('locations:form.category')}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
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
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div>
            <Label>{t('locations:form.address')}</Label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
              onAddressSelect={(addr) => {
                setFormData(prev => ({
                  ...prev,
                  address: addr.street,
                  city: addr.city || prev.city,
                  state: addr.state || prev.state,
                  country: addr.country || prev.country,
                  postal_code: addr.postalCode || prev.postal_code,
                }));
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('locations:form.city')}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>{t('locations:form.state')}</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('locations:form.country')}</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>{t('locations:form.postal_code')}</Label>
              <Input
                value={formData.postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label>{t('locations:form.phone')}</Label>
            <PhoneInput
              value={formData.phone}
              onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              country={formData.country}
            />
          </div>
          <div>
            <Label>{t('locations:form.website')}</Label>
            <Input
              value={formData.website_url}
              onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isEdit ? t('common:save') : t('locations:form.submit')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationForm;
