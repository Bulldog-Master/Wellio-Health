import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { isWebAuthnSupported, registerPasskey } from "@/lib/webauthn";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { usePrivacySecurityState } from "@/hooks/privacy";
import {
  TwoFactorCard,
  PasskeyCard,
  PrivacySettingsCard,
  AccountSecurityCard,
  DataManagementCard,
  DeleteAccountDialog,
  RenamePasskeyDialog,
  BackupCodesDialog,
  ChangeEmailDialog,
  ChangePasswordDialog,
} from "@/components/privacy";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('privacy');
  const state = usePrivacySecurityState();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        state.setUserEmail(user.email || "");
        await fetchPasskeys();
        
        const { data: authSecret } = await supabase
          .from('auth_secrets')
          .select('two_factor_enabled')
          .eq('user_id', user.id)
          .single();
        
        if (authSecret) {
          state.setIs2FAEnabled(authSecret.two_factor_enabled || false);
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_private, allow_mentions, show_activity, show_health_metrics_to_followers')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          state.setIsPrivate(profile.is_private || false);
          state.setAllowMentions(profile.allow_mentions !== false);
          state.setShowActivity(profile.show_activity !== false);
          state.setShowHealthMetrics(profile.show_health_metrics_to_followers || false);
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
      state.setPasskeys(data || []);
    } catch (error) {
      console.error("Error fetching passkeys:", error);
    }
  };

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

  const handleSetup2FA = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error("You must be logged in to set up 2FA");
        return;
      }

      const { data, error } = await supabase.functions.invoke('totp-setup');
      
      if (error) throw error;
      
      if (data?.qrCodeUrl) {
        state.setQrCodeUrl(data.qrCodeUrl);
        state.setShow2FASetup(true);
      } else {
        throw new Error('No QR code URL received');
      }
    } catch (error) {
      console.error('[2FA Setup] Error setting up 2FA:', error);
      toast.error(`Failed to set up 2FA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleVerify2FA = async () => {
    if (!state.totpToken || state.totpToken.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('totp-verify', {
        body: { token: state.totpToken }
      });
      
      if (error) throw error;
      
      if (data.verified) {
        state.setIs2FAEnabled(true);
        state.setShow2FASetup(false);
        state.setTotpToken("");
        
        if (data.backupCodes && data.backupCodes.length > 0) {
          state.setBackupCodes(data.backupCodes);
          state.setShowBackupCodes(true);
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
      state.setIs2FAEnabled(false);
      toast.success("2FA has been disabled");
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error("Failed to disable 2FA. Please try again.");
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

  const handleRenamePasskey = async () => {
    if (!state.renamingPasskey || !state.newPasskeyName.trim()) return;

    try {
      const { error } = await supabase
        .from('webauthn_credentials')
        .update({ device_type: state.newPasskeyName.trim() })
        .eq('id', state.renamingPasskey.id);

      if (error) throw error;

      toast.success(t('toast_passkey_renamed'));
      state.setRenamingPasskey(null);
      state.setNewPasskeyName("");
      fetchPasskeys();
    } catch (error) {
      console.error('Error renaming passkey:', error);
      toast.error("Failed to rename passkey");
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

  const handleChangePassword = async () => {
    if (!state.currentPassword || !state.newPassword || !state.confirmNewPassword) {
      toast.error("All fields are required");
      return;
    }

    if (state.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (state.newPassword !== state.confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    state.setIsChangingPassword(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: state.userEmail,
        password: state.currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        state.setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: state.newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Password updated successfully!");
      state.setShowPasswordDialog(false);
      state.resetPasswordForm();
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      state.setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!state.newEmail || !state.emailPassword) {
      toast.error("All fields are required");
      return;
    }

    if (!state.newEmail.includes("@") || !state.newEmail.includes(".")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (state.newEmail === state.userEmail) {
      toast.error("New email must be different from current email");
      return;
    }

    state.setIsChangingEmail(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: state.userEmail,
        password: state.emailPassword,
      });

      if (signInError) {
        toast.error("Password is incorrect");
        state.setIsChangingEmail(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        email: state.newEmail,
      });

      if (updateError) throw updateError;

      toast.success(t('verification_sent'));
      state.setShowEmailDialog(false);
      state.resetEmailForm();
    } catch (error: any) {
      console.error("Error changing email:", error);
      toast.error(error.message || "Failed to change email");
    } finally {
      state.setIsChangingEmail(false);
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
      state.setShowDeleteDialog(false);
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

      <TwoFactorCard
        is2FAEnabled={state.is2FAEnabled}
        show2FASetup={state.show2FASetup}
        qrCodeUrl={state.qrCodeUrl}
        totpToken={state.totpToken}
        onSetup2FA={handleSetup2FA}
        onDisable2FA={handleDisable2FA}
        onVerify2FA={handleVerify2FA}
        onTotpTokenChange={state.setTotpToken}
        onCancelSetup={() => {
          state.setShow2FASetup(false);
          state.setTotpToken("");
        }}
      />

      <PasskeyCard
        passkeys={state.passkeys}
        onRegisterPasskey={handleRegisterPasskey}
        onDeletePasskey={handleDeletePasskey}
        onRenamePasskey={(passkey) => {
          state.setRenamingPasskey({ id: passkey.id, currentName: passkey.currentName });
          state.setNewPasskeyName(passkey.currentName);
        }}
      />

      <AccountSecurityCard
        userEmail={state.userEmail}
        onChangeEmail={() => state.setShowEmailDialog(true)}
        onChangePassword={() => state.setShowPasswordDialog(true)}
      />

      <PrivacySettingsCard
        isPrivate={state.isPrivate}
        allowMentions={state.allowMentions}
        showActivity={state.showActivity}
        showHealthMetrics={state.showHealthMetrics}
        onPrivateChange={(checked) => {
          state.setIsPrivate(checked);
          updatePrivacySettings('is_private', checked);
        }}
        onMentionsChange={(checked) => {
          state.setAllowMentions(checked);
          updatePrivacySettings('allow_mentions', checked);
        }}
        onActivityChange={(checked) => {
          state.setShowActivity(checked);
          updatePrivacySettings('show_activity', checked);
        }}
        onHealthMetricsChange={(checked) => {
          state.setShowHealthMetrics(checked);
          updatePrivacySettings('show_health_metrics_to_followers', checked);
        }}
      />

      <DataManagementCard
        onExportData={handleExportData}
        onDeleteAccount={() => state.setShowDeleteDialog(true)}
      />

      <DeleteAccountDialog
        open={state.showDeleteDialog}
        onOpenChange={state.setShowDeleteDialog}
        onConfirm={handleDeleteAccount}
      />

      <RenamePasskeyDialog
        open={!!state.renamingPasskey}
        onOpenChange={(open) => !open && state.setRenamingPasskey(null)}
        newName={state.newPasskeyName}
        onNameChange={state.setNewPasskeyName}
        onConfirm={handleRenamePasskey}
      />

      <BackupCodesDialog
        open={state.showBackupCodes}
        onOpenChange={state.setShowBackupCodes}
        backupCodes={state.backupCodes}
      />

      <ChangeEmailDialog
        open={state.showEmailDialog}
        onOpenChange={state.setShowEmailDialog}
        newEmail={state.newEmail}
        emailPassword={state.emailPassword}
        showPassword={state.showEmailPassword}
        isChanging={state.isChangingEmail}
        onEmailChange={state.setNewEmail}
        onPasswordChange={state.setEmailPassword}
        onTogglePassword={() => state.setShowEmailPassword(!state.showEmailPassword)}
        onSubmit={handleChangeEmail}
        onCancel={() => {
          state.setShowEmailDialog(false);
          state.resetEmailForm();
        }}
      />

      <ChangePasswordDialog
        open={state.showPasswordDialog}
        onOpenChange={state.setShowPasswordDialog}
        currentPassword={state.currentPassword}
        newPassword={state.newPassword}
        confirmPassword={state.confirmNewPassword}
        showCurrentPassword={state.showCurrentPassword}
        showNewPassword={state.showNewPassword}
        showConfirmPassword={state.showConfirmPassword}
        isChanging={state.isChangingPassword}
        onCurrentPasswordChange={state.setCurrentPassword}
        onNewPasswordChange={state.setNewPassword}
        onConfirmPasswordChange={state.setConfirmNewPassword}
        onToggleCurrentPassword={() => state.setShowCurrentPassword(!state.showCurrentPassword)}
        onToggleNewPassword={() => state.setShowNewPassword(!state.showNewPassword)}
        onToggleConfirmPassword={() => state.setShowConfirmPassword(!state.showConfirmPassword)}
        onSubmit={handleChangePassword}
        onCancel={() => {
          state.setShowPasswordDialog(false);
          state.resetPasswordForm();
        }}
      />
    </div>
  );
};

export default PrivacySecurity;
