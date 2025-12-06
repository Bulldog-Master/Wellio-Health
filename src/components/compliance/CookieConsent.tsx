import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Cookie, Settings, X } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        setPreferences(JSON.parse(consent));
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = async (prefs: CookiePreferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    setShowBanner(false);

    // Save to database for logged-in users
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);

    await supabase.from('cookie_consents').insert({
      user_id: user?.id || null,
      session_id: sessionId,
      essential: prefs.essential,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
    });
  };

  const acceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptEssential = () => {
    const essentialOnly = { essential: true, analytics: false, marketing: false };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg">
      <div className="max-w-4xl mx-auto">
        {!showDetails ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground">{t('compliance:cookie_title')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('compliance:cookie_description')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
                <Settings className="h-4 w-4 mr-2" />
                {t('compliance:customize')}
              </Button>
              <Button variant="outline" size="sm" onClick={acceptEssential}>
                {t('compliance:essential_only')}
              </Button>
              <Button size="sm" onClick={acceptAll}>
                {t('compliance:accept_all')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{t('compliance:cookie_settings')}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{t('compliance:essential_cookies')}</p>
                  <p className="text-sm text-muted-foreground">{t('compliance:essential_desc')}</p>
                </div>
                <Switch checked disabled aria-label={t('compliance:essential_cookies')} />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{t('compliance:analytics_cookies')}</p>
                  <p className="text-sm text-muted-foreground">{t('compliance:analytics_desc')}</p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, analytics: checked }))}
                  aria-label={t('compliance:analytics_cookies')}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{t('compliance:marketing_cookies')}</p>
                  <p className="text-sm text-muted-foreground">{t('compliance:marketing_desc')}</p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => setPreferences(p => ({ ...p, marketing: checked }))}
                  aria-label={t('compliance:marketing_cookies')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={acceptEssential}>
                {t('compliance:essential_only')}
              </Button>
              <Button onClick={saveCustom}>
                {t('compliance:save_preferences')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
