import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Shield, Key, Download, Trash2, ArrowLeft, Smartphone } from "lucide-react";
import { isWebAuthnSupported, registerPasskey } from "@/lib/webauthn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [totpToken, setTotpToken] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        await fetchPasskeys();
        
        // Check if 2FA is enabled
        const { data: profile } = await supabase
          .from('profiles')
          .select('two_factor_enabled')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setIs2FAEnabled(profile.two_factor_enabled || false);
        }
      }
    };
    fetchUserData();
  }, []);

  const fetchPasskeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("webauthn_credentials")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setPasskeys(data || []);
    } catch (error) {
      console.error("Error fetching passkeys:", error);
    }
  };

  const handleSetup2FA = async () => {
    try {
      console.log('[2FA Setup] Starting 2FA setup...');
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[2FA Setup] Session check:', session ? 'Authenticated' : 'Not authenticated');
      
      if (!session?.access_token) {
        toast.error("You must be logged in to set up 2FA");
        return;
      }

      console.log('[2FA Setup] Calling totp-setup function...');
      const { data, error } = await supabase.functions.invoke('totp-setup');
      
      console.log('[2FA Setup] Response:', { data, error });
      
      if (error) {
        console.error('[2FA Setup] Error from function:', error);
        throw error;
      }
      
      if (data?.qrCodeUrl) {
        console.log('[2FA Setup] QR code URL received, opening setup dialog');
        setQrCodeUrl(data.qrCodeUrl);
        setShow2FASetup(true);
      } else {
        console.error('[2FA Setup] No QR code URL in response:', data);
        throw new Error('No QR code URL received');
      }
    } catch (error) {
      console.error('[2FA Setup] Error setting up 2FA:', error);
      toast.error(`Failed to set up 2FA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleVerify2FA = async () => {
    if (!totpToken || totpToken.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('totp-verify', {
        body: { token: totpToken }
      });
      
      if (error) throw error;
      
      if (data.verified) {
        setIs2FAEnabled(true);
        setShow2FASetup(false);
        setTotpToken("");
        toast.success("2FA has been enabled successfully");
      } else {
        toast.error("Invalid code. Please try again.");
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast.error("Failed to verify 2FA code. Please try again.");
    }
  };

  const handleDisable2FA = async () => {
    try {
      const { error } = await supabase.functions.invoke('totp-disable');
      
      if (error) throw error;
      
      setIs2FAEnabled(false);
      toast.success("2FA has been disabled");
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error("Failed to disable 2FA. Please try again.");
    }
  };

  const handleAddPasskey = async () => {
    try {
      if (!isWebAuthnSupported()) {
        toast.error("Your browser doesn't support passkeys");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      toast.info("Follow the prompts to add your passkey...");
      const credential = await registerPasskey(user.email);
      
      const { data, error } = await supabase.functions.invoke('passkey-register', {
        body: {
          ...credential,
          userId: user.id
        }
      });

      if (error) throw error;

      toast.success("Passkey added successfully!");
      fetchPasskeys();
    } catch (error: any) {
      console.error("Error registering passkey:", error);
      toast.error(error.message || "Failed to register passkey");
    }
  };

  const handleChangePassword = async () => {
    if (!userEmail) {
      toast.error("Please log in first");
      navigate("/auth");
      return;
    }
    
    try {
      toast.info("Sending password reset email...");
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast.error(error.message || "Failed to send password reset email");
    }
  };

  const handleDeletePasskey = async (id: string) => {
    try {
      const { error } = await supabase
        .from("webauthn_credentials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Passkey removed");
      fetchPasskeys();
    } catch (error: any) {
      console.error("Error deleting passkey:", error);
      toast.error("Failed to remove passkey");
    }
  };

  const handleExportData = async () => {
    try {
      toast.info("Exporting your data...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const exportData = {
        profile,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wellio-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error(error.message || "Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toast.error("Account deletion must be requested through support");
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Privacy & Security</h1>
          <p className="text-muted-foreground">Control your privacy settings and security options</p>
        </div>
      </div>

      {/* Two-Factor Authentication (TOTP) */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication (TOTP)</CardTitle>
          <CardDescription>
            Use an authenticator app like Google Authenticator or Authy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>2FA Status</Label>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled ? "2FA is active" : "2FA is not set up"}
              </p>
            </div>
            <Switch
              checked={is2FAEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleSetup2FA();
                } else {
                  handleDisable2FA();
                }
              }}
            />
          </div>

          {show2FASetup && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Scan QR Code</Label>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app
                </p>
                {qrCodeUrl && (
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totp-token">Enter Verification Code</Label>
                <Input
                  id="totp-token"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleVerify2FA} disabled={totpToken.length !== 6}>
                  Verify & Enable
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShow2FASetup(false);
                    setTotpToken("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passkey (WebAuthn) */}
      <Card>
        <CardHeader>
          <CardTitle>Passkey (WebAuthn)</CardTitle>
          <CardDescription>
            Use biometric authentication or security keys for passwordless login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Manage Passkeys</Label>
                <p className="text-sm text-muted-foreground">
                  Add or remove passkeys for your account
                </p>
              </div>
              <Button onClick={handleAddPasskey} size="sm">
                Add Passkey
              </Button>
            </div>
          </div>

          {passkeys.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              {passkeys.map((passkey) => (
                <div key={passkey.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{passkey.device_type || "Unknown Device"}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(passkey.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeletePasskey(passkey.id)}
                    variant="ghost"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleChangePassword} variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export My Data
          </Button>

          <Button 
            onClick={() => setShowDeleteDialog(true)} 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PrivacySecurity;