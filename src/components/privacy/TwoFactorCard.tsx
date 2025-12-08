import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TwoFactorCardProps {
  is2FAEnabled: boolean;
  show2FASetup: boolean;
  qrCodeUrl: string;
  totpToken: string;
  onTotpTokenChange: (value: string) => void;
  onSetup2FA: () => void;
  onDisable2FA: () => void;
  onVerify2FA: () => void;
  onCancelSetup: () => void;
}

const TwoFactorCard = ({
  is2FAEnabled,
  show2FASetup,
  qrCodeUrl,
  totpToken,
  onTotpTokenChange,
  onSetup2FA,
  onDisable2FA,
  onVerify2FA,
  onCancelSetup,
}: TwoFactorCardProps) => {
  const { t } = useTranslation('privacy');

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle>{t('two_factor_auth')}</CardTitle>
            <CardDescription>
              {t('two_factor_description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t('2fa_status')}</Label>
            <p className="text-sm text-muted-foreground">
              {is2FAEnabled ? t('2fa_enabled') : t('2fa_not_set')}
            </p>
          </div>
          <Switch
            checked={is2FAEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                onSetup2FA();
              } else {
                onDisable2FA();
              }
            }}
          />
        </div>

        {show2FASetup && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>{t('scan_qr_code')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('scan_qr_description')}
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totp-token">{t('enter_verification_code')}</Label>
              <Input
                id="totp-token"
                type="text"
                placeholder={t('placeholder_6digit')}
                maxLength={6}
                value={totpToken}
                onChange={(e) => onTotpTokenChange(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={onVerify2FA} disabled={totpToken.length !== 6}>
                {t('verify_enable')}
              </Button>
              <Button variant="outline" onClick={onCancelSetup}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorCard;
