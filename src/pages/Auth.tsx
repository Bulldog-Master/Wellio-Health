import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, Mail, Lock, User as UserIcon, Sparkles, Fingerprint, Eye, EyeOff, Shield, Key, HeartPulse, Zap, Gift, Users } from "lucide-react";

// Pre-fetch and cache subscription status for instant Premium Hub display
const prefetchSubscriptionStatus = async (userId: string) => {
  try {
    const { data: hasVIP } = await supabase.rpc('has_active_vip', { _user_id: userId });
    const { data: hasAdmin } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    
    // Cache for instant display on navigation
    localStorage.setItem('subscription_isVIP', String(hasVIP || false));
    localStorage.setItem('subscription_isAdmin', String(hasAdmin || false));
    
    // Also fetch tier
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', userId)
      .single();
    
    localStorage.setItem('subscription_tier', subData?.tier || 'free');
  } catch (error) {
    console.error('Error prefetching subscription:', error);
  }
};
import authHero from "@/assets/auth-hero-new.jpg";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isWebAuthnSupported, registerPasskey, authenticatePasskey } from "@/lib/webauthn";
import { generateDeviceFingerprint, getDeviceName, getStoredFingerprint, storeFingerprint } from "@/lib/deviceFingerprint";
import { Checkbox } from "@/components/ui/checkbox";
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimit";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Auth = () => {
  const { t } = useTranslation('auth');
  
  const emailSchema = z.string().email(t('invalid_email'));
  const passwordSchema = z.string().min(6, t('password_min_length'));
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [userRole, setUserRole] = useState<'user' | 'trainer' | 'creator'>('user');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"password" | "magiclink" | "passkey">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [hasReferralCode, setHasReferralCode] = useState(false);

  // Check for password reset FIRST (synchronously, before any other effects)
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
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
      setIsLogin(false); // Switch to signup
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
  }, [toast]);

  useEffect(() => {
    // Wait for initial check to complete
    if (!initialCheckDone) return;
    
    // Don't set up auth listener if user is resetting password
    if (isResettingPassword) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Pre-fetch subscription status before navigating for instant Premium Hub display
        await prefetchSubscriptionStatus(session.user.id);
        navigate("/");
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await prefetchSubscriptionStatus(session.user.id);
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isResettingPassword, initialCheckDone]);

  const validateInputs = () => {
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
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;

    // Rate limiting
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

        // Success - reset rate limit
        rateLimiter.reset(rateLimitKey);

        // Check if user has 2FA enabled
        if (data.user) {
          const { data: authSecret } = await supabase
            .from('auth_secrets')
            .select('two_factor_enabled')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (authSecret?.two_factor_enabled) {
            // Check if device is trusted
            const { data: trustedDevice } = await supabase
              .from('trusted_devices')
              .select('id')
              .eq('user_id', data.user.id)
              .eq('device_fingerprint', deviceFingerprint)
              .maybeSingle();

            if (trustedDevice) {
              // Update last_used_at
              await supabase
                .from('trusted_devices')
                .update({ last_used_at: new Date().toISOString() })
                .eq('id', trustedDevice.id);
              // Device is trusted, skip 2FA
              toast({
                title: t('welcome_back'),
                description: t('signin_trusted_device'),
              });
              setLoading(false);
              return;
            }

            // Store user ID and show 2FA prompt
            setPendingUserId(data.user.id);
            setRequires2FA(true);
            
            // Sign out temporarily until 2FA is verified
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
        
        // Get referral code from session storage if exists
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
        
        // Success - reset rate limit
        rateLimiter.reset(rateLimitKey);
        
        // Clear referral code from session
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
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
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
      // Re-authenticate with password to get a valid session
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verify TOTP code or backup code
      const endpoint = useBackupCode ? 'totp-verify-backup' : 'totp-verify';
      const body = useBackupCode 
        ? { backupCode } 
        : { token: totpCode };

      const { data, error } = await supabase.functions.invoke(endpoint, { body });

      if (error || !data?.verified) {
        // Sign out if verification fails
        await supabase.auth.signOut();
        throw new Error(useBackupCode 
          ? t('invalid_backup_code') 
          : t('invalid_auth_code')
        );
      }

      // If user chose to remember device, trust it
      if (rememberDevice && deviceFingerprint) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('trusted_devices')
            .insert({
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

      // Reset 2FA state
      setRequires2FA(false);
      setTotpCode("");
      setBackupCode("");
      setUseBackupCode(false);
      setRememberDevice(false);
      setPendingUserId(null);
      
      // Navigation will happen automatically via the auth state change listener
    } catch (error: any) {
      toast({
        title: t('verification_failed'),
        description: error.message || t('invalid_auth_code'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
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

    // Rate limiting for password reset
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
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: t('password_updated'),
        description: t('password_reset_success'),
      });
      
      // Clear the hash and redirect
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
  };

  const handleMagicLink = async (e: React.FormEvent) => {
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
        options: {
          emailRedirectTo: redirectUrl,
        },
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
  };
  const handlePasskey = async (e: React.FormEvent) => {
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
        // Sign in with existing passkey - no email needed
        console.log('[Passkey] Starting authentication...');
        
        try {
          const authData = await authenticatePasskey();
          console.log('[Passkey] Biometric auth successful, verifying with backend');
          
          const { data, error } = await supabase.functions.invoke('passkey-authenticate', {
            body: {
              credentialId: authData.credentialId,
              signature: authData.signature,
              authenticatorData: authData.authenticatorData,
              clientDataJSON: authData.clientDataJSON
            }
          });

          if (error) {
            console.error('[Passkey] Backend verification failed:', error);
            throw error;
          }
          
          if (!data?.actionLink) {
            throw new Error(t('authentication_failed'));
          }

          // Navigate to the action link which will automatically sign the user in
          console.log('[Passkey] Redirecting to action link...');
          window.location.href = data.actionLink;
        } catch (authError: any) {
          console.log('[Passkey] Authentication failed:', authError);
          
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
          return; // Don't re-throw, we've already shown a friendly error
        }
      } else {
        // Register requires email and name
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

        if (!name) {
          throw new Error(t('enter_name'));
        }

        // Register new passkey
        console.log('[Passkey] Starting registration for:', email);
        
        // First, trigger the biometric prompt to create the passkey
        console.log('[Passkey] Requesting biometric authentication...');
        const passkeyData = await registerPasskey(email);
        console.log('[Passkey] Biometric registration successful, creating account...');
        
        // Now create the account
        const tempPassword = crypto.randomUUID();
        const redirectUrl = `${window.location.origin}/`;
        
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: name,
              username: email,
            },
          },
        });

        if (signUpError) {
          console.error('[Passkey] Account creation failed:', signUpError);
          if (signUpError.message?.includes('already registered')) {
            toast({
              title: t('account_already_exists'),
              description: t('email_already_registered'),
              variant: "destructive",
            });
            // Switch to password tab to help user sign in
            setAuthMethod('password');
            setIsLogin(true);
            throw new Error('Email already registered');
          }
          throw signUpError;
        }

        if (!authData.user) {
          throw new Error(t('failed_create_account'));
        }

        console.log('[Passkey] Account created, storing passkey credential...');
        console.log('[Passkey] User ID:', authData.user.id);
        console.log('[Passkey] Full credential data:', passkeyData);

        // Try using supabase.functions.invoke instead
        console.log('[Passkey] Attempting to store credential using Supabase client...');
        
        try {
          const { data: functionData, error: functionError } = await supabase.functions.invoke('passkey-register', {
            body: {
              credentialId: passkeyData.credentialId,
              publicKey: passkeyData.publicKey,
              counter: passkeyData.counter,
              deviceType: 'platform',
              userId: authData.user.id,
            },
          });

          console.log('[Passkey] Function response:', { data: functionData, error: functionError });

          if (functionError) {
            console.error('[Passkey] Function error:', functionError);
            throw new Error(`Failed to store passkey: ${functionError.message}`);
          }

          console.log('[Passkey] Registration successful!', functionData);
        } catch (invokeError) {
          console.error('[Passkey] Invoke error details:', invokeError);
          throw invokeError;
        }

        console.log('[Passkey] Registration complete!');
        
        toast({
          title: t('success'),
          description: t('account_created_passkey'),
        });
      }
    } catch (error: any) {
      console.error('[Passkey] Error:', error);
      
      // Don't show error toast if we already showed a specific one
      if (error.name !== 'NotAllowedError' && !error.message?.includes('already registered')) {
        let errorMessage = error.message || t('passkey_auth_failed');
        
        toast({
          title: t('passkey_error'),
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left side - Hero Image - NOW VISIBLE ON ALL SCREENS */}
      <div className="relative lg:block">
        <img 
          src={authHero} 
          alt={t('fitness_inspiration')}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/60" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-2 mb-3 md:mb-4 animate-float">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-glow" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {t('your_journey')}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-2 md:mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] tracking-tight">
              {t('app_name')}
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <HeartPulse className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-glow" />
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
              {t('welcome_back')}
            </h2>
          </div>
          <p className="text-base md:text-lg text-white/95 max-w-md drop-shadow-md">
            {t('hero_message')}
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Language Switcher - Prominently displayed */}
          <div className="flex justify-end mb-6">
            <div className="bg-accent/10 p-2 rounded-lg">
              <LanguageSwitcher />
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t('app_name')}</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {requires2FA 
                ? t('verify_identity')
                : isResettingPassword
                  ? t('reset_password_title')
                  : isLogin 
                    ? t('welcome_back')
                    : t('get_started')
              }
            </h2>
            <p className="text-muted-foreground">
              {requires2FA 
                ? t('enter_auth_code')
                : isResettingPassword
                  ? t('enter_new_password')
                  : isLogin 
                    ? t('sign_in_message')
                    : t('sign_up_message')
              }
            </p>
          </div>

          {/* Referral Promotion Banner */}
          {!requires2FA && !isResettingPassword && !isLogin && (
            <Card className="mb-6 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-primary/20 animate-fade-in">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                    <Gift className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      {hasReferralCode ? t('bonus_points') : t('signup_rewards')}
                      <Badge variant="secondary" className="text-xs">
                        {hasReferralCode ? "75 pts" : "25 pts"}
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {hasReferralCode 
                        ? t('signup_points_desc')
                        : t('signup_base_desc')
                      }
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-background/50 text-center">
                    <div className="font-semibold flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />
                      {t('share_earn')}
                    </div>
                    <div className="text-muted-foreground mt-1">150 pts {t('per_friend')}</div>
                  </div>
                  <div className="p-2 rounded bg-background/50 text-center">
                    <div className="font-semibold">{t('redeem_rewards')}</div>
                    <div className="text-muted-foreground mt-1">500 pts = 1 {t('month_pro')}</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {requires2FA ? (
            <form onSubmit={handleVerify2FA} className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                {useBackupCode ? <Key className="w-10 h-10 text-primary" /> : <Shield className="w-10 h-10 text-primary" />}
              </div>

              {useBackupCode ? (
                <div className="space-y-2">
                  <Label htmlFor="backup">{t('backup_code')}</Label>
                  <Input
                    id="backup"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                    className="text-center tracking-wider"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="totp">{t('authentication_code')}</Label>
                  <Input
                    id="totp"
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberDevice}
                  onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('remember_device')}
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading || (!useBackupCode && totpCode.length !== 6) || (useBackupCode && !backupCode.trim())}
              >
                {loading ? t('verifying') : t('verify_continue')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTotpCode("");
                  setBackupCode("");
                }}
              >
                {useBackupCode ? t('use_authenticator') : t('use_backup_code')}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setRequires2FA(false);
                  setTotpCode("");
                  setBackupCode("");
                  setUseBackupCode(false);
                  setRememberDevice(false);
                  setPendingUserId(null);
                  setPassword("");
                }}
              >
                {t('cancel')}
              </Button>
            </form>
          ) : (
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "password" | "magiclink" | "passkey")} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted">
                <TabsTrigger value="password" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <Lock className="h-4 w-4 mr-2" />
                  {t('password_tab')}
                </TabsTrigger>
                <TabsTrigger value="magiclink" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <Sparkles className="h-4 w-4" />
                  {t('magic_tab')}
                </TabsTrigger>
                <TabsTrigger value="passkey" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground" disabled={!passkeySupported}>
                  <Fingerprint className="h-4 w-4" />
                  {t('passkey_tab')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                {isForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">{t('email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder={t('email_placeholder')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={loading}
                    >
                      {loading ? t('sending') : t('send_reset_link')}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setIsForgotPassword(false)}
                    >
                      {t('back_to_signin')}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      {t('reset_link_desc')}
                    </p>
                  </form>
                ) : isResettingPassword ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">{t('new_password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder={t('password_placeholder')}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">{t('confirm_new_password')}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-new-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t('password_placeholder')}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={loading}
                    >
                      {loading ? t('updating') : t('update_password')}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      {t('password_length_desc')}
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('name')}</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder={t('full_name')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="role">{t('i_am_a')}</Label>
                    <Select value={userRole} onValueChange={(value: 'user' | 'trainer' | 'creator') => setUserRole(value)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder={t('select_role')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{t('fitness_enthusiast')}</span>
                            <span className="text-xs text-muted-foreground">{t('fitness_enthusiast_desc')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="trainer">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{t('trainer_coach')}</span>
                            <span className="text-xs text-muted-foreground">{t('trainer_coach_desc')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="creator">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{t('content_creator')}</span>
                            <span className="text-xs text-muted-foreground">{t('content_creator_desc')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('password_placeholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {isLogin && !isForgotPassword && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-sm font-semibold underline text-[#00D4FF] hover:text-[#00E4FF]"
                      >
                        {t('forgot_password_q')}
                      </button>
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t('password_placeholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? t('loading_ellipsis') : isLogin ? t('sign_in_btn') : t('create_account_btn')}
                </Button>
              </form>
                )}
            </TabsContent>

            <TabsContent value="magiclink">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">{t('email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder={t('email_placeholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? t('sending') : t('send_magic_link')}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {t('magic_link_desc')}
                </p>
              </form>
            </TabsContent>

            <TabsContent value="passkey">
              {isInIframe && (
                <div className="mb-4 p-4 bg-accent/20 border border-accent rounded-lg">
                  <p className="text-sm text-accent font-semibold mb-2">{t('preview_limitation')}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {t('passkey_preview_desc')}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(window.location.href, '_blank')}
                  >
                    {t('open_new_tab')}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {t('passkey_published_desc')}
                  </p>
                </div>
              )}
              
              <form onSubmit={handlePasskey} className="space-y-4">
                {isLogin ? (
                  <div className="text-center py-8">
                    <Fingerprint className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">{t('sign_in_passkey')}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {t('passkey_biometric_desc')}
                    </p>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={loading || !passkeySupported}
                    >
                      {loading ? t('processing') : (
                        <>
                          <Fingerprint className="mr-2 h-4 w-4" />
                          {t('sign_in_with_passkey')}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="passkey-name">{t('name')}</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="passkey-name"
                          type="text"
                          placeholder={t('passkey_name_placeholder')}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passkey-email">{t('email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="passkey-email"
                          type="email"
                          placeholder={t('email_placeholder')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={loading || !passkeySupported}
                    >
                      {loading ? t('processing') : (
                        <>
                          <Fingerprint className="mr-2 h-4 w-4" />
                          {t('register_passkey')}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      {t('passkey_setup_desc')}
                    </p>
                  </>
                )}
              </form>
              </TabsContent>
            </Tabs>
          )}

          <div className="mt-6 text-center">
            {!requires2FA && !isForgotPassword && !isResettingPassword && (
              <Button
                variant="ghost"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setPassword("");
                  setConfirmPassword("");
                  setIsForgotPassword(false);
                }}
                className="text-sm"
              >
                {isLogin ? t('dont_have_account_q') : t('already_have_account_q')}
                <span className="font-semibold text-primary ml-1">
                  {isLogin ? t('sign_up_link') : t('sign_in_link')}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
