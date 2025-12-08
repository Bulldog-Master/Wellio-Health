export type AuthMethod = "password" | "magiclink" | "passkey";
export type UserRole = 'user' | 'trainer' | 'creator';

export interface AuthFormState {
  isLogin: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  userRole: UserRole;
  loading: boolean;
  authMethod: AuthMethod;
  showPassword: boolean;
  showConfirmPassword: boolean;
  requires2FA: boolean;
  totpCode: string;
  pendingUserId: string | null;
  useBackupCode: boolean;
  backupCode: string;
  rememberDevice: boolean;
  deviceFingerprint: string;
  isForgotPassword: boolean;
  isResettingPassword: boolean;
  newPassword: string;
  showNewPassword: boolean;
  passkeySupported: boolean;
  isInIframe: boolean;
  hasReferralCode: boolean;
}

export interface AuthFormActions {
  setIsLogin: (value: boolean) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setName: (value: string) => void;
  setUserRole: (value: UserRole) => void;
  setLoading: (value: boolean) => void;
  setAuthMethod: (value: AuthMethod) => void;
  setShowPassword: (value: boolean) => void;
  setShowConfirmPassword: (value: boolean) => void;
  setRequires2FA: (value: boolean) => void;
  setTotpCode: (value: string) => void;
  setPendingUserId: (value: string | null) => void;
  setUseBackupCode: (value: boolean) => void;
  setBackupCode: (value: string) => void;
  setRememberDevice: (value: boolean) => void;
  setDeviceFingerprint: (value: string) => void;
  setIsForgotPassword: (value: boolean) => void;
  setIsResettingPassword: (value: boolean) => void;
  setNewPassword: (value: string) => void;
  setShowNewPassword: (value: boolean) => void;
  setPasskeySupported: (value: boolean) => void;
  setIsInIframe: (value: boolean) => void;
  setHasReferralCode: (value: boolean) => void;
}
