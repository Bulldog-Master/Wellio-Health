import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface AddAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  appDescription: string;
  appUrl: string;
  appCategory: string;
  appPlatform: string;
  appIconUrl: string;
  onAppNameChange: (value: string) => void;
  onAppDescriptionChange: (value: string) => void;
  onAppUrlChange: (value: string) => void;
  onAppCategoryChange: (value: string) => void;
  onAppPlatformChange: (value: string) => void;
  onAppIconUrlChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const AddAppDialog = ({
  open,
  onOpenChange,
  appName,
  appDescription,
  appUrl,
  appCategory,
  appPlatform,
  appIconUrl,
  onAppNameChange,
  onAppDescriptionChange,
  onAppUrlChange,
  onAppCategoryChange,
  onAppPlatformChange,
  onAppIconUrlChange,
  onSave,
  onCancel,
}: AddAppDialogProps) => {
  const { t } = useTranslation(['workout', 'common']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30 border-2 border-lime-200 dark:border-lime-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-lime-900 dark:text-lime-100">{t('add_fitness_app')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="app-name">{t('app_name')}</Label>
            <Input
              id="app-name"
              placeholder={t('app_name_placeholder')}
              value={appName}
              onChange={(e) => onAppNameChange(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="app-description">{t('description_optional')}</Label>
            <Textarea
              id="app-description"
              placeholder={t('whats_this_app_for')}
              value={appDescription}
              onChange={(e) => onAppDescriptionChange(e.target.value)}
              className="mt-1.5"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="app-platform">{t('platform')}</Label>
              <Select value={appPlatform} onValueChange={onAppPlatformChange}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t('select_platform')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iOS">{t('ios')}</SelectItem>
                  <SelectItem value="Android">{t('android')}</SelectItem>
                  <SelectItem value="Web">{t('web')}</SelectItem>
                  <SelectItem value="Cross-platform">{t('cross_platform')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="app-category">{t('category_optional')}</Label>
              <Input
                id="app-category"
                placeholder={t('category_placeholder')}
                value={appCategory}
                onChange={(e) => onAppCategoryChange(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="app-url">{t('app_url_optional')}</Label>
            <Input
              id="app-url"
              type="url"
              placeholder={t('https_placeholder')}
              value={appUrl}
              onChange={(e) => onAppUrlChange(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="app-icon">{t('app_icon_url_optional')}</Label>
            <Input
              id="app-icon"
              type="url"
              placeholder={t('https_placeholder')}
              value={appIconUrl}
              onChange={(e) => onAppIconUrlChange(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel} className="flex-1">{t('cancel')}</Button>
            <Button onClick={onSave} className="flex-1 bg-lime-600 hover:bg-lime-700">{t('save_app')}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppDialog;
