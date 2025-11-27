import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle, Chrome, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

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
            <CardTitle>App Already Installed!</CardTitle>
            <CardDescription>
              Wellio is installed on your device. Open it from your home screen or app drawer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-gradient-primary"
            >
              Go to Dashboard
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
          <CardTitle>Install Wellio App</CardTitle>
          <CardDescription>
            Install Wellio on your device for a native app experience with offline access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Works Offline</p>
                <p className="text-xs text-muted-foreground">Access your data even without internet</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Faster Performance</p>
                <p className="text-xs text-muted-foreground">Loads instantly from your home screen</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Get reminders and updates</p>
              </div>
            </div>
          </div>

          {/* Install Instructions */}
          {isIOS ? (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Apple className="w-4 h-4" />
                iOS Installation
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Tap the Share button (square with arrow) in Safari</li>
                <li>2. Scroll down and tap "Add to Home Screen"</li>
                <li>3. Tap "Add" in the top right corner</li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            <Button 
              onClick={handleInstall}
              className="w-full bg-gradient-primary"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Chrome className="w-4 h-4" />
                Android/Chrome Installation
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Tap the menu (three dots) in your browser</li>
                <li>2. Select "Install app" or "Add to Home Screen"</li>
                <li>3. Follow the prompts to complete installation</li>
              </ol>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Continue in Browser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
