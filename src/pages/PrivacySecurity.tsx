import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePrivacySecurityState, usePrivacySecurityHandlers } from "@/hooks/privacy";
import {
  TwoFactorCard,
  PasskeyCard,
  PrivacySettingsCard,
  AccountSecurityCard,
  DataManagementCard,
  DataAccessPanel,
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
  const handlers = usePrivacySecurityHandlers(state);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        state.setUserEmail(user.email || "");
        await handlers.fetchPasskeys();
        
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
        onSetup2FA={handlers.handleSetup2FA}
        onDisable2FA={handlers.handleDisable2FA}
        onVerify2FA={handlers.handleVerify2FA}
        onTotpTokenChange={state.setTotpToken}
        onCancelSetup={() => {
          state.setShow2FASetup(false);
          state.setTotpToken("");
        }}
      />

      <PasskeyCard
        passkeys={state.passkeys}
        onRegisterPasskey={handlers.handleRegisterPasskey}
        onDeletePasskey={handlers.handleDeletePasskey}
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
          handlers.updatePrivacySettings('is_private', checked);
        }}
        onMentionsChange={(checked) => {
          state.setAllowMentions(checked);
          handlers.updatePrivacySettings('allow_mentions', checked);
        }}
        onActivityChange={(checked) => {
          state.setShowActivity(checked);
          handlers.updatePrivacySettings('show_activity', checked);
        }}
        onHealthMetricsChange={(checked) => {
          state.setShowHealthMetrics(checked);
          handlers.updatePrivacySettings('show_health_metrics_to_followers', checked);
        }}
      />

      <DataAccessPanel />

      <DataManagementCard
        onExportData={handlers.handleExportData}
        onDeleteAccount={() => state.setShowDeleteDialog(true)}
      />

      <DeleteAccountDialog
        open={state.showDeleteDialog}
        onOpenChange={state.setShowDeleteDialog}
        onConfirm={handlers.handleDeleteAccount}
      />

      <RenamePasskeyDialog
        open={!!state.renamingPasskey}
        onOpenChange={(open) => !open && state.setRenamingPasskey(null)}
        newName={state.newPasskeyName}
        onNameChange={state.setNewPasskeyName}
        onConfirm={handlers.handleRenamePasskey}
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
        onSubmit={handlers.handleChangeEmail}
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
        onSubmit={handlers.handleChangePassword}
        onCancel={() => {
          state.setShowPasswordDialog(false);
          state.resetPasswordForm();
        }}
      />
    </div>
  );
};

export default PrivacySecurity;
