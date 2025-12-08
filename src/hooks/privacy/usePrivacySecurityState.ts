import { useState } from "react";

export const usePrivacySecurityState = () => {
  // Passkeys
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [renamingPasskey, setRenamingPasskey] = useState<{ id: string; currentName: string } | null>(null);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  
  // User info
  const [userEmail, setUserEmail] = useState("");
  
  // 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // Privacy settings
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowMentions, setAllowMentions] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showHealthMetrics, setShowHealthMetrics] = useState(false);
  
  // Password change
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Email change
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // Delete account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const resetEmailForm = () => {
    setNewEmail("");
    setEmailPassword("");
    setShowEmailPassword(false);
  };

  return {
    // Passkeys
    passkeys, setPasskeys,
    renamingPasskey, setRenamingPasskey,
    newPasskeyName, setNewPasskeyName,
    
    // User info
    userEmail, setUserEmail,
    
    // 2FA
    is2FAEnabled, setIs2FAEnabled,
    show2FASetup, setShow2FASetup,
    qrCodeUrl, setQrCodeUrl,
    totpToken, setTotpToken,
    backupCodes, setBackupCodes,
    showBackupCodes, setShowBackupCodes,
    
    // Privacy settings
    isPrivate, setIsPrivate,
    allowMentions, setAllowMentions,
    showActivity, setShowActivity,
    showHealthMetrics, setShowHealthMetrics,
    
    // Password change
    showPasswordDialog, setShowPasswordDialog,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmNewPassword, setConfirmNewPassword,
    showCurrentPassword, setShowCurrentPassword,
    showNewPassword, setShowNewPassword,
    showConfirmPassword, setShowConfirmPassword,
    isChangingPassword, setIsChangingPassword,
    
    // Email change
    showEmailDialog, setShowEmailDialog,
    newEmail, setNewEmail,
    emailPassword, setEmailPassword,
    showEmailPassword, setShowEmailPassword,
    isChangingEmail, setIsChangingEmail,
    
    // Delete account
    showDeleteDialog, setShowDeleteDialog,
    
    // Actions
    resetPasswordForm,
    resetEmailForm,
  };
};
