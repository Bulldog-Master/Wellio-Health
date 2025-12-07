import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, CreditCard, RefreshCw, Calendar, DollarSign, Bell } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const BillingTerms = () => {
  const { t } = useTranslation(['legal', 'common']);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('legal:billing_terms_title')}
        </CardTitle>
        <CardDescription>{t('legal:billing_terms_description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('legal:auto_renewal_notice')}</AlertTitle>
          <AlertDescription>{t('legal:auto_renewal_notice_desc')}</AlertDescription>
        </Alert>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="subscription-billing">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('legal:subscription_billing')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>{t('legal:subscription_billing_desc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('legal:billing_cycle_monthly')}</li>
                <li>{t('legal:billing_cycle_annual')}</li>
                <li>{t('legal:billing_auto_renew')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="auto-renewal">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('legal:auto_renewal_terms')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>{t('legal:auto_renewal_terms_desc')}</p>
              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-semibold mb-2">{t('legal:renewal_notification')}</h4>
                <p className="text-sm">{t('legal:renewal_notification_desc')}</p>
              </div>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('legal:renewal_7_days')}</li>
                <li>{t('legal:renewal_24_hours')}</li>
                <li>{t('legal:renewal_confirmation')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price-changes">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('legal:price_changes')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>{t('legal:price_changes_desc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('legal:price_notice_30_days')}</li>
                <li>{t('legal:price_grandfathered')}</li>
                <li>{t('legal:price_cancel_option')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment-methods">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t('legal:payment_methods')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>{t('legal:payment_methods_desc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('legal:payment_credit_card')}</li>
                <li>{t('legal:payment_paypal')}</li>
                <li>{t('legal:payment_crypto')}</li>
                <li>{t('legal:payment_etransfer')}</li>
              </ul>
              <p className="text-sm">{t('legal:payment_security_note')}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="failed-payments">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t('legal:failed_payments')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-muted-foreground">
              <p>{t('legal:failed_payments_desc')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('legal:failed_retry_1')}</li>
                <li>{t('legal:failed_retry_2')}</li>
                <li>{t('legal:failed_suspension')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="text-xs text-muted-foreground border-t pt-4">
          {t('legal:billing_terms_footer')}
        </div>
      </CardContent>
    </Card>
  );
};
