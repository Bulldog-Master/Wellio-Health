import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle, Chrome, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('install');

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Capture the install prompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="inline-flex justify-center mb-4">
              <div className="p-4 rounded-full bg-green-500/20">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <CardTitle>{t('app_already_installed')}</CardTitle>
            <CardDescription>
              {t('wellio_installed')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-primary"
            >
              {t('go_to_dashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/20">
              <Smartphone className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle>{t('install_wellio_app')}</CardTitle>
          <CardDescription>
            {t('install_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{t('works_offline')}</p>
                <p className="text-xs text-muted-foreground">{t('works_offline_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{t('faster_performance')}</p>
                <p className="text-xs text-muted-foreground">{t('faster_performance_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{t('push_notifications')}</p>
                <p className="text-xs text-muted-foreground">{t('push_notifications_desc')}</p>
              </div>
            </div>
          </div>

          {/* Install Instructions */}
          {isIOS ? (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Apple className="w-4 h-4" />
                {t('ios_installation')}
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>{t('ios_step_1')}</li>
                <li>{t('ios_step_2')}</li>
                <li>{t('ios_step_3')}</li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            <Button 
              onClick={handleInstall}
              className="w-full bg-gradient-primary"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              {t('install_app')}
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Chrome className="w-4 h-4" />
                {t('android_chrome_installation')}
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>{t('android_step_1')}</li>
                <li>{t('android_step_2')}</li>
                <li>{t('android_step_3')}</li>
              </ol>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              {t('continue_in_browser')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
