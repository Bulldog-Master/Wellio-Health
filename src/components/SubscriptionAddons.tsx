import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Check, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Addon {
  id: string;
  addon_key: string;
  name: string;
  name_es: string | null;
  description: string | null;
  description_es: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  sort_order: number;
}

interface UserAddon {
  id: string;
  addon_id: string;
  status: string;
  billing_cycle: string;
  expires_at: string | null;
}

export const SubscriptionAddons = () => {
  const { t, i18n } = useTranslation(['addons', 'common']);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [userAddons, setUserAddons] = useState<UserAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [yearlyBilling, setYearlyBilling] = useState(false);
  const isSpanish = i18n.language?.startsWith('es');

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: addonsData } = await supabase
        .from('subscription_addons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (addonsData) {
        setAddons(addonsData.map(a => ({
          ...a,
          features: Array.isArray(a.features) ? a.features.map(f => String(f)) : []
        })));
      }

      if (user) {
        const { data: userAddonsData } = await supabase
          .from('user_addons')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (userAddonsData) {
          setUserAddons(userAddonsData);
        }
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAddon = (addonId: string) => {
    return userAddons.some(ua => ua.addon_id === addonId);
  };

  const toggleAddon = async (addon: Addon) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existing = userAddons.find(ua => ua.addon_id === addon.id);
    const addonName = isSpanish && addon.name_es ? addon.name_es : addon.name;

    if (existing) {
      // Remove addon
      const { error } = await supabase
        .from('user_addons')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (!error) {
        setUserAddons(prev => prev.filter(ua => ua.id !== existing.id));
        toast.success(t('addon_removed'), {
          description: t('addon_removed_desc', { name: addonName })
        });
      }
    } else {
      // Add addon
      const { data, error } = await supabase
        .from('user_addons')
        .insert({
          user_id: user.id,
          addon_id: addon.id,
          billing_cycle: yearlyBilling ? 'yearly' : 'monthly'
        })
        .select()
        .single();

      if (!error && data) {
        setUserAddons(prev => [...prev, data]);
        toast.success(t('addon_added'), {
          description: t('addon_added_desc', { name: addonName })
        });
      }
    }
  };

  const calculateSavings = (monthly: number, yearly: number | null) => {
    if (!yearly) return 0;
    const annualMonthly = monthly * 12;
    return Math.round((1 - yearly / annualMonthly) * 100);
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {t('addons_title')}
          </h2>
          <p className="text-muted-foreground">{t('addons_description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={!yearlyBilling ? 'font-semibold' : 'text-muted-foreground'}>
            {t('billed_monthly')}
          </span>
          <Switch checked={yearlyBilling} onCheckedChange={setYearlyBilling} />
          <span className={yearlyBilling ? 'font-semibold' : 'text-muted-foreground'}>
            {t('billed_yearly')}
          </span>
        </div>
      </div>

      {/* Current Add-ons */}
      {userAddons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('your_addons')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {userAddons.map(ua => {
                const addon = addons.find(a => a.id === ua.addon_id);
                if (!addon) return null;
                return (
                  <Badge key={ua.id} variant="secondary" className="gap-1">
                    <Check className="w-3 h-3" />
                    {isSpanish && addon.name_es ? addon.name_es : addon.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Add-ons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {addons.map(addon => {
          const isActive = hasAddon(addon.id);
          const price = yearlyBilling && addon.price_yearly 
            ? addon.price_yearly 
            : addon.price_monthly;
          const savings = calculateSavings(addon.price_monthly, addon.price_yearly);
          const name = isSpanish && addon.name_es ? addon.name_es : addon.name;
          const description = isSpanish && addon.description_es ? addon.description_es : addon.description;

          return (
            <Card key={addon.id} className={isActive ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{name}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                  {isActive && (
                    <Badge variant="default">{t('active')}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${price.toFixed(2)}</span>
                  <span className="text-muted-foreground">
                    {yearlyBilling ? t('per_year') : t('per_month')}
                  </span>
                  {yearlyBilling && savings > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {t('save_yearly', { percent: savings })}
                    </Badge>
                  )}
                </div>

                {addon.features.length > 0 && (
                  <ul className="space-y-1 text-sm">
                    {addon.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className="w-full"
                  variant={isActive ? 'outline' : 'default'}
                  onClick={() => toggleAddon(addon)}
                >
                  {isActive ? (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      {t('remove_addon')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('add_addon')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>{t('coming_soon')}</p>
          <p className="text-sm">{t('payment_integration')}</p>
        </CardContent>
      </Card>
    </div>
  );
};
