import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimit';
import { getDeviceName } from '@/lib/deviceFingerprint';
import { isWebAuthnSupported, registerPasskey, authenticatePasskey } from '@/lib/webauthn';
import { AuthMethod, UserRole } from '@/components/auth/types';

interface UseAuthHandlersProps {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userRole: UserRole;
  newPassword: string;
  isLogin: boolean;
  totpCode: string;
  backupCode: string;
  useBackupCode: boolean;
  rememberDevice: boolean;
  deviceFingerprint: string;
  isInIframe: boolean;
  passkeySupported: boolean;
  setLoading: (loading: boolean) => void;
  setRequires2FA: (requires: boolean) => void;
  setPendingUserId: (userId: string | null) => void;
  setTotpCode: (code: string) => void;
  setBackupCode: (code: string) => void;
  setUseBackupCode: (use: boolean) => void;
  setRememberDevice: (remember: boolean) => void;
  setIsLogin: (isLogin: boolean) => void;
  setIsForgotPassword: (isForgot: boolean) => void;
  setIsResettingPassword: (isResetting: boolean) => void;
  setNewPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  setPassword: (password: string) => void;
  setAuthMethod: (method: AuthMethod) => void;
}

export const useAuthHandlers = ({
  email,
  password,
  confirmPassword,
  name,
  userRole,
  newPassword,
  isLogin,
  totpCode,
  backupCode,
  useBackupCode,
  rememberDevice,
  deviceFingerprint,
  isInIframe,
  passkeySupported,
  setLoading,
  setRequires2FA,
  setPendingUserId,
  setTotpCode,
  setBackupCode,
  setUseBackupCode,
  setRememberDevice,
  setIsLogin,
  setIsForgotPassword,
  setIsResettingPassword,
  setNewPassword,
  setConfirmPassword,
  setPassword,
  setAuthMethod,
}: UseAuthHandlersProps) => {
  const { t } = useTranslation('auth');
  const { toast } = useToast();
  const navigate = useNavigate();

  const emailSchema = z.string().email(t('invalid_email'));
  const passwordSchema = z.string().min(6, t('password_min_length'));

  const validateInputs = useCallback(() => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      if (!isLogin && !name.trim()) {
        throw new Error(t('name_required'));
      }
      if (!isLogin && password !== confirmPassword) {
        throw new Error(t('passwords_do_not_match'));
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('validation_error'),
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: t('validation_error'),
          description: error.message,
          variant: "destructive",
        });
      }
      return false;
    }
  }, [email, password, confirmPassword, name, isLogin, t, toast, emailSchema, passwordSchema]);

  const handlePasswordAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    const rateLimitKey = isLogin ? `login:${email}` : `signup:${email}`;
    const rateLimit = await rateLimiter.check(
      rateLimitKey,
      isLogin ? RATE_LIMITS.LOGIN : RATE_LIMITS.SIGNUP
    );

    if (!rateLimit.allowed) {
      const minutes = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000);
      toast({
        title: t('too_many_attempts'),
        description: t('try_again_after_minutes', { minutes }),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        rateLimiter.reset(rateLimitKey);

        if (data.user) {
          const { data: authSecret } = await supabase
            .from('auth_secrets')
            .select('two_factor_enabled')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (authSecret?.two_factor_enabled) {
            const { data: trustedDevice } = await supabase
              .from('trusted_devices')
              .select('id')
              .eq('user_id', data.user.id)
              .eq('device_fingerprint', deviceFingerprint)
              .maybeSingle();

            if (trustedDevice) {
              await supabase
                .from('trusted_devices')
                .update({ last_used_at: new Date().toISOString() })
                .eq('id', trustedDevice.id);
              toast({
                title: t('welcome_back'),
                description: t('signin_trusted_device'),
              });
              setLoading(false);
              return;
            }

            setPendingUserId(data.user.id);
            setRequires2FA(true);
            await supabase.auth.signOut();
            
            toast({
              title: t('2fa_required'),
              description: t('2fa_required_desc'),
            });
            setLoading(false);
            return;
          }
        }

        toast({
          title: t('welcome_back'),
          description: t('signin_success'),
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const refCode = sessionStorage.getItem('referral_code');
        let referredBy = null;
        
        if (refCode) {
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', refCode)
            .maybeSingle();
          
          if (referrerProfile) {
            referredBy = referrerProfile.id;
          }
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: name,
              username: email.split('@')[0],
              role: userRole,
              referred_by: referredBy,
            },
          },
        });

        if (error) throw error;
        rateLimiter.reset(rateLimitKey);
        sessionStorage.removeItem('referral_code');

        toast({
          title: t('account_created'),
          description: t('can_signin_now'),
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('error_occurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, name, userRole, isLogin, deviceFingerprint, validateInputs, setLoading, setRequires2FA, setPendingUserId, setIsLogin, toast, t]);

  const handleVerify2FA = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (useBackupCode) {
      if (!backupCode.trim()) {
        toast({
          title: t('invalid_backup_code'),
          description: t('enter_backup_code'),
          variant: "destructive",
        });
        return;
      }
    } else {
      if (totpCode.length !== 6) {
        toast({
          title: t('invalid_code'),
          description: t('enter_6digit_code'),
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const endpoint = useBackupCode ? 'totp-verify-backup' : 'totp-verify';
      const body = useBackupCode ? { backupCode } : { token: totpCode };

      const { data, error } = await supabase.functions.invoke(endpoint, { body });

      if (error || !data?.verified) {
        await supabase.auth.signOut();
        throw new Error(useBackupCode ? t('invalid_backup_code') : t('invalid_auth_code'));
      }

      if (rememberDevice && deviceFingerprint) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('trusted_devices').insert({
            user_id: user.id,
            device_fingerprint: deviceFingerprint,
            device_name: getDeviceName()
          });
        }
      }

      if (useBackupCode && data.remainingCodes !== undefined) {
        toast({
          title: t('welcome_back'),
          description: t('backup_code_verified', { count: data.remainingCodes }),
        });
      } else {
        toast({
          title: t('welcome_back'),
          description: t('2fa_success'),
        });
      }

      setRequires2FA(false);
      setTotpCode("");
      setBackupCode("");
      setUseBackupCode(false);
      setRememberDevice(false);
      setPendingUserId(null);
    } catch (error: any) {
      toast({
        title: t('verification_failed'),
        description: error.message || t('invalid_auth_code'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, totpCode, backupCode, useBackupCode, rememberDevice, deviceFingerprint, setLoading, setRequires2FA, setTotpCode, setBackupCode, setUseBackupCode, setRememberDevice, setPendingUserId, toast, t]);

  const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('validation_error'),
          description: error.issues[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    const rateLimitKey = `password_reset:${email}`;
    const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.PASSWORD_RESET);

    if (!rateLimit.allowed) {
      const minutes = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000);
      toast({
        title: t('too_many_requests'),
        description: t('try_again_after_minutes', { minutes }),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: t('reset_link_sent'),
        description: t('check_email_reset'),
      });
      
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('error_occurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [email, setLoading, setIsForgotPassword, toast, t, emailSchema]);

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      passwordSchema.parse(newPassword);
      if (newPassword !== confirmPassword) {
        throw new Error(t('passwords_do_not_match'));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('validation_error'),
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: t('validation_error'),
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: t('password_updated'),
        description: t('password_reset_success'),
      });
      
      window.history.replaceState({}, document.title, "/auth");
      setIsResettingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setIsLogin(true);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('error_occurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [newPassword, confirmPassword, setLoading, setIsResettingPassword, setNewPassword, setConfirmPassword, setIsLogin, toast, t, passwordSchema]);

  const handleMagicLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t('validation_error'),
          description: error.issues[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) throw error;

      toast({
        title: t('magic_link_sent'),
        description: t('check_email_magic'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('error_occurred'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [email, setLoading, toast, t, emailSchema]);

  const handlePasskey = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isInIframe) {
      toast({
        title: t('open_in_new_tab'),
        description: t('passkey_preview_limitation'),
        variant: "destructive",
      });
      return;
    }

    if (!passkeySupported) {
      toast({
        title: t('not_supported'),
        description: t('passkey_not_supported'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        try {
          const authData = await authenticatePasskey();
          
          const { data, error } = await supabase.functions.invoke('passkey-authenticate', {
            body: {
              credentialId: authData.credentialId,
              signature: authData.signature,
              authenticatorData: authData.authenticatorData,
              clientDataJSON: authData.clientDataJSON
            }
          });

          if (error) throw error;
          if (!data?.actionLink) throw new Error(t('authentication_failed'));

          window.location.href = data.actionLink;
        } catch (authError: any) {
          if (authError.name === 'NotAllowedError') {
            toast({
              title: t('auth_cancelled'),
              description: t('approve_biometric'),
              variant: "destructive",
            });
          } else {
            toast({
              title: t('no_passkey_found'),
              description: t('register_passkey_first'),
              variant: "destructive",
            });
          }
          return;
        }
      } else {
        try {
          emailSchema.parse(email);
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast({
              title: t('validation_error'),
              description: error.issues[0].message,
              variant: "destructive",
            });
          }
          throw error;
        }

        if (!name) throw new Error(t('enter_name'));

        const passkeyData = await registerPasskey(email);
        const tempPassword = crypto.randomUUID();
        const redirectUrl = `${window.location.origin}/`;
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: name, username: email },
          },
        });

        if (signUpError) {
          if (signUpError.message?.includes('already registered')) {
            toast({
              title: t('account_already_exists'),
              description: t('email_already_registered'),
              variant: "destructive",
            });
            setAuthMethod('password');
            setIsLogin(true);
            throw new Error('Email already registered');
          }
          throw signUpError;
        }

        if (!authData.user) throw new Error(t('failed_create_account'));

        const { error: functionError } = await supabase.functions.invoke('passkey-register', {
          body: {
            credentialId: passkeyData.credentialId,
            publicKey: passkeyData.publicKey,
            counter: passkeyData.counter,
            deviceType: 'platform',
            userId: authData.user.id,
          },
        });

        if (functionError) throw new Error(`Failed to store passkey: ${functionError.message}`);
        
        toast({
          title: t('success'),
          description: t('account_created_passkey'),
        });
      }
    } catch (error: any) {
      if (error.name !== 'NotAllowedError' && !error.message?.includes('already registered')) {
        toast({
          title: t('passkey_error'),
          description: error.message || t('passkey_auth_failed'),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [email, name, isLogin, isInIframe, passkeySupported, setLoading, setAuthMethod, setIsLogin, toast, t, emailSchema]);

  const cancel2FA = useCallback(() => {
    setRequires2FA(false);
    setTotpCode("");
    setBackupCode("");
    setUseBackupCode(false);
    setRememberDevice(false);
    setPendingUserId(null);
    setPassword("");
  }, [setRequires2FA, setTotpCode, setBackupCode, setUseBackupCode, setRememberDevice, setPendingUserId, setPassword]);

  return {
    handlePasswordAuth,
    handleVerify2FA,
    handleForgotPassword,
    handleResetPassword,
    handleMagicLink,
    handlePasskey,
    cancel2FA,
  };
};
