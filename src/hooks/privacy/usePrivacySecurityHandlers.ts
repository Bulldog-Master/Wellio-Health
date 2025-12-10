import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registerPasskey } from "@/lib/auth";
import { usePrivacySecurityState } from "./usePrivacySecurityState";

export const usePrivacySecurityHandlers = (state: ReturnType<typeof usePrivacySecurityState>) => {
  const navigate = useNavigate();
  const { t } = useTranslation('privacy');

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

  return {
    fetchPasskeys,
    handleRegisterPasskey,
    handleSetup2FA,
    handleVerify2FA,
    handleDisable2FA,
    handleDeletePasskey,
    handleRenamePasskey,
    updatePrivacySettings,
    handleChangePassword,
    handleChangeEmail,
    handleExportData,
    handleDeleteAccount,
  };
};
