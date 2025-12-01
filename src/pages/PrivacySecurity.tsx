import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Shield, Key, Download, Trash2, ArrowLeft, Smartphone, Pencil, Lock, Eye, UserCheck, EyeOff, Mail } from "lucide-react";
import { isWebAuthnSupported, registerPasskey } from "@/lib/webauthn";
import { useTranslation } from "react-i18next";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('privacy');
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [renamingPasskey, setRenamingPasskey] = useState<{ id: string; currentName: string } | null>(null);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowMentions, setAllowMentions] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        await fetchPasskeys();
        
        // Check if 2FA is enabled
        const { data: authSecret } = await supabase
          .from('auth_secrets')
          .select('two_factor_enabled')
          .eq('user_id', user.id)
          .single();
        
        if (authSecret) {
          setIs2FAEnabled(authSecret.two_factor_enabled || false);
        }

        // Fetch privacy settings
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_private, allow_mentions, show_activity')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setIsPrivate(profile.is_private || false);
          setAllowMentions(profile.allow_mentions !== false);
          setShowActivity(profile.show_activity !== false);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleRegisterPasskey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        toast.error("User email not found");
        return;
      }

      await registerPasskey(user.email);
      toast.success(t('toast_passkey_registered'));
      await fetchPasskeys();
    } catch (error: any) {
      console.error("Error registering passkey:", error);
      toast.error(error.message || "Failed to register passkey");
    }
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
        
        // Show backup codes if generated
        if (data.backupCodes && data.backupCodes.length > 0) {
          setBackupCodes(data.backupCodes);
          setShowBackupCodes(true);
        }
        
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
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      // First, verify the current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        setIsChangingPassword(false);
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Password updated successfully!");
      
      // Reset form and close dialog
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    try {
      const { error } = await supabase
        .from("webauthn_credentials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success(t('toast_passkey_removed'));
      fetchPasskeys();
    } catch (error: any) {
      console.error("Error deleting passkey:", error);
      toast.error("Failed to remove passkey");
    }
  };

  const updatePrivacySettings = async (setting: string, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ [setting]: value })
        .eq('id', user.id);

      if (error) throw error;
      toast.success(t('toast_privacy_updated'));
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const handleRenamePasskey = async () => {
    if (!renamingPasskey || !newPasskeyName.trim()) return;

    try {
      const { error } = await supabase
        .from('webauthn_credentials')
        .update({ device_type: newPasskeyName.trim() })
        .eq('id', renamingPasskey.id);

      if (error) throw error;

      toast.success(t('toast_passkey_renamed'));
      setRenamingPasskey(null);
      setNewPasskeyName("");
      fetchPasskeys();
    } catch (error) {
      console.error('Error renaming passkey:', error);
      toast.error("Failed to rename passkey");
    }
  };

  const handleChangeEmail = async () => {
    // Validate inputs
    if (!newEmail || !emailPassword) {
      toast.error("All fields are required");
      return;
    }

    if (!newEmail.includes("@") || !newEmail.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (newEmail === userEmail) {
      toast.error("New email must be different from current email");
      return;
    }

    setIsChangingEmail(true);

    try {
      // First, verify the password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: emailPassword,
      });

      if (signInError) {
        toast.error("Password is incorrect");
        setIsChangingEmail(false);
        return;
      }

      // Update the email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) throw updateError;

      toast.success(t('verification_sent'));
      
      // Reset form and close dialog
      setShowEmailDialog(false);
      setNewEmail("");
      setEmailPassword("");
    } catch (error: any) {
      console.error("Error changing email:", error);
      toast.error(error.message || "Failed to change email");
    } finally {
      setIsChangingEmail(false);
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

      toast.success(t('toast_data_exported'));
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error(error.message || "Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toast.error(t('toast_account_deletion'));
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/settings")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('privacy_security')}</h1>
            <p className="text-muted-foreground mt-1">{t('control_settings')}</p>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication (TOTP) */}
      <Card className="hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>{t('two_factor_auth')}</CardTitle>
              <CardDescription>
                {t('two_factor_description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('2fa_status')}</Label>
              <p className="text-sm text-muted-foreground">
                {is2FAEnabled ? t('2fa_enabled') : t('2fa_not_set')}
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
      <Card className="hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/10 rounded-xl">
              <Key className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <CardTitle>{t('passkey_webauthn')}</CardTitle>
              <CardDescription>
                {t('passkey_description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isWebAuthnSupported() && (
            <p className="text-sm text-destructive">
              Your browser doesn't support passkeys. Please use a modern browser like Chrome, Safari, or Edge.
            </p>
          )}

          {isWebAuthnSupported() && (
            <Button onClick={handleRegisterPasskey} variant="outline">
              <Key className="w-4 h-4 mr-2" />
              {t('register_passkey')}
            </Button>
          )}

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
                          {t('active')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('added')} {new Date(passkey.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setRenamingPasskey({ id: passkey.id, currentName: passkey.device_type || "Unknown Device" });
                        setNewPasskeyName(passkey.device_type || "");
                      }}
                      variant="ghost"
                      size="icon"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeletePasskey(passkey.id)}
                      variant="ghost"
                      size="icon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Address */}
      <Card className="hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>{t('email_address')}</CardTitle>
              <CardDescription>{t('email_description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-sm">{t('current_email')}</Label>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button onClick={() => setShowEmailDialog(true)} variant="outline">
            {t('change_email')}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-destructive/10 rounded-xl">
              <Lock className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <CardTitle>{t('password_section')}</CardTitle>
              <CardDescription>{t('password_description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowPasswordDialog(true)} variant="outline">
            {t('change_password')}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>{t('privacy_settings')}</CardTitle>
          </div>
          <CardDescription>{t('private_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                {t('private_account')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('private_description')}
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={(checked) => {
                setIsPrivate(checked);
                updatePrivacySettings('is_private', checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                {t('allow_mentions')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('mentions_description')}
              </p>
            </div>
            <Switch
              checked={allowMentions}
              onCheckedChange={(checked) => {
                setAllowMentions(checked);
                updatePrivacySettings('allow_mentions', checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {t('show_activity')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('activity_description')}
              </p>
            </div>
            <Switch
              checked={showActivity}
              onCheckedChange={(checked) => {
                setShowActivity(checked);
                updatePrivacySettings('show_activity', checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>{t('data_export')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            {t('export_data')}
          </Button>

          <Button 
            onClick={() => setShowDeleteDialog(true)} 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('delete_button')}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
          <AlertDialogTitle>{t('delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_warning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete_button')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Passkey Dialog */}
      <AlertDialog open={!!renamingPasskey} onOpenChange={(open) => !open && setRenamingPasskey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('rename_passkey')}</AlertDialogTitle>
            <AlertDialogDescription>
              Give this passkey a custom name to easily identify it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={newPasskeyName}
              onChange={(e) => setNewPasskeyName(e.target.value)}
              placeholder="e.g., My iPad, Work iPhone"
              onKeyDown={(e) => e.key === 'Enter' && handleRenamePasskey()}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenamePasskey} disabled={!newPasskeyName.trim()}>
              {t('rename')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Backup Codes Dialog */}
      <AlertDialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Save Your Backup Codes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Store these backup codes in a safe place. Each code can only be used once if you lose access to your authenticator app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-2 mb-4 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-background rounded border">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  const blob = new Blob(
                    [backupCodes.join('\n')], 
                    { type: 'text/plain' }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `wellio-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Codes
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  toast.success("Backup codes copied to clipboard");
                }}
                variant="outline"
                className="flex-1"
              >
                Copy All
              </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowBackupCodes(false)}>
              I've Saved My Codes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Change Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('update_email')}</DialogTitle>
            <DialogDescription>
              Enter your new email and password to confirm the change. You'll receive a verification email at your new address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">{t('new_email')}</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-password">{t('password')}</Label>
              <div className="relative">
                <Input
                  id="email-password"
                  type={showEmailPassword ? "text" : "password"}
                  placeholder={t('enter_password')}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPassword(!showEmailPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showEmailPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEmailDialog(false);
                setNewEmail("");
                setEmailPassword("");
              }}
              disabled={isChangingEmail}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleChangeEmail}
              disabled={isChangingEmail || !newEmail || !emailPassword}
            >
              {isChangingEmail ? t('updating') : t('change_email')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('change_password')}</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t('current_password')}</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">{t('new_password')}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">{t('confirm_password')}</Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPasswordDialog(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
              }}
              disabled={isChangingPassword}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword}
            >
              {isChangingPassword ? t('updating') : t('update_password')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivacySecurity;