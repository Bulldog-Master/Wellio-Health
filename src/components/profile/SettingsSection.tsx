import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, ChevronDown, Shield, CreditCard, Bell, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSection({ open, onOpenChange }: SettingsSectionProps) {
  const { t } = useTranslation('profile');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: t('error_signing_out'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  const settingsItems = [
    { icon: Shield, label: t('privacy_security'), path: '/privacy-security' },
    { icon: CreditCard, label: t('subscription'), path: '/subscription' },
    { icon: Bell, label: t('notifications'), path: '/notifications' },
    { icon: HelpCircle, label: t('help_support'), path: '/help' },
  ];

  return (
    <Card className="bg-gradient-card shadow-md overflow-hidden">
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Settings className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">{t('settings')}</h3>
              <p className="text-sm text-muted-foreground">{t('app_preferences')}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 pt-0 space-y-2 border-t">
            {settingsItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
