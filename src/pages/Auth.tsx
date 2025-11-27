import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, Mail, Lock, User as UserIcon, Sparkles, Fingerprint, Eye, EyeOff, Shield } from "lucide-react";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isWebAuthnSupported, registerPasskey, authenticatePasskey } from "@/lib/webauthn";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"password" | "magiclink" | "passkey">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    setPasskeySupported(isWebAuthnSupported());
    setIsInIframe(window.self !== window.top);
  }, []);

  useEffect(() => {
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
  }, [navigate]);

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
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              name: name,
            },
          },
        });

        if (error) throw error;

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
    
    if (totpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Re-authenticate with password to get a valid session
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verify TOTP code
      const { data, error } = await supabase.functions.invoke('totp-verify', {
        body: { token: totpCode }
      });

      if (error || !data?.verified) {
        // Sign out if verification fails
        await supabase.auth.signOut();
        throw new Error('Invalid authentication code. Please try again.');
      }

      toast({
        title: "Welcome back!",
        description: "Two-factor authentication successful.",
      });

      // Reset 2FA state
      setRequires2FA(false);
      setTotpCode("");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      
      <Card className="w-full max-w-md p-8 shadow-glow backdrop-blur-sm bg-card/95 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4 shadow-glow">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-1">
            Wellio
          </h1>
          <p className="text-sm text-muted-foreground/80 mb-3">
            Welcome to your Health and Wellness APP
          </p>
          <p className="text-muted-foreground">
            {requires2FA 
              ? "Enter your authentication code"
              : isLogin 
                ? "Welcome back! Sign in to continue" 
                : "Create your account to get started"
            }
          </p>
        </div>

        {requires2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="text-center mb-4">
              <Shield className="w-12 h-12 mx-auto mb-2 text-primary" />
              <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

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

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
              disabled={loading || totpCode.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setRequires2FA(false);
                setTotpCode("");
                setPendingUserId(null);
                setPassword("");
              }}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "password" | "magiclink" | "passkey")} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magiclink" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Magic Link
              </TabsTrigger>
              <TabsTrigger value="passkey" className="gap-2" disabled={!passkeySupported}>
                <Fingerprint className="h-4 w-4" />
                Passkey
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
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
                  className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
                  disabled={loading}
                >
                  {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
                </Button>
              </form>
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
                  className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
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
                      className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
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
                      className="w-full bg-gradient-primary hover:opacity-90 shadow-glow"
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

        {!requires2FA && authMethod === "password" && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        )}

        {!requires2FA && authMethod === "passkey" && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Don't have an account? Register passkey"
                : "Already have an account? Sign in"}
            </button>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
