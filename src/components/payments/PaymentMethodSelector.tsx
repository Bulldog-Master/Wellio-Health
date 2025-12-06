import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Send, 
  Bitcoin, 
  Coins,
  DollarSign,
  Check,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  method_key: string;
  name: string;
  name_es: string | null;
  description: string | null;
  description_es: string | null;
  icon: string;
  requires_region: string[] | null;
  is_active: boolean;
  min_amount: number | null;
  max_amount: number | null;
  sort_order: number | null;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onSelect: (methodKey: string) => void;
  amount?: number;
  userRegion?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Smartphone,
  Wallet,
  Send,
  Bitcoin,
  Coins,
  DollarSign,
};

export const PaymentMethodSelector = ({
  selectedMethod,
  onSelect,
  amount = 0,
  userRegion = 'US'
}: PaymentMethodSelectorProps) => {
  const { t, i18n } = useTranslation(['payments', 'common']);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSpanish = i18n.language?.startsWith('es');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      // Use secure RPC function that hides fee structure
      const { data, error } = await supabase.rpc('get_payment_methods_safe' as any);

      if (error) throw error;
      if (data) {
        setMethods(data as unknown as PaymentMethod[]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isMethodAvailable = (method: PaymentMethod) => {
    if (!method.requires_region || method.requires_region.length === 0) {
      return true;
    }
    return method.requires_region.includes(userRegion);
  };

  // Fee calculation removed - fee info now hidden from client for security

  const getMethodName = (method: PaymentMethod) => {
    return isSpanish && method.name_es ? method.name_es : method.name;
  };

  const getMethodDescription = (method: PaymentMethod) => {
    return isSpanish && method.description_es ? method.description_es : method.description;
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || CreditCard;
    return Icon;
  };

  // Group methods by category
  const cardMethods = methods.filter(m => ['stripe', 'apple_pay', 'google_pay'].includes(m.method_key));
  const digitalWallets = methods.filter(m => ['paypal'].includes(m.method_key));
  const bankTransfer = methods.filter(m => ['etransfer'].includes(m.method_key));
  const cryptoMethods = methods.filter(m => m.method_key.startsWith('crypto_'));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RadioGroup value={selectedMethod || ''} onValueChange={onSelect}>
        {/* Card Payments */}
        {cardMethods.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t('card_payments')}</h3>
            <div className="grid gap-3">
              {cardMethods.map(method => {
                const Icon = getIcon(method.icon);
                const available = isMethodAvailable(method);

                return (
                  <Label
                    key={method.id}
                    htmlFor={method.method_key}
                    className={cn(
                      "cursor-pointer",
                      !available && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Card className={cn(
                      "transition-all",
                      selectedMethod === method.method_key && "border-primary ring-2 ring-primary/20",
                      !available && "bg-muted"
                    )}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem 
                          value={method.method_key} 
                          id={method.method_key}
                          disabled={!available}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-muted rounded-lg">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{getMethodName(method)}</p>
                            <p className="text-sm text-muted-foreground">
                              {getMethodDescription(method)}
                            </p>
                          </div>
                          {selectedMethod === method.method_key && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                );
              })}
            </div>
          </div>
        )}

        {/* Digital Wallets */}
        {digitalWallets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t('digital_wallets')}</h3>
            <div className="grid gap-3">
              {digitalWallets.map(method => {
                const Icon = getIcon(method.icon);
                const available = isMethodAvailable(method);

                return (
                  <Label
                    key={method.id}
                    htmlFor={method.method_key}
                    className={cn(
                      "cursor-pointer",
                      !available && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Card className={cn(
                      "transition-all",
                      selectedMethod === method.method_key && "border-primary ring-2 ring-primary/20"
                    )}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem 
                          value={method.method_key} 
                          id={method.method_key}
                          disabled={!available}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-muted rounded-lg">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{getMethodName(method)}</p>
                            <p className="text-sm text-muted-foreground">
                              {getMethodDescription(method)}
                            </p>
                          </div>
                          {selectedMethod === method.method_key && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                );
              })}
            </div>
          </div>
        )}

        {/* Bank Transfer (Canada Only) */}
        {bankTransfer.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t('bank_transfer')}</h3>
            <div className="grid gap-3">
              {bankTransfer.map(method => {
                const Icon = getIcon(method.icon);
                const available = isMethodAvailable(method);

                return (
                  <Label
                    key={method.id}
                    htmlFor={method.method_key}
                    className={cn(
                      "cursor-pointer",
                      !available && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Card className={cn(
                      "transition-all",
                      selectedMethod === method.method_key && "border-primary ring-2 ring-primary/20",
                      !available && "bg-muted"
                    )}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem 
                          value={method.method_key} 
                          id={method.method_key}
                          disabled={!available}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-muted rounded-lg">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{getMethodName(method)}</p>
                            <p className="text-sm text-muted-foreground">
                              {getMethodDescription(method)}
                            </p>
                          </div>
                          {!available && (
                            <Badge variant="outline" className="text-xs">
                              {t('canada_only')}
                            </Badge>
                          )}
                          {selectedMethod === method.method_key && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                );
              })}
            </div>
          </div>
        )}

        {/* Cryptocurrency */}
        {cryptoMethods.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{t('cryptocurrency')}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {cryptoMethods.map(method => {
                const Icon = getIcon(method.icon);

                return (
                  <Label
                    key={method.id}
                    htmlFor={method.method_key}
                    className="cursor-pointer"
                  >
                    <Card className={cn(
                      "transition-all",
                      selectedMethod === method.method_key && "border-primary ring-2 ring-primary/20"
                    )}>
                      <CardContent className="flex items-center gap-4 p-4">
                        <RadioGroupItem 
                          value={method.method_key} 
                          id={method.method_key}
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-muted rounded-lg">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{getMethodName(method)}</p>
                          </div>
                          {selectedMethod === method.method_key && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                );
              })}
            </div>
          </div>
        )}
      </RadioGroup>

    </div>
  );
};