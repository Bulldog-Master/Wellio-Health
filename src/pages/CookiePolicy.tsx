import { useTranslation } from 'react-i18next';
import { ArrowLeft, Cookie, Shield, Settings, BarChart3, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import Layout from '@/components/Layout';

const CookiePolicy = () => {
  const { t } = useTranslation(['legal', 'common']);
  const navigate = useNavigate();

  const cookieTypes = [
    {
      icon: Shield,
      type: t('legal:essential_cookies'),
      description: t('legal:essential_cookies_desc'),
      examples: t('legal:essential_cookies_examples'),
      retention: t('legal:session_retention'),
    },
    {
      icon: Settings,
      type: t('legal:functional_cookies'),
      description: t('legal:functional_cookies_desc'),
      examples: t('legal:functional_cookies_examples'),
      retention: t('legal:one_year_retention'),
    },
    {
      icon: BarChart3,
      type: t('legal:analytics_cookies'),
      description: t('legal:analytics_cookies_desc'),
      examples: t('legal:analytics_cookies_examples'),
      retention: t('legal:two_year_retention'),
    },
    {
      icon: Target,
      type: t('legal:marketing_cookies'),
      description: t('legal:marketing_cookies_desc'),
      examples: t('legal:marketing_cookies_examples'),
      retention: t('legal:one_year_retention'),
    },
  ];

  return (
    <Layout>
      <SEOHead 
        titleKey="cookie_policy_title"
        descriptionKey="cookie_policy_description"
        namespace="seo"
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
          aria-label={t('common:back')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common:back')}
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <Cookie className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('legal:cookie_policy_title')}</h1>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('legal:what_are_cookies')}</h2>
            <p className="text-muted-foreground">{t('legal:cookies_explanation')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('legal:how_we_use_cookies')}</h2>
            <p className="text-muted-foreground">{t('legal:cookies_usage_explanation')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t('legal:types_of_cookies')}</h2>
            <div className="space-y-4">
              {cookieTypes.map((cookie, index) => (
                <Card key={index} className="bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <cookie.icon className="h-5 w-5 text-primary" />
                      {cookie.type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{cookie.description}</p>
                    <p className="text-sm">
                      <span className="font-medium">{t('legal:examples')}:</span>{' '}
                      <span className="text-muted-foreground">{cookie.examples}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">{t('legal:retention')}:</span>{' '}
                      <span className="text-muted-foreground">{cookie.retention}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('legal:managing_cookies')}</h2>
            <p className="text-muted-foreground">{t('legal:managing_cookies_text')}</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>{t('legal:browser_settings')}</li>
              <li>{t('legal:cookie_preferences')}</li>
              <li>{t('legal:opt_out_analytics')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('legal:third_party_cookies')}</h2>
            <p className="text-muted-foreground">{t('legal:third_party_cookies_text')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('legal:cookie_consent')}</h2>
            <p className="text-muted-foreground">{t('legal:cookie_consent_text')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('legal:policy_updates')}</h2>
            <p className="text-muted-foreground">{t('legal:cookie_policy_updates_text')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('legal:contact_us')}</h2>
            <p className="text-muted-foreground">{t('legal:cookie_contact_text')}</p>
            <p className="text-muted-foreground mt-2">
              {t('legal:email')}: <a href="mailto:privacy@wellio.app" className="text-primary hover:underline">privacy@wellio.app</a>
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            {t('legal:last_updated')}: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CookiePolicy;
