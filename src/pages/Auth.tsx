import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Activity, Lock, Sparkles, Fingerprint } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuthHandlers, useAuthEffects } from "@/hooks/auth";
import {
  AuthHeroSection,
  ReferralBanner,
  TwoFactorForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  MagicLinkForm,
  PasskeyForm,
  PasswordLoginForm,
  AuthMethod,
  UserRole,
} from "@/components/auth";

const Auth = () => {
  const { t } = useTranslation('auth');
  
  // Form state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [hasReferralCode, setHasReferralCode] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Initialize auth effects
  useAuthEffects({
    initialCheckDone,
    isResettingPassword,
    setInitialCheckDone,
    setPasskeySupported,
    setIsInIframe,
    setIsResettingPassword,
    setIsLogin,
    setAuthMethod,
    setHasReferralCode,
    setDeviceFingerprint,
  });

  // Get auth handlers
  const {
    handlePasswordAuth,
    handleVerify2FA,
    handleForgotPassword,
    handleResetPassword,
    handleMagicLink,
    handlePasskey,
    cancel2FA,
  } = useAuthHandlers({
    email, password, confirmPassword, name, userRole, newPassword,
    isLogin, totpCode, backupCode, useBackupCode, rememberDevice,
    deviceFingerprint, isInIframe, passkeySupported,
    setLoading, setRequires2FA, setPendingUserId, setTotpCode,
    setBackupCode, setUseBackupCode, setRememberDevice, setIsLogin,
    setIsForgotPassword, setIsResettingPassword, setNewPassword,
    setConfirmPassword, setPassword, setAuthMethod,
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      <AuthHeroSection />

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-6">
            <div className="bg-accent/10 p-2 rounded-lg">
              <LanguageSwitcher />
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t('app_name')}</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {requires2FA ? t('verify_identity') : isResettingPassword ? t('reset_password_title') : isLogin ? t('welcome_back') : t('get_started')}
            </h2>
            <p className="text-muted-foreground">
              {requires2FA ? t('enter_auth_code') : isResettingPassword ? t('enter_new_password') : isLogin ? t('sign_in_message') : t('sign_up_message')}
            </p>
          </div>

          {!requires2FA && !isResettingPassword && !isLogin && (
            <ReferralBanner hasReferralCode={hasReferralCode} />
          )}

          {requires2FA ? (
            <TwoFactorForm
              loading={loading}
              totpCode={totpCode}
              setTotpCode={setTotpCode}
              backupCode={backupCode}
              setBackupCode={setBackupCode}
              useBackupCode={useBackupCode}
              setUseBackupCode={setUseBackupCode}
              rememberDevice={rememberDevice}
              setRememberDevice={setRememberDevice}
              onSubmit={handleVerify2FA}
              onCancel={cancel2FA}
            />
          ) : (
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as AuthMethod)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted">
                <TabsTrigger value="password" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <Lock className="h-4 w-4 mr-2" />
                  {t('password_tab')}
                </TabsTrigger>
                <TabsTrigger value="magiclink" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
                  <Sparkles className="h-4 w-4" />
                  {t('magic_tab')}
                </TabsTrigger>
                <TabsTrigger value="passkey" className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground" disabled={!passkeySupported}>
                  <Fingerprint className="h-4 w-4" />
                  {t('passkey_tab')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                {isForgotPassword ? (
                  <ForgotPasswordForm loading={loading} email={email} setEmail={setEmail} onSubmit={handleForgotPassword} onBack={() => setIsForgotPassword(false)} />
                ) : isResettingPassword ? (
                  <ResetPasswordForm loading={loading} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} showNewPassword={showNewPassword} setShowNewPassword={setShowNewPassword} showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword} onSubmit={handleResetPassword} />
                ) : (
                  <PasswordLoginForm loading={loading} isLogin={isLogin} email={email} setEmail={setEmail} password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} name={name} setName={setName} userRole={userRole} setUserRole={setUserRole} showPassword={showPassword} setShowPassword={setShowPassword} showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword} onSubmit={handlePasswordAuth} onForgotPassword={() => setIsForgotPassword(true)} />
                )}
              </TabsContent>

              <TabsContent value="magiclink">
                <MagicLinkForm loading={loading} email={email} setEmail={setEmail} onSubmit={handleMagicLink} />
              </TabsContent>

              <TabsContent value="passkey">
                <PasskeyForm loading={loading} isLogin={isLogin} isInIframe={isInIframe} passkeySupported={passkeySupported} email={email} setEmail={setEmail} name={name} setName={setName} onSubmit={handlePasskey} />
              </TabsContent>
            </Tabs>
          )}

          <div className="mt-6 text-center">
            {!requires2FA && !isForgotPassword && !isResettingPassword && (
              <Button variant="ghost" onClick={() => { setIsLogin(!isLogin); setPassword(""); setConfirmPassword(""); setIsForgotPassword(false); }} className="text-sm">
                {isLogin ? t('dont_have_account_q') : t('already_have_account_q')}
                <span className="font-semibold text-primary ml-1">{isLogin ? t('sign_up_link') : t('sign_in_link')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
