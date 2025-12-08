import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Mail, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface AccountSecurityCardProps {
  userEmail: string;
  onChangePassword: () => void;
  onChangeEmail: () => void;
}

const AccountSecurityCard = ({
  userEmail,
  onChangePassword,
  onChangeEmail,
}: AccountSecurityCardProps) => {
  const { t } = useTranslation('privacy');
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle>{t('account_security')}</CardTitle>
            <CardDescription>
              {t('account_security_description')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t('email_address')}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onChangeEmail}>
            {t('change')}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t('password')}</p>
              <p className="text-sm text-muted-foreground">••••••••</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onChangePassword}>
            {t('change')}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t('trusted_devices')}</p>
              <p className="text-sm text-muted-foreground">{t('manage_devices')}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/settings/trusted-devices')}
          >
            {t('manage')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSecurityCard;
