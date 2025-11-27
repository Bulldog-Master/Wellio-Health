import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Download, Zap, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PWAFeatures = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
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
        <h1 className="text-3xl font-bold mb-2">App Features</h1>
        <p className="text-muted-foreground">
          Enhance your Wellio experience with these powerful features
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
            <CardTitle>Connection Status</CardTitle>
          </div>
          <CardDescription>
            {isOnline ? "You're online and syncing data" : "You're offline - changes will sync when back online"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Install PWA */}
      {!isInstalled && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              <CardTitle>Install App</CardTitle>
            </div>
            <CardDescription>
              Install Wellio on your device for offline access and a native app experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleInstall} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Install Wellio
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
              <CardTitle>Push Notifications</CardTitle>
            </div>
            <CardDescription>
              Get reminders for workouts, meal logging, and social interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={requestNotifications} className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Performance Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <CardTitle>Performance Features</CardTitle>
          </div>
          <CardDescription>
            Wellio uses advanced optimization techniques for blazing fast performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <p className="font-medium text-sm">Image Lazy Loading</p>
              <p className="text-xs text-muted-foreground">Images load only when needed to save bandwidth</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <p className="font-medium text-sm">Intelligent Caching</p>
              <p className="text-xs text-muted-foreground">Your data is cached for instant access</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
            <div>
              <p className="font-medium text-sm">Code Splitting</p>
              <p className="text-xs text-muted-foreground">Pages load on demand for faster initial load</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>
            Navigate faster with these keyboard shortcuts (Alt + Key)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + H</span>
              <span className="font-medium">Home</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + F</span>
              <span className="font-medium">Feed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + S</span>
              <span className="font-medium">Search</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + N</span>
              <span className="font-medium">Notifications</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + P</span>
              <span className="font-medium">Profile</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alt + M</span>
              <span className="font-medium">Messages</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAFeatures;
