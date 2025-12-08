import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChangeEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newEmail: string;
  emailPassword: string;
  showPassword: boolean;
  isChanging: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ChangeEmailDialog = ({
  open,
  onOpenChange,
  newEmail,
  emailPassword,
  showPassword,
  isChanging,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onCancel,
}: ChangeEmailDialogProps) => {
  const { t } = useTranslation('privacy');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('update_email')}</DialogTitle>
          <DialogDescription>
            {t('email_change_description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-email">{t('new_email')}</Label>
            <Input
              id="new-email"
              type="email"
              placeholder={t('placeholder_new_email')}
              value={newEmail}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-password">{t('password')}</Label>
            <div className="relative">
              <Input
                id="email-password"
                type={showPassword ? "text" : "password"}
                placeholder={t('enter_password')}
                value={emailPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isChanging}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isChanging || !newEmail || !emailPassword}
          >
            {isChanging ? t('updating') : t('change_email')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeEmailDialog;
