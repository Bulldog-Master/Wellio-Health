import { useTranslation } from 'react-i18next';
import { ArrowLeft, CreditCard, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SEOHead } from '@/components/common';
import { Layout } from '@/components/layout';

const RefundPolicy = () => {
  const { t } = useTranslation(['legal', 'common']);

  return (
    <Layout>
      <SEOHead 
        titleKey="refund_policy_title"
        descriptionKey="refund_policy_description"
        namespace="legal"
      />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common:back')}
          </Link>
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t('legal:refund_policy_title')}</h1>
            <p className="text-muted-foreground mt-2">{t('legal:last_updated')}: {new Date().toLocaleDateString()}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('legal:refund_eligibility')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{t('legal:refund_eligibility_desc')}</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold text-green-500">{t('legal:eligible_refunds')}</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t('legal:eligible_1')}</li>
                    <li>• {t('legal:eligible_2')}</li>
                    <li>• {t('legal:eligible_3')}</li>
                    <li>• {t('legal:eligible_4')}</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <h4 className="font-semibold text-red-500">{t('legal:non_eligible_refunds')}</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t('legal:non_eligible_1')}</li>
                    <li>• {t('legal:non_eligible_2')}</li>
                    <li>• {t('legal:non_eligible_3')}</li>
                    <li>• {t('legal:non_eligible_4')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('legal:refund_timeframe')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">14</div>
                  <div>
                    <h4 className="font-semibold">{t('legal:subscription_refund_window')}</h4>
                    <p className="text-sm text-muted-foreground">{t('legal:subscription_refund_window_desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">7</div>
                  <div>
                    <h4 className="font-semibold">{t('legal:addon_refund_window')}</h4>
                    <p className="text-sm text-muted-foreground">{t('legal:addon_refund_window_desc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</div>
                  <div>
                    <h4 className="font-semibold">{t('legal:processing_time')}</h4>
                    <p className="text-sm text-muted-foreground">{t('legal:processing_time_desc')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {t('legal:how_to_request_refund')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>{t('legal:refund_step_1')}</li>
                <li>{t('legal:refund_step_2')}</li>
                <li>{t('legal:refund_step_3')}</li>
                <li>{t('legal:refund_step_4')}</li>
              </ol>
              
              <Separator />
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{t('legal:contact_support')}</h4>
                <p className="text-sm text-muted-foreground">{t('legal:contact_support_desc')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('legal:cancellation_policy')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{t('legal:cancellation_policy_desc')}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t('legal:cancellation_1')}</li>
                <li>{t('legal:cancellation_2')}</li>
                <li>{t('legal:cancellation_3')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
