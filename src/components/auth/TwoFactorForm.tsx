import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Key } from "lucide-react";

interface TwoFactorFormProps {
  loading: boolean;
  totpCode: string;
  setTotpCode: (value: string) => void;
  backupCode: string;
  setBackupCode: (value: string) => void;
  useBackupCode: boolean;
  setUseBackupCode: (value: boolean) => void;
  rememberDevice: boolean;
  setRememberDevice: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const TwoFactorForm = ({
  loading,
  totpCode,
  setTotpCode,
  backupCode,
  setBackupCode,
  useBackupCode,
  setUseBackupCode,
  rememberDevice,
  setRememberDevice,
  onSubmit,
  onCancel,
}: TwoFactorFormProps) => {
  const { t } = useTranslation('auth');

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-center mb-6">
        {useBackupCode ? <Key className="w-10 h-10 text-primary" /> : <Shield className="w-10 h-10 text-primary" />}
      </div>

      {useBackupCode ? (
        <div className="space-y-2">
          <Label htmlFor="backup">{t('backup_code')}</Label>
          <Input
            id="backup"
            type="text"
            placeholder="XXXX-XXXX-XXXX"
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
            className="text-center tracking-wider"
            required
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="totp">{t('authentication_code')}</Label>
          <Input
            id="totp"
            type="text"
            placeholder="000000"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-2xl tracking-widest"
            maxLength={6}
            required
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember" 
          checked={rememberDevice}
          onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
        />
        <Label 
          htmlFor="remember" 
          className="text-sm font-normal cursor-pointer"
        >
          {t('remember_device')}
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={loading || (!useBackupCode && totpCode.length !== 6) || (useBackupCode && !backupCode.trim())}
      >
        {loading ? t('verifying') : t('verify_continue')}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          setUseBackupCode(!useBackupCode);
          setTotpCode("");
          setBackupCode("");
        }}
      >
        {useBackupCode ? t('use_auth_app') : t('use_backup_code')}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onCancel}
      >
        {t('cancel')}
      </Button>
    </form>
  );
};
