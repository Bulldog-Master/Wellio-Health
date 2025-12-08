import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { isWebAuthnSupported } from '@/lib/webauthn';
import { generateDeviceFingerprint, getStoredFingerprint, storeFingerprint } from '@/lib/deviceFingerprint';
import { prefetchWithTimeout } from '@/lib/authUtils';

interface UseAuthEffectsProps {
  initialCheckDone: boolean;
  isResettingPassword: boolean;
  setInitialCheckDone: (done: boolean) => void;
  setPasskeySupported: (supported: boolean) => void;
  setIsInIframe: (isIframe: boolean) => void;
  setIsResettingPassword: (isResetting: boolean) => void;
  setIsLogin: (isLogin: boolean) => void;
  setAuthMethod: (method: "password" | "magiclink" | "passkey") => void;
  setHasReferralCode: (hasCode: boolean) => void;
  setDeviceFingerprint: (fingerprint: string) => void;
}

export const useAuthEffects = ({
  initialCheckDone,
  isResettingPassword,
  setInitialCheckDone,
  setPasskeySupported,
  setIsInIframe,
  setIsResettingPassword,
  setIsLogin,
  setAuthMethod,
  setHasReferralCode,
  setDeviceFingerprint,
}: UseAuthEffectsProps) => {
  const { t } = useTranslation('auth');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initial setup effect
  useEffect(() => {
    setPasskeySupported(isWebAuthnSupported());
    setIsInIframe(window.self !== window.top);
    
    // Check for password reset token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setIsResettingPassword(true);
      setIsLogin(true);
      setAuthMethod('password');
      toast({
        title: t('reset_password_title'),
        description: t('enter_new_password'),
      });
    }
    
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      sessionStorage.setItem('referral_code', refCode);
      setHasReferralCode(true);
      setIsLogin(false);
      toast({
        title: t('referral_welcome'),
        description: t('referral_bonus'),
      });
    }
    
    // Generate device fingerprint on mount
    const initFingerprint = async () => {
      let fingerprint = getStoredFingerprint();
      if (!fingerprint) {
        fingerprint = await generateDeviceFingerprint();
        storeFingerprint(fingerprint);
      }
      setDeviceFingerprint(fingerprint);
    };
    initFingerprint();
    
    setInitialCheckDone(true);
  }, [toast, t, setInitialCheckDone, setPasskeySupported, setIsInIframe, setIsResettingPassword, setIsLogin, setAuthMethod, setHasReferralCode, setDeviceFingerprint]);

  // Auth state listener effect
  useEffect(() => {
    if (!initialCheckDone) return;
    if (isResettingPassword) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        prefetchWithTimeout(session.user.id).then(() => {
          navigate("/");
        });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        prefetchWithTimeout(session.user.id).then(() => {
          navigate("/");
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isResettingPassword, initialCheckDone]);
};
