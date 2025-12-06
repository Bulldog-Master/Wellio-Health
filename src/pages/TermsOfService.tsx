import React from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import SEOHead from '@/components/SEOHead';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, AlertTriangle, CreditCard, Ban, RefreshCw } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const { t } = useTranslation(['legal', 'common']);
  const lastUpdated = '2024-12-06';

  return (
    <Layout>
      <SEOHead 
        titleKey="terms_title"
        descriptionKey="terms_description"
        namespace="legal"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('legal:terms_title')}
          </h1>
          <p className="text-muted-foreground">
            {t('legal:last_updated')}: {lastUpdated}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-6 pr-4">
            {/* Acceptance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t('legal:acceptance_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>{t('legal:acceptance_text')}</p>
              </CardContent>
            </Card>

            {/* Account Terms */}
            <Card>
              <CardHeader>
                <CardTitle>{t('legal:account_terms')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('legal:account_age')}</li>
                  <li>{t('legal:account_accurate')}</li>
                  <li>{t('legal:account_secure')}</li>
                  <li>{t('legal:account_responsibility')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  {t('legal:acceptable_use')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t('legal:acceptable_intro')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('legal:use_lawful')}</li>
                  <li>{t('legal:use_accurate_data')}</li>
                  <li>{t('legal:use_respect')}</li>
                  <li>{t('legal:use_no_spam')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Prohibited Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-destructive" />
                  {t('legal:prohibited')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('legal:prohibited_illegal')}</li>
                  <li>{t('legal:prohibited_impersonate')}</li>
                  <li>{t('legal:prohibited_harassment')}</li>
                  <li>{t('legal:prohibited_malware')}</li>
                  <li>{t('legal:prohibited_scraping')}</li>
                  <li>{t('legal:prohibited_circumvent')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Subscriptions & Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  {t('legal:payments_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t('legal:payments_intro')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('legal:payments_billing')}</li>
                  <li>{t('legal:payments_renewal')}</li>
                  <li>{t('legal:payments_cancel')}</li>
                  <li>{t('legal:payments_refund')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Health Disclaimer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  {t('legal:health_disclaimer')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 border-l-4 border-warning pl-4">
                <p className="text-muted-foreground font-medium">{t('legal:health_disclaimer_text')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('legal:health_not_medical')}</li>
                  <li>{t('legal:health_consult')}</li>
                  <li>{t('legal:health_emergency')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>{t('legal:intellectual_property')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('legal:ip_text')}</p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  {t('legal:termination')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('legal:termination_text')}</p>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardHeader>
                <CardTitle>{t('legal:liability')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('legal:liability_text')}</p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>{t('legal:governing_law')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('legal:governing_law_text')}</p>
              </CardContent>
            </Card>

            {/* Changes */}
            <Card>
              <CardHeader>
                <CardTitle>{t('legal:changes_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('legal:changes_text')}</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default TermsOfService;