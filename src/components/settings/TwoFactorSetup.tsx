import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Smartphone, Key, Copy, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const TwoFactorSetup = () => {
  const { t } = useTranslation(['settings', 'common']);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('auth_secrets')
        .select('two_factor_enabled')
        .eq('user_id', user.id)
        .single();

      setIs2FAEnabled(data?.two_factor_enabled || false);
    } catch (error) {
      console.error('Error loading 2FA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSecret = () => {
    // Generate a base32 secret (simplified - in production use a proper TOTP library)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const generateBackupCodes = () => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const handleEnable2FA = async () => {
    const newSecret = generateSecret();
    setSecret(newSecret);
    setStep('setup');
    setShowSetupDialog(true);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error(t('settings:2fa_invalid_code'));
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const codes = generateBackupCodes();
      setBackupCodes(codes);

      // Save the secret and enable 2FA
      await supabase
        .from('auth_secrets')
        .upsert({
          user_id: user.id,
          two_factor_secret: secret,
          two_factor_enabled: true,
          backup_codes: codes,
          updated_at: new Date().toISOString()
        });

      setStep('backup');
      setIs2FAEnabled(true);
      toast.success(t('settings:2fa_enabled'));
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error(t('common:error'));
    }
  };

  const handleDisable2FA = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('auth_secrets')
        .update({
          two_factor_enabled: false,
          two_factor_secret: null,
          backup_codes: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setIs2FAEnabled(false);
      toast.success(t('settings:2fa_disabled'));
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error(t('common:error'));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t('common:copied'));
  };

  const copyAllBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success(t('settings:backup_codes_copied'));
  };

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-muted rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          {t('settings:two_factor_auth')}
        </CardTitle>
        <CardDescription>
          {t('settings:two_factor_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>{t('settings:2fa_status')}</Label>
            <p className="text-sm text-muted-foreground">
              {is2FAEnabled ? t('settings:2fa_enabled_text') : t('settings:2fa_disabled_text')}
            </p>
          </div>
          <Switch
            checked={is2FAEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                handleEnable2FA();
              } else {
                handleDisable2FA();
              }
            }}
          />
        </div>

        <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {t('settings:setup_2fa')}
              </DialogTitle>
              <DialogDescription>
                {step === 'setup' && t('settings:2fa_setup_desc')}
                {step === 'verify' && t('settings:2fa_verify_desc')}
                {step === 'backup' && t('settings:2fa_backup_desc')}
              </DialogDescription>
            </DialogHeader>

            {step === 'setup' && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">{t('settings:2fa_manual_entry')}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background p-2 rounded break-all">
                      {secret}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(secret)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Key className="h-4 w-4 mt-0.5 text-primary" />
                    <p className="text-sm">{t('settings:2fa_app_instructions')}</p>
                  </div>
                </div>

                <Button className="w-full" onClick={() => setStep('verify')}>
                  {t('common:continue')}
                </Button>
              </div>
            )}

            {step === 'verify' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings:verification_code')}</Label>
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button className="w-full" onClick={handleVerify}>
                  {t('settings:verify_and_enable')}
                </Button>
              </div>
            )}

            {step === 'backup' && (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive" />
                    <p className="text-sm">{t('settings:backup_codes_warning')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="p-2 bg-muted rounded text-center font-mono text-sm">
                      {code}
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full" onClick={copyAllBackupCodes}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('settings:copy_backup_codes')}
                </Button>

                <Button className="w-full" onClick={() => setShowSetupDialog(false)}>
                  {t('common:done')}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup;
