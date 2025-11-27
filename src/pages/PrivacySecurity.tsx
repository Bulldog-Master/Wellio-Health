import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Shield, Key, Download, Trash2, ArrowLeft } from "lucide-react";
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
  const [email, setEmail] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);

  useEffect(() => {
    fetchPasskeys();
    fetchUserEmail();
  }, []);

  const fetchUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) setEmail(user.email);
  };

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
      setTwoFAEnabled(data && data.length > 0);
      setPasskeyEnabled(data && data.length > 0);
    } catch (error) {
      console.error("Error fetching passkeys:", error);
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
        body: credential
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
    if (!email) {
      toast.error("Please log in first");
      navigate("/auth");
      return;
    }
    
    try {
      toast.info("Sending password reset email...");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
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

      {/* Two-Factor Authentication */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Activate 2FA</h3>
              <p className="text-sm text-muted-foreground">
                Enable two-factor authentication for extra security
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{twoFAEnabled ? "ON" : "OFF"}</span>
            <Switch
              checked={twoFAEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleAddPasskey();
                } else {
                  setTwoFAEnabled(false);
                }
              }}
            />
          </div>
        </div>
          
        {passkeys.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            {passkeys.map((passkey) => (
              <div key={passkey.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium">{passkey.device_type || "Unknown Device"}</p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(passkey.created_at).toLocaleDateString()}
                  </p>
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
      </Card>

      {/* Passkey */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <Key className="w-6 h-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Activate Passkey</h3>
              <p className="text-sm text-muted-foreground">
                Use biometric authentication to sign in
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{passkeyEnabled ? "ON" : "OFF"}</span>
            <Switch
              checked={passkeyEnabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleAddPasskey();
                } else {
                  setPasskeyEnabled(false);
                }
              }}
            />
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Password</h3>
            <p className="text-sm text-muted-foreground">Change your account password</p>
          </div>
          <Button onClick={handleChangePassword} variant="outline">
            Change Password
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Data Management</h3>
        <div className="space-y-3">
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
        </div>
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
