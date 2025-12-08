import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, Mail, User as UserIcon } from "lucide-react";

interface PasskeyFormProps {
  loading: boolean;
  isLogin: boolean;
  isInIframe: boolean;
  passkeySupported: boolean;
  email: string;
  setEmail: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PasskeyForm = ({
  loading,
  isLogin,
  isInIframe,
  passkeySupported,
  email,
  setEmail,
  name,
  setName,
  onSubmit,
}: PasskeyFormProps) => {
  const { t } = useTranslation('auth');

  return (
    <>
      {isInIframe && (
        <div className="mb-4 p-4 bg-accent/20 border border-accent rounded-lg">
          <p className="text-sm text-accent font-semibold mb-2">{t('preview_limitation')}</p>
          <p className="text-xs text-muted-foreground mb-3">
            {t('passkey_preview_desc')}
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => window.open(window.location.href, '_blank')}
          >
            {t('open_new_tab')}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t('passkey_published_desc')}
          </p>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="space-y-4">
        {isLogin ? (
          <div className="text-center py-8">
            <Fingerprint className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">{t('sign_in_passkey')}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t('passkey_biometric_desc')}
            </p>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading || !passkeySupported}
            >
              {loading ? t('processing') : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  {t('sign_in_with_passkey')}
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="passkey-name">{t('name')}</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passkey-name"
                  type="text"
                  placeholder={t('passkey_name_placeholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passkey-email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passkey-email"
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
              disabled={loading || !passkeySupported}
            >
              {loading ? t('processing') : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  {t('register_passkey')}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t('passkey_setup_desc')}
            </p>
          </>
        )}
      </form>
    </>
  );
};
