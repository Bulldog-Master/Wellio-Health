import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/common';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Globe, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation(['legal', 'common']);
  const lastUpdated = '2024-12-06';

  return (
    <Layout>
      <SEOHead 
        titleKey="privacy_policy_title"
        descriptionKey="privacy_policy_description"
        namespace="legal"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('legal:privacy_policy_title')}
          </h1>
          <p className="text-muted-foreground">
            {t('legal:last_updated')}: {lastUpdated}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-6 pr-4">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {t('legal:introduction')}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>{t('legal:intro_text')}</p>
              </CardContent>
            </Card>

            {/* Data We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  {t('legal:data_we_collect')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('legal:personal_info')}</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>{t('legal:collect_email')}</li>
                    <li>{t('legal:collect_name')}</li>
                    <li>{t('legal:collect_profile')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('legal:health_data')}</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>{t('legal:collect_fitness')}</li>
                    <li>{t('legal:collect_nutrition')}</li>
                    <li>{t('legal:collect_medical')}</li>
                    <li>{t('legal:collect_measurements')}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('legal:usage_data')}</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>{t('legal:collect_device')}</li>
                    <li>{t('legal:collect_usage')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  {t('legal:how_we_use')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('legal:use_provide_service')}</li>
                  <li>{t('legal:use_personalize')}</li>
                  <li>{t('legal:use_ai_insights')}</li>
                  <li>{t('legal:use_communicate')}</li>
                  <li>{t('legal:use_improve')}</li>
                  <li>{t('legal:use_security')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  {t('legal:data_security')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t('legal:security_intro')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('legal:security_encryption')}</li>
                  <li>{t('legal:security_e2e')}</li>
                  <li>{t('legal:security_2fa')}</li>
                  <li>{t('legal:security_audit')}</li>
                  <li>{t('legal:security_rls')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  {t('legal:your_rights')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{t('legal:rights_intro')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li><strong>{t('legal:right_access')}:</strong> {t('legal:right_access_desc')}</li>
                  <li><strong>{t('legal:right_rectify')}:</strong> {t('legal:right_rectify_desc')}</li>
                  <li><strong>{t('legal:right_erasure')}:</strong> {t('legal:right_erasure_desc')}</li>
                  <li><strong>{t('legal:right_portability')}:</strong> {t('legal:right_portability_desc')}</li>
                  <li><strong>{t('legal:right_withdraw')}:</strong> {t('legal:right_withdraw_desc')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle>{t('legal:data_retention')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('legal:retention_text')}</p>
              </CardContent>
            </Card>

            {/* Third Parties */}
            <Card>
              <CardHeader>
                <CardTitle>{t('legal:third_parties')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{t('legal:third_parties_intro')}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>{t('legal:third_party_hosting')}</li>
                  <li>{t('legal:third_party_payments')}</li>
                  <li>{t('legal:third_party_analytics')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {t('legal:contact_us')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('legal:contact_text')}</p>
                <p className="mt-2 text-primary">privacy@wellio.app</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;