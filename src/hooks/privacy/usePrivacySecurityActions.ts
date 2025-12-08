import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { registerPasskey } from "@/lib/webauthn";
import { useNavigate } from "react-router-dom";

interface PrivacySecurityActions {
  userEmail: string;
  setUserEmail: (email: string) => void;
  setPasskeys: (passkeys: any[]) => void;
  setIs2FAEnabled: (enabled: boolean) => void;
  setShow2FASetup: (show: boolean) => void;
  setQrCodeUrl: (url: string) => void;
  setTotpToken: (token: string) => void;
  setBackupCodes: (codes: string[]) => void;
  setShowBackupCodes: (show: boolean) => void;
  setIsPrivate: (value: boolean) => void;
  setAllowMentions: (value: boolean) => void;
  setShowActivity: (value: boolean) => void;
  setShowHealthMetrics: (value: boolean) => void;
  setShowPasswordDialog: (show: boolean) => void;
  setIsChangingPassword: (changing: boolean) => void;
  setShowEmailDialog: (show: boolean) => void;
  setIsChangingEmail: (changing: boolean) => void;
  setRenamingPasskey: (passkey: { id: string; currentName: string } | null) => void;
  setNewPasskeyName: (name: string) => void;
  setShowDeleteDialog: (show: boolean) => void;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  newEmail: string;
  emailPassword: string;
  totpToken: string;
  renamingPasskey: { id: string; currentName: string } | null;
  newPasskeyName: string;
  resetPasswordForm: () => void;
  resetEmailForm: () => void;
  t: (key: string) => string;
}

export const usePrivacySecurityActions = (props: PrivacySecurityActions) => {
  const navigate = useNavigate();
  const {
    userEmail,
    setUserEmail,
    setPasskeys,
    setIs2FAEnabled,
    setShow2FASetup,
    setQrCodeUrl,
    setTotpToken,
    setBackupCodes,
    setShowBackupCodes,
    setIsPrivate,
    setAllowMentions,
    setShowActivity,
    setShowHealthMetrics,
    setShowPasswordDialog,
    setIsChangingPassword,
    setShowEmailDialog,
    setIsChangingEmail,
    setRenamingPasskey,
    setNewPasskeyName,
    setShowDeleteDialog,
    currentPassword,
    newPassword,
    confirmNewPassword,
    newEmail,
    emailPassword,
    totpToken,
    renamingPasskey,
    newPasskeyName,
    resetPasswordForm,
    resetEmailForm,
    t,
  } = props;

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
        .maybeSingle();
      
      if (authSecret) {
        setIs2FAEnabled(authSecret.two_factor_enabled || false);
      }

      // Fetch privacy settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_private, allow_mentions, show_activity, show_health_metrics_to_followers')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile) {
        setIsPrivate(profile.is_private || false);
        setAllowMentions(profile.allow_mentions !== false);
        setShowActivity(profile.show_activity !== false);
        setShowHealthMetrics(profile.show_health_metrics_to_followers || false);
      }
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
        setQrCodeUrl(data.qrCodeUrl);
        setShow2FASetup(true);
      } else {
        throw new Error('No QR code URL received');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
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

  const handleCancelSetup = () => {
    setShow2FASetup(false);
    setTotpToken("");
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
      console.error("Error renaming passkey:", error);
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

  const handlePrivateChange = async (value: boolean) => {
    setIsPrivate(value);
    await updatePrivacySettings('is_private', value);
  };

  const handleMentionsChange = async (value: boolean) => {
    setAllowMentions(value);
    await updatePrivacySettings('allow_mentions', value);
  };

  const handleActivityChange = async (value: boolean) => {
    setShowActivity(value);
    await updatePrivacySettings('show_activity', value);
  };

  const handleHealthMetricsChange = async (value: boolean) => {
    setShowHealthMetrics(value);
    await updatePrivacySettings('show_health_metrics_to_followers', value);
  };

  const handleChangePassword = async () => {
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        setIsChangingPassword(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success("Password updated successfully!");
      setShowPasswordDialog(false);
      resetPasswordForm();
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !emailPassword) {
      toast.error("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsChangingEmail(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: emailPassword,
      });

      if (signInError) {
        toast.error("Password is incorrect");
        setIsChangingEmail(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) throw updateError;

      toast.success("Please check your new email for a confirmation link");
      setShowEmailDialog(false);
      resetEmailForm();
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
        return;
      }

      const exportData: Record<string, any> = {};
      
      // Fetch data from each table individually
      const { data: profiles } = await supabase.from('profiles').select('*').eq('id', user.id);
      const { data: activityLogs } = await supabase.from('activity_logs').select('*').eq('user_id', user.id);
      const { data: nutritionLogs } = await supabase.from('nutrition_logs').select('*').eq('user_id', user.id);
      const { data: weightLogs } = await supabase.from('weight_logs').select('*').eq('user_id', user.id);
      
      exportData.profiles = profiles;
      exportData.activity_logs = activityLogs;
      exportData.nutrition_logs = nutritionLogs;
      exportData.weight_logs = weightLogs;

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wellio-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
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

  return {
    fetchUserData,
    fetchPasskeys,
    handleRegisterPasskey,
    handleSetup2FA,
    handleVerify2FA,
    handleDisable2FA,
    handleCancelSetup,
    handleDeletePasskey,
    handleRenamePasskey,
    handlePrivateChange,
    handleMentionsChange,
    handleActivityChange,
    handleHealthMetricsChange,
    handleChangePassword,
    handleChangeEmail,
    handleExportData,
    handleDeleteAccount,
  };
};
