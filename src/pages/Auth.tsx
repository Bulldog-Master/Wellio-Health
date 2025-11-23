import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, Mail, Lock, User as UserIcon, Sparkles, Fingerprint } from "lucide-react";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isWebAuthnSupported, registerPasskey, authenticatePasskey } from "@/lib/webauthn";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"password" | "magiclink" | "passkey">("password");
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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

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
      if (isLogin) {
        // Authenticate with passkey
        const authData = await authenticatePasskey(email);
        
        const { data, error } = await supabase.functions.invoke('passkey-authenticate', {
          body: {
            credentialId: authData.credentialId,
            email: email,
          }
        });

        if (error) throw error;
        if (!data?.success) throw new Error('Authentication failed');

        // The user is authenticated, redirect will happen via auth state change
        toast({
          title: "Welcome back!",
          description: "Authenticated with passkey successfully.",
        });
      } else {
        // Register new passkey
        // First create the account with password auth
        const tempPassword = crypto.randomUUID();
        const redirectUrl = `${window.location.origin}/`;
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: tempPassword,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              name: name,
            },
          },
        });

        if (signUpError) throw signUpError;

        // Wait for auth to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now register the passkey
        const passkeyData = await registerPasskey(email);
        
        const { error: registerError } = await supabase.functions.invoke('passkey-register', {
          body: {
            credentialId: passkeyData.credentialId,
            publicKey: passkeyData.publicKey,
            counter: passkeyData.counter,
            deviceType: 'platform',
          }
        });

        if (registerError) throw registerError;

        toast({
          title: "Passkey registered!",
          description: "You can now sign in with your biometric authentication.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Passkey error:', error);
      toast({
        title: "Error",
        description: error.message || "Passkey authentication failed. Please try again.",
        variant: "destructive",
      });
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
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-2">
            Wellio
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome back! Sign in to continue" : "Create your account to get started"}
          </p>
        </div>

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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              {!isLogin && (
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
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

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
                    {isLogin ? "Sign In with Passkey" : "Register Passkey"}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {isLogin 
                  ? "Use your device's biometric authentication (Face ID, Touch ID, or fingerprint) to sign in securely."
                  : "Set up biometric authentication for quick and secure access to your account."
                }
              </p>
            </form>
          </TabsContent>

        </Tabs>

        {authMethod === "password" && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        )}

        {authMethod === "passkey" && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
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
