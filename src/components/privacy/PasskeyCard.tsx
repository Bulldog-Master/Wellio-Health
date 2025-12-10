import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Pencil, Trash2 } from "lucide-react";
import { isWebAuthnSupported } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";

interface Passkey {
  id: string;
  name: string;
  created_at: string;
}

interface PasskeyCardProps {
  passkeys: Passkey[];
  onRegisterPasskey: () => void;
  onRenamePasskey: (passkey: { id: string; currentName: string }) => void;
  onDeletePasskey: (id: string) => void;
}

const PasskeyCard = ({
  passkeys,
  onRegisterPasskey,
  onRenamePasskey,
  onDeletePasskey,
}: PasskeyCardProps) => {
  const { t } = useTranslation('privacy');

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary/10 rounded-xl">
            <Key className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <CardTitle>{t('passkey_webauthn')}</CardTitle>
            <CardDescription>
              {t('passkey_description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isWebAuthnSupported() && (
          <p className="text-sm text-destructive">
            {t('browser_no_passkeys')}
          </p>
        )}

        {isWebAuthnSupported() && (
          <Button onClick={onRegisterPasskey} variant="outline">
            <Key className="w-4 h-4 mr-2" />
            {t('register_passkey')}
          </Button>
        )}

        {passkeys.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('registered_passkeys')}</Label>
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">{passkey.name}</span>
                    <p className="text-xs text-muted-foreground">
                      {t('registered')}{" "}
                      {formatDistanceToNow(new Date(passkey.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      onRenamePasskey({ id: passkey.id, currentName: passkey.name })
                    }
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeletePasskey(passkey.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PasskeyCard;
