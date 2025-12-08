import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMedicalAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface MedicalAuthGateProps {
  children: React.ReactNode;
}

export const MedicalAuthGate = ({ children }: MedicalAuthGateProps) => {
  const { t } = useTranslation(['medical', 'auth', 'common']);
  const { hasValidSession, isLoading, expiresAt, authenticate } = useMedicalAuth();
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAuthenticating(true);

    const result = await authenticate(password);
    
    if (result.success) {
      toast.success(t('medical:access_granted', 'Medical access granted for 15 minutes'));
      setPassword('');
    } else {
      setError(result.error || t('auth:invalid_password', 'Invalid password'));
    }
    
    setIsAuthenticating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (hasValidSession) {
    return (
      <div className="space-y-4">
        {expiresAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>
              {t('medical:session_expires', 'Session expires at')}: {expiresAt.toLocaleTimeString()}
            </span>
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            {t('medical:reauth_required', 'Re-authentication Required')}
          </CardTitle>
          <CardDescription>
            {t('medical:reauth_description', 'For your security, please verify your identity to access medical records. Access will be granted for 15 minutes.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth:password', 'Password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth:enter_password', 'Enter your password')}
                required
                autoComplete="current-password"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isAuthenticating || !password}>
              {isAuthenticating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
                  {t('common:verifying', 'Verifying...')}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {t('medical:verify_access', 'Verify Access')}
                </>
              )}
            </Button>
          </form>
          
          <p className="mt-4 text-xs text-center text-muted-foreground">
            {t('medical:security_notice', 'Medical data is protected with additional security. This helps prevent unauthorized access to your sensitive health information.')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};