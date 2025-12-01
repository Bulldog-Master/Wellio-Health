import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Download, Zap, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PWAFeatures = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const { t } = useTranslation('install');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Track online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      navigate('/install');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('app_features')}</h1>
        <p className="text-muted-foreground">
          {t('enhance_experience')}
        </p>
      </div>

      {/* Online Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-orange-500" />
            )}
            <CardTitle>{t('connection_status')}</CardTitle>
          </div>
          <CardDescription>
            {isOnline ? t('online_syncing') : t('offline_sync_later')}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Install PWA */}
      {!isInstalled && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              <CardTitle>{t('install_app')}</CardTitle>
            </div>
            <CardDescription>
              {t('install_for_offline')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstall} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              {t('install_wellio')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Push Notifications */}
      {isInstalled && notificationPermission !== 'granted' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>{t('push_notifications')}</CardTitle>
            </div>
            <CardDescription>
              {t('notifications_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={requestNotifications} className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              {t('enable_notifications')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Performance Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <CardTitle>{t('performance_features')}</CardTitle>
          </div>
          <CardDescription>
            {t('performance_description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <p className="font-medium text-sm">{t('image_lazy_loading')}</p>
              <p className="text-xs text-muted-foreground">{t('image_lazy_loading_desc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <p className="font-medium text-sm">{t('intelligent_caching')}</p>
              <p className="text-xs text-muted-foreground">{t('intelligent_caching_desc')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <p className="font-medium text-sm">{t('code_splitting')}</p>
              <p className="text-xs text-muted-foreground">{t('code_splitting_desc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>{t('keyboard_shortcuts')}</CardTitle>
          <CardDescription>
            {t('keyboard_shortcuts_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + H</span>
              <span className="font-medium">{t('home')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + F</span>
              <span className="font-medium">{t('feed')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + S</span>
              <span className="font-medium">{t('search')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + N</span>
              <span className="font-medium">{t('notifications')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + P</span>
              <span className="font-medium">{t('profile')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + M</span>
              <span className="font-medium">{t('messages')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAFeatures;
