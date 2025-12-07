import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Accessibility, Eye, MousePointer, Volume2, Type } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface AccessibilityPreferences {
  high_contrast: boolean;
  reduce_motion: boolean;
  large_text: boolean;
  screen_reader_optimized: boolean;
  font_size_multiplier?: number;
}

const defaultPreferences: AccessibilityPreferences = {
  high_contrast: false,
  reduce_motion: false,
  large_text: false,
  screen_reader_optimized: false,
  font_size_multiplier: 1
};

export const AccessibilitySettings = () => {
  const { t } = useTranslation(['compliance', 'common']);
  const [userId, setUserId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        loadPreferences(user.id);
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    // Apply preferences to document
    applyPreferences(preferences);
  }, [preferences]);

  const loadPreferences = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_privacy_preferences')
        .select('accessibility_preferences')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;
      if (data?.accessibility_preferences) {
        const prefs = data.accessibility_preferences as unknown as AccessibilityPreferences;
        setPreferences({
          ...defaultPreferences,
          ...prefs
        });
      }
    } catch (error) {
      console.error('Error loading accessibility preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyPreferences = (prefs: AccessibilityPreferences) => {
    const html = document.documentElement;
    
    // High contrast
    if (prefs.high_contrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
    
    // Reduce motion
    if (prefs.reduce_motion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }
    
    // Large text
    if (prefs.large_text) {
      html.classList.add('large-text');
    } else {
      html.classList.remove('large-text');
    }
    
    // Font size multiplier
    if (prefs.font_size_multiplier) {
      html.style.setProperty('--font-size-multiplier', String(prefs.font_size_multiplier));
    }
  };

  const updatePreference = async (key: keyof AccessibilityPreferences, value: boolean | number) => {
    if (!userId) return;
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      const { error } = await supabase
        .from('user_privacy_preferences')
        .upsert({
          user_id: userId,
          accessibility_preferences: newPreferences as unknown as Json,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success(t('compliance:accessibility_updated'));
    } catch (error) {
      console.error('Error saving accessibility preferences:', error);
      toast.error(t('common:error'));
    }
  };

  if (loading || !userId) return null;

  return (
    <Card className="border-purple-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">{t('compliance:accessibility_title')}</CardTitle>
          </div>
          <Badge variant="outline" className="text-purple-500 border-purple-500/30">
            WCAG 2.1 AA
          </Badge>
        </div>
        <CardDescription>{t('compliance:accessibility_description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-base">
                {t('compliance:high_contrast')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('compliance:high_contrast_desc')}
              </p>
            </div>
          </div>
          <Switch
            id="high-contrast"
            checked={preferences.high_contrast}
            onCheckedChange={(value) => updatePreference('high_contrast', value)}
            aria-label={t('compliance:high_contrast')}
          />
        </div>

        {/* Reduce Motion */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MousePointer className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion" className="text-base">
                {t('compliance:reduce_motion')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('compliance:reduce_motion_desc')}
              </p>
            </div>
          </div>
          <Switch
            id="reduce-motion"
            checked={preferences.reduce_motion}
            onCheckedChange={(value) => updatePreference('reduce_motion', value)}
            aria-label={t('compliance:reduce_motion')}
          />
        </div>

        {/* Large Text */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Type className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="large-text" className="text-base">
                {t('compliance:large_text')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('compliance:large_text_desc')}
              </p>
            </div>
          </div>
          <Switch
            id="large-text"
            checked={preferences.large_text}
            onCheckedChange={(value) => updatePreference('large_text', value)}
            aria-label={t('compliance:large_text')}
          />
        </div>

        {/* Screen Reader Optimized */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="screen-reader" className="text-base">
                {t('compliance:screen_reader')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('compliance:screen_reader_desc')}
              </p>
            </div>
          </div>
          <Switch
            id="screen-reader"
            checked={preferences.screen_reader_optimized}
            onCheckedChange={(value) => updatePreference('screen_reader_optimized', value)}
            aria-label={t('compliance:screen_reader')}
          />
        </div>

        {/* Font Size Slider */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Type className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label className="text-base">
                {t('compliance:font_size')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('compliance:font_size_desc')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs">A</span>
            <Slider
              value={[preferences.font_size_multiplier || 1]}
              onValueChange={([value]) => updatePreference('font_size_multiplier', value)}
              min={0.8}
              max={1.5}
              step={0.1}
              className="flex-1"
              aria-label={t('compliance:font_size')}
            />
            <span className="text-lg font-bold">A</span>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {Math.round((preferences.font_size_multiplier || 1) * 100)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
