import { useInstallPrompt } from '@/hooks/ui';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useState } from 'react';

/**
 * PWA installation prompt component
 */
export const InstallPrompt = () => {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) return null;

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setIsDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-card border border-border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-5">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 p-1 hover:bg-accent rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Download className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-foreground">Install App</h3>
          <p className="text-sm text-muted-foreground">
            Install our app for quick access and offline use
          </p>
          
          <div className="flex gap-2 pt-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              Install
            </Button>
            <Button onClick={() => setIsDismissed(true)} variant="outline" size="sm">
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;