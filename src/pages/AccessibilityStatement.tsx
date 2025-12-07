import { useTranslation } from 'react-i18next';
import { ArrowLeft, Eye, Keyboard, Monitor, Volume2, MousePointer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SEOHead from '@/components/SEOHead';
import Layout from '@/components/Layout';

const AccessibilityStatement = () => {
  const { t } = useTranslation(['accessibility', 'common']);
  const navigate = useNavigate();

  const features = [
    {
      icon: Keyboard,
      title: t('accessibility:keyboard_nav_title'),
      description: t('accessibility:keyboard_nav_desc'),
    },
    {
      icon: Eye,
      title: t('accessibility:screen_reader_title'),
      description: t('accessibility:screen_reader_desc'),
    },
    {
      icon: Monitor,
      title: t('accessibility:high_contrast_title'),
      description: t('accessibility:high_contrast_desc'),
    },
    {
      icon: Volume2,
      title: t('accessibility:audio_desc_title'),
      description: t('accessibility:audio_desc_desc'),
    },
    {
      icon: MousePointer,
      title: t('accessibility:focus_indicators_title'),
      description: t('accessibility:focus_indicators_desc'),
    },
    {
      icon: FileText,
      title: t('accessibility:alt_text_title'),
      description: t('accessibility:alt_text_desc'),
    },
  ];

  return (
    <Layout>
      <SEOHead 
        titleKey="accessibility_page_title"
        descriptionKey="accessibility_page_description"
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

        <h1 className="text-3xl font-bold mb-6">{t('accessibility:title')}</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('accessibility:commitment_title')}</h2>
            <p className="text-muted-foreground">{t('accessibility:commitment_text')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('accessibility:standards_title')}</h2>
            <p className="text-muted-foreground">{t('accessibility:standards_text')}</p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>{t('accessibility:wcag_perceivable')}</li>
              <li>{t('accessibility:wcag_operable')}</li>
              <li>{t('accessibility:wcag_understandable')}</li>
              <li>{t('accessibility:wcag_robust')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">{t('accessibility:features_title')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('accessibility:assistive_title')}</h2>
            <p className="text-muted-foreground">{t('accessibility:assistive_text')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('accessibility:feedback_title')}</h2>
            <p className="text-muted-foreground">{t('accessibility:feedback_text')}</p>
            <p className="text-muted-foreground mt-2">
              {t('accessibility:contact_email')}: <a href="mailto:accessibility@wellio.app" className="text-primary hover:underline">accessibility@wellio.app</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('accessibility:ongoing_title')}</h2>
            <p className="text-muted-foreground">{t('accessibility:ongoing_text')}</p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            {t('accessibility:last_updated')}: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AccessibilityStatement;
