import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EventFormData, eventTypes } from "./types";

interface EventFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
  onSubmit: () => void;
}

export const EventFormDialog = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
}: EventFormDialogProps) => {
  const { t } = useTranslation('calendar');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('add_event')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('create_new_event')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('title')}</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('placeholder_title')}
            />
          </div>
          <div>
            <Label>{t('event_type')}</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData({ ...formData, event_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {t(type.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('placeholder_description')}
            />
          </div>
          <div>
            <Label>{t('start_time')}</Label>
            <Input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('end_time')}</Label>
            <Input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>
          <div>
            <Label>{t('location')}</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('placeholder_location')}
            />
          </div>
          <Button onClick={onSubmit} className="w-full">
            {t('create_event')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
