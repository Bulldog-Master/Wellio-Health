import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { SEOHead } from '@/components/common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Accessibility, CheckCircle, Mail, ExternalLink } from 'lucide-react';

const AccessibilityPage: React.FC = () => {
  const { t } = useTranslation(['accessibility', 'common']);
  const navigate = useNavigate();

  return (
    <Layout>
      <SEOHead 
        titleKey="page_title"
        descriptionKey="page_description"
        namespace="accessibility"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common:back')}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Accessibility className="h-8 w-8 text-primary" />
            {t('accessibility:statement_title')}
          </h1>
          <p className="text-muted-foreground">{t('accessibility:statement_subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Commitment */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accessibility:commitment_title')}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground">{t('accessibility:commitment_text')}</p>
            </CardContent>
          </Card>

          {/* Standards */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accessibility:standards_title')}</CardTitle>
              <CardDescription>{t('accessibility:standards_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('accessibility:wcag_perceivable')}</p>
                    <p className="text-sm text-muted-foreground">{t('accessibility:wcag_perceivable_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('accessibility:wcag_operable')}</p>
                    <p className="text-sm text-muted-foreground">{t('accessibility:wcag_operable_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('accessibility:wcag_understandable')}</p>
                    <p className="text-sm text-muted-foreground">{t('accessibility:wcag_understandable_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('accessibility:wcag_robust')}</p>
                    <p className="text-sm text-muted-foreground">{t('accessibility:wcag_robust_desc')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accessibility:features_title')}</CardTitle>
              <CardDescription>{t('accessibility:features_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('accessibility:feature_keyboard')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('accessibility:feature_screen_reader')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('accessibility:feature_contrast')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('accessibility:feature_resize')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('accessibility:feature_motion')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('accessibility:feature_focus')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('accessibility:feature_alt_text')}
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {t('accessibility:feature_semantic')}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Assistive Technologies */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accessibility:assistive_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t('accessibility:assistive_text')}</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• JAWS, NVDA, VoiceOver</li>
                <li>• Dragon NaturallySpeaking</li>
                <li>• ZoomText, Windows Magnifier</li>
                <li>• Switch Access, Sip-and-Puff</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accessibility:feedback_title')}</CardTitle>
              <CardDescription>{t('accessibility:feedback_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t('accessibility:feedback_text')}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <a href="mailto:accessibility@wellio.app">
                    <Mail className="h-4 w-4 mr-2" />
                    accessibility@wellio.app
                  </a>
                </Button>
                <Button variant="outline" onClick={() => navigate('/support')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('accessibility:contact_support')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Continuous Improvement */}
          <Card>
            <CardHeader>
              <CardTitle>{t('accessibility:improvement_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('accessibility:improvement_text')}</p>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <p className="text-sm text-muted-foreground text-center">
            {t('accessibility:last_updated')}: December 2024
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AccessibilityPage;
