import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smartphone, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import type { SavedApp } from "@/types/workout.types";

interface AppsLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedApps: SavedApp[];
  onDeleteApp: (id: string) => void;
  onShowAddApp: () => void;
}

const AppsLibraryDialog = ({
  open,
  onOpenChange,
  savedApps,
  onDeleteApp,
  onShowAddApp,
}: AppsLibraryDialogProps) => {
  const { t } = useTranslation(['workout', 'common']);
  const { toast } = useToast();

  const handleBrowseApps = () => {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      window.open('https://apps.apple.com/us/genre/ios-health-fitness/id6013', '_blank');
    } else if (isAndroid) {
      window.open('https://play.google.com/store/apps/category/HEALTH_AND_FITNESS', '_blank');
    } else {
      window.open('https://apps.apple.com/us/genre/ios-health-fitness/id6013', '_blank');
    }
  };

  const handleOpenApp = (appUrl: string | null, appName: string) => {
    if (!appUrl) {
      toast({
        title: "No URL available",
        description: "This app doesn't have a URL configured.",
        variant: "destructive",
      });
      return;
    }

    const deepLinkMap: Record<string, string> = {
      'myfitnesspal': 'myfitnesspal://',
      'strava': 'strava://',
      'strong': 'strong://',
      'fitbod': 'fitbod://',
      'nike training': 'niketraining://',
      'peloton': 'peloton://',
    };

    const appNameLower = appName.toLowerCase();
    const deepLink = Object.keys(deepLinkMap).find(key => appNameLower.includes(key));

    if (deepLink && /iPad|iPhone|iPod|Android/i.test(navigator.userAgent)) {
      const deepLinkUrl = deepLinkMap[deepLink];
      const timeout = setTimeout(() => {
        window.location.href = appUrl;
      }, 2000);

      window.location.href = deepLinkUrl;

      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimeout(timeout);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      window.open(appUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-emerald-900 dark:text-emerald-100 flex items-center justify-between">
            <span>{t('apps')}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBrowseApps}>
                <Smartphone className="w-4 h-4 mr-2" />
                {t('browse_apps')}
              </Button>
              <Button variant="outline" size="sm" onClick={onShowAddApp}>
                <Plus className="w-4 h-4 mr-2" />
                {t('add_custom')}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          {savedApps.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedApps.map((app) => (
                <Card key={app.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center overflow-hidden">
                      {app.app_icon_url ? (
                        <img src={app.app_icon_url} alt={app.app_name} className="w-full h-full object-cover" />
                      ) : (
                        <Smartphone className="w-8 h-8 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">{app.app_name}</h3>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteApp(app.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      {app.app_description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{app.app_description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {app.platform && (
                          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">{app.platform}</span>
                        )}
                        {app.app_category && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">{app.app_category}</span>
                        )}
                      </div>
                      {app.app_url && (
                        <button
                          onClick={() => handleOpenApp(app.app_url, app.app_name)}
                          className="text-sm text-emerald-600 hover:underline mt-2 inline-block"
                        >
                          Open App →
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">{t('no_apps_saved')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppsLibraryDialog;
