import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, Check, X, AlertTriangle, Lock, Eye, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionGate } from "@/components/SubscriptionGate";

interface PrivacyCheck {
  id: string;
  label: string;
  description: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  action?: string;
  actionRoute?: string;
}

const PrivacyScore = () => {
  const { t } = useTranslation(['settings', 'common']);
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [checks, setChecks] = useState<PrivacyCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyzePrivacy();
  }, []);

  const analyzePrivacy = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_private, allow_mentions')
        .eq('id', user.id)
        .single();

      // Check 2FA status
      const { data: authSecrets } = await supabase
        .from('auth_secrets')
        .select('two_factor_enabled')
        .eq('user_id', user.id)
        .single();

      // Check trusted devices
      const { data: trustedDevices } = await supabase
        .from('trusted_devices')
        .select('id')
        .eq('user_id', user.id);

      // Check encryption keys
      const { data: encryptionKeys } = await supabase
        .from('user_encryption_keys')
        .select('id')
        .eq('user_id', user.id);

      const privacyChecks: PrivacyCheck[] = [
        {
          id: 'private_profile',
          label: t('private_profile'),
          description: t('private_profile_desc'),
          status: profile?.is_private ? 'good' : 'warning',
          icon: <Eye className="w-5 h-5" />,
          action: t('make_private'),
          actionRoute: '/privacy-security',
        },
        {
          id: '2fa_enabled',
          label: t('two_factor_auth'),
          description: t('two_factor_desc'),
          status: authSecrets?.two_factor_enabled ? 'good' : 'critical',
          icon: <Lock className="w-5 h-5" />,
          action: t('enable_2fa'),
          actionRoute: '/privacy-security',
        },
        {
          id: 'encryption_keys',
          label: t('encryption_configured'),
          description: t('encryption_desc'),
          status: encryptionKeys && encryptionKeys.length > 0 ? 'good' : 'warning',
          icon: <Shield className="w-5 h-5" />,
        },
        {
          id: 'trusted_devices',
          label: t('trusted_devices_check'),
          description: t('trusted_devices_desc'),
          status: trustedDevices && trustedDevices.length > 0 ? 'good' : 'warning',
          icon: <UserX className="w-5 h-5" />,
          action: t('manage_devices'),
          actionRoute: '/trusted-devices',
        },
        {
          id: 'mentions_control',
          label: t('mentions_control'),
          description: t('mentions_control_desc'),
          status: profile?.allow_mentions === false ? 'good' : 'warning',
          icon: <UserX className="w-5 h-5" />,
        },
      ];

      setChecks(privacyChecks);

      // Calculate score
      const goodChecks = privacyChecks.filter(c => c.status === 'good').length;
      const totalChecks = privacyChecks.length;
      const calculatedScore = Math.round((goodChecks / totalChecks) * 100);
      setScore(calculatedScore);

    } catch (error) {
      console.error('Error analyzing privacy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = () => {
    if (score >= 80) return t('excellent');
    if (score >= 50) return t('needs_improvement');
    return t('at_risk');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-green-500/20 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'critical':
        return 'border-red-500/20 bg-red-500/5';
    }
  };

  return (
    <SubscriptionGate feature="Privacy Score Dashboard">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('privacy_score')}</h1>
              <p className="text-muted-foreground">{t('privacy_score_desc')}</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Card className="p-8 text-center">
              <div className={`text-6xl font-bold ${getScoreColor()} mb-2`}>
                {score}%
              </div>
              <Badge variant="outline" className={getScoreColor()}>
                {getScoreLabel()}
              </Badge>
              <Progress value={score} className="mt-4 h-3" />
              <p className="text-muted-foreground mt-4">
                {t('privacy_score_explanation')}
              </p>
            </Card>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{t('privacy_checks')}</h2>
              {checks.map((check) => (
                <Card 
                  key={check.id} 
                  className={`p-4 border ${getStatusColor(check.status)}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {check.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(check.status)}
                        <span className="font-medium">{check.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {check.description}
                      </p>
                    </div>
                    {check.action && check.actionRoute && check.status !== 'good' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(check.actionRoute!)}
                      >
                        {check.action}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </SubscriptionGate>
  );
};

export default PrivacyScore;
