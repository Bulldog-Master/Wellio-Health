import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface ForgotPasswordFormProps {
  loading: boolean;
  email: string;
  setEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export const ForgotPasswordForm = ({
  loading,
  email,
  setEmail,
  onSubmit,
  onBack,
}: ForgotPasswordFormProps) => {
  const { t } = useTranslation('auth');

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-email">{t('email')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="reset-email"
            type="email"
            placeholder={t('email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={loading}
      >
        {loading ? t('sending') : t('send_reset_link')}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onBack}
      >
        {t('back_to_signin')}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        {t('reset_link_desc')}
      </p>
    </form>
  );
};
