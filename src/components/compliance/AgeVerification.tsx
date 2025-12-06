import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface AgeVerificationProps {
  children: React.ReactNode;
  minAge?: 13 | 18;
}

export const AgeVerification = ({ children, minAge = 13 }: AgeVerificationProps) => {
  const { t } = useTranslation(['compliance', 'common']);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const checkVerification = async () => {
      // Check localStorage first
      const stored = localStorage.getItem('age_verified');
      if (stored) {
        const data = JSON.parse(stored);
        if (minAge === 13 && data.is_over_13) {
          setVerified(true);
          return;
        }
        if (minAge === 18 && data.is_over_18) {
          setVerified(true);
          return;
        }
      }

      // Check database for logged-in users
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('age_verifications')
          .select('is_over_13, is_over_18')
          .eq('user_id', user.id)
          .order('verified_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          localStorage.setItem('age_verified', JSON.stringify(data));
          if ((minAge === 13 && data.is_over_13) || (minAge === 18 && data.is_over_18)) {
            setVerified(true);
            return;
          }
        }
      }

      setVerified(false);
    };

    checkVerification();
  }, [minAge]);

  const handleVerify = async (isOverAge: boolean) => {
    if (!isOverAge) {
      setDenied(true);
      return;
    }

    const verificationData = {
      is_over_13: minAge === 13 || true,
      is_over_18: minAge === 18,
    };

    localStorage.setItem('age_verified', JSON.stringify(verificationData));
    setVerified(true);

    // Save to database
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);

    await supabase.from('age_verifications').insert({
      user_id: user?.id || null,
      session_id: sessionId,
      is_over_13: verificationData.is_over_13,
      is_over_18: verificationData.is_over_18,
    });
  };

  if (verified === null) {
    return null; // Loading
  }

  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">{t('compliance:access_denied')}</h1>
          <p className="text-muted-foreground">
            {t('compliance:age_requirement', { age: minAge })}
          </p>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="text-center space-y-2">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">{t('compliance:age_verification')}</h1>
            <p className="text-muted-foreground">
              {t('compliance:age_verification_desc', { age: minAge })}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => handleVerify(true)}
            >
              {t('compliance:confirm_age', { age: minAge })}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleVerify(false)}
            >
              {t('compliance:under_age', { age: minAge })}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('compliance:coppa_notice')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
