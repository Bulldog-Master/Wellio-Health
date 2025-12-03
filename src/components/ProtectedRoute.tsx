import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, 'session:', !!session);
      if (!mounted) return;
      
      setSession(session);
      // Only redirect on explicit sign out, not on other events
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to auth');
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      if (!session) {
        navigate("/auth");
        setLoading(false);
        return;
      }

      try {
        // Check onboarding status
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();

        // Check if 2FA is enabled
        const { data: authSecret } = await supabase
          .from("auth_secrets")
          .select("two_factor_enabled")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!mounted) return;

        // Check if 2FA is enabled and not yet verified in this session
        const twoFactorVerified = sessionStorage.getItem(`2fa_verified_${session.user.id}`);
        if (authSecret?.two_factor_enabled && !twoFactorVerified) {
          setNeeds2FA(true);
          setLoading(false);
          return;
        }

        // Check if onboarding is completed (skip check for onboarding page itself)
        if (location.pathname !== "/onboarding") {
          if (profile && !profile.onboarding_completed) {
            navigate("/onboarding");
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const handleVerify2FA = async () => {
    if (!totpToken || totpToken.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('totp-login-verify', {
        body: { token: totpToken }
      });
      
      if (error) throw error;
      
      if (data?.verified) {
        // Store verification in session storage
        if (session?.user.id) {
          sessionStorage.setItem(`2fa_verified_${session.user.id}`, 'true');
        }
        setNeeds2FA(false);
        toast.success("2FA verified successfully");
      } else {
        toast.error("Invalid code. Please try again.");
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error("Failed to verify 2FA code. Please try again.");
    } finally {
      setVerifying(false);
      setTotpToken("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (session?.user.id) {
      sessionStorage.removeItem(`2fa_verified_${session.user.id}`);
    }
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (needs2FA) {
    return (
      <Dialog open={needs2FA} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication Required</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app to continue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totp-verify">Verification Code</Label>
              <Input
                id="totp-verify"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && totpToken.length === 6) {
                    handleVerify2FA();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleVerify2FA} 
                disabled={totpToken.length !== 6 || verifying}
                className="flex-1"
              >
                {verifying ? "Verifying..." : "Verify"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return session ? <>{children}</> : null;
};

export default ProtectedRoute;
