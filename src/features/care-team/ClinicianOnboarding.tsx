import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, Shield, Eye, EyeOff, Lock, Users, TrendingUp, 
  CheckCircle, ArrowRight, Video, MessageSquare 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClinicianOnboardingProps {
  onComplete?: () => void;
}

/**
 * ClinicianOnboarding component explains the platform to new clinicians
 * and aligns with the professional economics model.
 */
export const ClinicianOnboarding = ({ onComplete }: ClinicianOnboardingProps) => {
  const { t } = useTranslation(['professional', 'care_team', 'common']);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Hero Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {t('professional:clinician_welcome', 'Welcome to Wellio for Clinicians')}
          </CardTitle>
          <CardDescription className="text-base">
            {t('professional:clinician_welcome_desc', 
              'Gain functional wellness insights into your patients without accessing PHI or raw health data.'
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* What You Can See */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">
              {t('care_team:what_you_can_see', 'What You Can See')}
            </CardTitle>
          </div>
          <CardDescription>
            {t('care_team:derived_insights_only', 'Derived wellness insights — never raw logs or PHI')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">
                  {t('care_team:functional_wellness_index', 'Functional Wellness Index')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('care_team:fwi_desc', 'A composite score reflecting overall wellness patterns')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">
                  {t('care_team:trend_analysis', 'Trend Analysis')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('care_team:trend_desc', '14-30 day patterns in sleep, activity, and adherence')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <Users className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">
                  {t('care_team:adherence_metrics', 'Adherence Metrics')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('care_team:adherence_desc', 'Behavioral consistency indicators across wellness categories')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">
                  {t('care_team:high_level_status', 'High-Level Wellbeing Status')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('care_team:status_desc', 'Quick indicators of whether a patient is thriving or struggling')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What You Cannot See */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg">
              {t('care_team:what_you_cannot_see', 'What You Cannot See')}
            </CardTitle>
          </div>
          <CardDescription>
            {t('care_team:privacy_boundaries', 'These privacy boundaries are enforced by the system')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {[
              { label: t('care_team:raw_logs', 'Raw activity logs and timestamped entries') },
              { label: t('care_team:meal_details', 'Specific meal details and food choices') },
              { label: t('care_team:mood_logs', 'Personal mood logs and journal content') },
              { label: t('care_team:medical_vault', 'Medical Vault documents and uploaded files') },
              { label: t('care_team:communication_metadata', 'Communication metadata and timing patterns') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Tools */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {t('professional:communication_tools', 'Secure Communication')}
            </CardTitle>
          </div>
          <CardDescription>
            {t('professional:communication_desc', 'All communication is post-quantum encrypted via cMixx')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">
                  {t('professional:secure_messaging', 'Secure Messaging')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('professional:messaging_desc', 'E2E encrypted with metadata protection')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Video className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">
                  {t('professional:video_sessions', 'Video Sessions')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('professional:video_desc', 'Encrypted signaling, no recording stored')}
                </p>
                <Badge variant="outline" className="mt-1 text-xs">
                  {t('professional:pro_tier', 'Pro Tier')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('professional:how_it_works', 'How It Works')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: t('professional:step_apply', 'Apply as a Clinician'),
                desc: t('professional:step_apply_desc', 'Submit your credentials for verification'),
              },
              {
                step: 2,
                title: t('professional:step_approved', 'Get Approved'),
                desc: t('professional:step_approved_desc', 'Our team reviews and approves your application'),
              },
              {
                step: 3,
                title: t('professional:step_invite', 'Generate Invite Codes'),
                desc: t('professional:step_invite_desc', 'Create unique codes for your patients to connect'),
              },
              {
                step: 4,
                title: t('professional:step_connect', 'Patients Connect'),
                desc: t('professional:step_connect_desc', 'Patients enter your code and consent to share insights'),
              },
              {
                step: 5,
                title: t('professional:step_monitor', 'Monitor & Support'),
                desc: t('professional:step_monitor_desc', 'View FWI trends and communicate securely'),
              },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {item.step}
                </div>
                <div className="flex-1 pb-4 border-b border-dashed last:border-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex gap-4">
        <Button asChild className="flex-1">
          <Link to="/professional-apply">
            {t('professional:apply_now', 'Apply Now')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        {onComplete && (
          <Button variant="outline" onClick={onComplete}>
            {t('common:continue', 'Continue')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClinicianOnboarding;
