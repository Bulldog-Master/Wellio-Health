import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, Mail, Lock, User as UserIcon, Sparkles, Fingerprint, Eye, EyeOff, Shield, Key, HeartPulse, Zap } from "lucide-react";
import authHero from "@/assets/auth-hero-new.jpg";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isWebAuthnSupported, registerPasskey, authenticatePasskey } from "@/lib/webauthn";
import { generateDeviceFingerprint, getDeviceName, getStoredFingerprint, storeFingerprint } from "@/lib/deviceFingerprint";
import { Checkbox } from "@/components/ui/checkbox";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
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
        title: "Reset Your Password",
        description: "Please enter your new password below.",
      });
    }
    
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      sessionStorage.setItem('referral_code', refCode);
      toast({
        title: "Welcome!",
        description: "You've been referred by a friend. Sign up to get started!",
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
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
        throw new Error("Name is required");
      }
      if (!isLogin && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Validation Error",
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

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

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
                title: "Welcome back!",
                description: "You've successfully signed in from a trusted device.",
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
              title: "2FA Required",
              description: "Please enter your 6-digit authentication code.",
            });
            setLoading(false);
            return;
          }
        }

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
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
        
        // Clear referral code from session
        sessionStorage.removeItem('referral_code');

        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
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
          title: "Invalid Backup Code",
          description: "Please enter a backup code.",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (totpCode.length !== 6) {
        toast({
          title: "Invalid Code",
          description: "Please enter a 6-digit code.",
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
          ? 'Invalid backup code. Please try again.' 
          : 'Invalid authentication code. Please try again.'
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
          title: "Welcome back!",
          description: `Backup code verified. You have ${data.remainingCodes} backup codes remaining.`,
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Two-factor authentication successful.",
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
        title: "Verification Failed",
        description: error.message || "Invalid authentication code.",
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
          title: "Validation Error",
          description: error.issues[0].message,
          variant: "destructive",
        });
      }
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
        title: "Reset Link Sent!",
        description: "Check your email for the password reset link.",
      });
      
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
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
        throw new Error("Passwords do not match");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.issues[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Validation Error",
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
        title: "Password Updated!",
        description: "Your password has been successfully reset.",
      });
      
      // Clear the hash and redirect
      window.history.replaceState({}, document.title, "/auth");
      setIsResettingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setIsLogin(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
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
          title: "Validation Error",
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
        title: "Magic link sent!",
        description: "Check your email for the login link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
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
        title: "Open in new tab",
        description: "Passkey authentication doesn't work in preview mode. Click the 'Open in New Tab' button below.",
        variant: "destructive",
      });
      return;
    }

    if (!passkeySupported) {
      toast({
        title: "Not supported",
        description: "Passkey authentication is not supported on this device.",
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
            throw new Error('Authentication failed - no action link returned');
          }

          // Navigate to the action link which will automatically sign the user in
          console.log('[Passkey] Redirecting to action link...');
          window.location.href = data.actionLink;
        } catch (authError: any) {
          console.log('[Passkey] Authentication failed:', authError);
          
          if (authError.name === 'NotAllowedError') {
            toast({
              title: "Authentication cancelled",
              description: "Please approve the biometric prompt to sign in with passkey.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "No passkey found",
              description: "No passkey registered for this account. Please click 'Don't have an account? Register passkey' below to create one.",
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
              title: "Validation Error",
              description: error.issues[0].message,
              variant: "destructive",
            });
          }
          throw error;
        }

        if (!name) {
          throw new Error('Please enter your name');
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
              title: "Account Already Exists",
              description: "This email is already registered. Please sign in with Password or Magic Link, then add a passkey from your Profile settings.",
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
          throw new Error('Failed to create account');
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
          title: "Success!",
          description: "Your account has been created with passkey authentication.",
        });
      }
    } catch (error: any) {
      console.error('[Passkey] Error:', error);
      
      // Don't show error toast if we already showed a specific one
      if (error.name !== 'NotAllowedError' && !error.message?.includes('already registered')) {
        let errorMessage = error.message || "Passkey authentication failed.";
        
        toast({
          title: "Passkey Error",
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
          alt="Fitness inspiration" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/70 to-accent/60" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-2 mb-3 md:mb-4 animate-float">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-glow" />
              <span className="text-xs md:text-sm font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                Your Journey
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-2 md:mb-3 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] tracking-tight">
              Wellio
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <HeartPulse className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-glow" />
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">
              Welcome back!
            </h2>
          </div>
          <p className="text-base md:text-lg text-white/95 max-w-md drop-shadow-md">
            Your fitness stats are looking great today. Keep pushing forward!
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Wellio</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {requires2FA 
                ? "Verify Your Identity"
                : isResettingPassword
                  ? "Reset Your Password"
                  : isLogin 
                    ? "Welcome back" 
                    : "Get started today"
              }
            </h2>
            <p className="text-muted-foreground">
              {requires2FA 
                ? "Enter your authentication code to continue"
                : isResettingPassword
                  ? "Enter your new password below"
                  : isLogin 
                    ? "Sign in to continue your fitness journey" 
                    : "Create your account and start achieving your goals"
              }
            </p>
          </div>

          {requires2FA ? (
            <form onSubmit={handleVerify2FA} className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                {useBackupCode ? <Key className="w-10 h-10 text-primary" /> : <Shield className="w-10 h-10 text-primary" />}
              </div>

              {useBackupCode ? (
                <div className="space-y-2">
                  <Label htmlFor="backup">Backup Code</Label>
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
                  <Label htmlFor="totp">Authentication Code</Label>
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
                  Remember this device for 30 days
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading || (!useBackupCode && totpCode.length !== 6) || (useBackupCode && !backupCode.trim())}
              >
                {loading ? "Verifying..." : "Verify and Continue"}
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
                {useBackupCode ? "Use Authenticator App" : "Use Backup Code"}
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
                Cancel
              </Button>
            </form>
          ) : (
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "password" | "magiclink" | "passkey")} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted">
                <TabsTrigger value="password" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <Lock className="h-4 w-4 mr-2" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="magiclink" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <Sparkles className="h-4 w-4" />
                  Magic
                </TabsTrigger>
                <TabsTrigger value="passkey" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground" disabled={!passkeySupported}>
                  <Fingerprint className="h-4 w-4" />
                  Passkey
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                {isForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="you@example.com"
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
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setIsForgotPassword(false)}
                    >
                      Back to Sign In
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      We'll send a secure password reset link to your email address.
                    </p>
                  </form>
                ) : isResettingPassword ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="••••••••"
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
                      <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-new-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
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
                      {loading ? "Updating..." : "Update Password"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Password must be at least 6 characters long.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
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
                    <Label htmlFor="role">I am a...</Label>
                    <Select value={userRole} onValueChange={(value: 'user' | 'trainer' | 'creator') => setUserRole(value)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Fitness Enthusiast</span>
                            <span className="text-xs text-muted-foreground">Track my own health & fitness journey</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="trainer">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Trainer / Coach</span>
                            <span className="text-xs text-muted-foreground">Offer programs & train clients</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="creator">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Content Creator / KOL</span>
                            <span className="text-xs text-muted-foreground">Share content & build community</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
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
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
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
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
                </Button>
              </form>
                )}
            </TabsContent>

            <TabsContent value="magiclink">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="you@example.com"
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
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send a one-time login link to your email. Click it to sign in instantly without a password.
                </p>
              </form>
            </TabsContent>

            <TabsContent value="passkey">
              {isInIframe && (
                <div className="mb-4 p-4 bg-accent/20 border border-accent rounded-lg">
                  <p className="text-sm text-accent font-semibold mb-2">Preview Mode Limitation</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Passkey authentication doesn't work in the Lovable preview due to iframe security restrictions.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(window.location.href, '_blank')}
                  >
                    Open in New Tab to Test
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Passkeys will work normally when your app is published.
                  </p>
                </div>
              )}
              
              <form onSubmit={handlePasskey} className="space-y-4">
                {isLogin ? (
                  <div className="text-center py-8">
                    <Fingerprint className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Sign In with Passkey</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Click the button below to sign in using your device's biometric authentication
                    </p>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={loading || !passkeySupported}
                    >
                      {loading ? "Processing..." : (
                        <>
                          <Fingerprint className="mr-2 h-4 w-4" />
                          Sign In with Passkey
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="passkey-name">Name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="passkey-name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passkey-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="passkey-email"
                          type="email"
                          placeholder="you@example.com"
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
                      {loading ? "Processing..." : (
                        <>
                          <Fingerprint className="mr-2 h-4 w-4" />
                          Register Passkey
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Set up biometric authentication for quick and secure access to your account.
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
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-semibold text-primary ml-1">
                  {isLogin ? "Sign up" : "Sign in"}
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
