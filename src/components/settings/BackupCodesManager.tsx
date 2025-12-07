import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Key, Copy, Download, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { encryptJSON, decryptJSON } from '@/lib/encryption';

interface BackupCodesManagerProps {
  userId: string;
  has2FAEnabled: boolean;
}

const BACKUP_CODE_COUNT = 8;
const BACKUP_CODE_LENGTH = 8;

const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like O, 0, 1, I
  
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    let code = '';
    for (let j = 0; j < BACKUP_CODE_LENGTH; j++) {
      const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % chars.length;
      code += chars[randomIndex];
    }
    codes.push(code);
  }
  
  return codes;
};

export const BackupCodesManager = ({ userId, has2FAEnabled }: BackupCodesManagerProps) => {
  const { t } = useTranslation(['settings', 'privacy', 'common']);
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && has2FAEnabled) {
      loadExistingCodes();
    }
  }, [isOpen, has2FAEnabled]);

  const loadExistingCodes = async () => {
    try {
      const { data } = await supabase
        .from('auth_secrets')
        .select('backup_codes_encrypted, encryption_version')
        .eq('user_id', userId)
        .single();

      if (data?.backup_codes_encrypted) {
        // We can't decrypt here without the user's secret, so we just show count
        // The actual codes are only shown when generated
        const encryptedData = JSON.parse(data.backup_codes_encrypted);
        setUsedCodes(encryptedData.used || []);
      }
    } catch (error) {
      console.error('Error loading backup codes:', error);
    }
  };

  const handleGenerateCodes = async () => {
    if (!has2FAEnabled) {
      toast({
        title: t('settings:2fa_required'),
        description: t('settings:enable_2fa_first'),
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const codes = generateBackupCodes();
      
      // Encrypt and store codes
      const encryptionSecret = `backup_${userId}_${Date.now()}`;
      const encryptedCodes = await encryptJSON(
        { codes, used: [], generatedAt: new Date().toISOString() },
        encryptionSecret
      );

      const { error } = await supabase
        .from('auth_secrets')
        .update({
          backup_codes_encrypted: encryptedCodes,
          encryption_version: 2,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;

      setBackupCodes(codes);
      setUsedCodes([]);
      setShowCodes(true);

      toast({
        title: t('settings:codes_generated'),
        description: t('settings:save_codes_warning'),
      });
    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast({
        title: t('common:error'),
        description: t('settings:codes_generation_failed'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCodes = async () => {
    const codesText = backupCodes.join('\n');
    await navigator.clipboard.writeText(codesText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    
    toast({
      title: t('settings:backup_codes_copied'),
    });
  };

  const handleDownloadCodes = () => {
    const content = [
      'Wellio Backup Codes',
      '===================',
      `Generated: ${new Date().toISOString()}`,
      '',
      'Keep these codes in a safe place.',
      'Each code can only be used once.',
      '',
      ...backupCodes.map((code, i) => `${i + 1}. ${code}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wellio-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: t('settings:codes_downloaded'),
    });
  };

  const handleVerifyCode = async () => {
    if (!verifyCode.trim()) return;
    
    setIsVerifying(true);
    try {
      const normalizedCode = verifyCode.toUpperCase().replace(/\s/g, '');
      
      // Check if code is valid and unused
      if (backupCodes.includes(normalizedCode) && !usedCodes.includes(normalizedCode)) {
        toast({
          title: t('settings:code_valid'),
          description: t('settings:code_can_be_used'),
        });
      } else if (usedCodes.includes(normalizedCode)) {
        toast({
          title: t('settings:code_already_used'),
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('settings:code_invalid'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsVerifying(false);
      setVerifyCode('');
    }
  };

  if (!has2FAEnabled) {
    return (
      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5" />
            {t('privacy:backup_codes')}
          </CardTitle>
          <CardDescription>
            {t('settings:enable_2fa_for_backup_codes')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Key className="h-5 w-5" />
          {t('privacy:backup_codes')}
        </CardTitle>
        <CardDescription>
          {t('privacy:backup_codes_description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              {t('settings:manage_backup_codes')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t('privacy:backup_codes')}
              </DialogTitle>
              <DialogDescription>
                {t('settings:backup_codes_desc')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {!showCodes ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      {t('settings:backup_codes_warning')}
                    </p>
                  </div>

                  <Button 
                    onClick={handleGenerateCodes} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="mr-2 h-4 w-4" />
                    )}
                    {t('settings:generate_new_codes')}
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div 
                        key={index} 
                        className={`p-2 rounded ${
                          usedCodes.includes(code) 
                            ? 'bg-destructive/10 line-through text-muted-foreground' 
                            : 'bg-background'
                        }`}
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleCopyCodes}
                    >
                      {isCopied ? (
                        <Check className="mr-2 h-4 w-4" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      {isCopied ? t('common:copied') : t('privacy:copy_all')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleDownloadCodes}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t('privacy:download_codes')}
                    </Button>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label>{t('settings:verify_code')}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={verifyCode}
                        onChange={(e) => setVerifyCode(e.target.value)}
                        placeholder="XXXXXXXX"
                        className="font-mono uppercase"
                        maxLength={8}
                      />
                      <Button 
                        variant="secondary"
                        onClick={handleVerifyCode}
                        disabled={isVerifying || !verifyCode.trim()}
                      >
                        {t('common:verify')}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGenerateCodes}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('settings:regenerate_codes')}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <p className="text-xs text-muted-foreground">
          {t('settings:backup_codes_info')}
        </p>
      </CardContent>
    </Card>
  );
};
