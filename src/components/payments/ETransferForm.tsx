import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ETransferFormProps {
  amount: number;
  onBack: () => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const ETransferForm = ({
  amount,
  onBack,
  onSubmit,
  isProcessing
}: ETransferFormProps) => {
  const { t } = useTranslation(['payments', 'common']);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const recipientEmail = 'payments@wellio.app';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(recipientEmail);
    setCopied(true);
    toast.success(t('email_copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationNumber || !senderEmail) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          {t('etransfer_instructions')}
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label className="text-muted-foreground">{t('send_to')}</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-sm">
                {recipientEmail}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyEmail}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('amount_to_send')}</Label>
            <p className="text-2xl font-bold mt-1">${amount.toFixed(2)} CAD</p>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('message_optional')}</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('include_username')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <Label htmlFor="senderEmail">{t('your_email')}</Label>
          <Input
            id="senderEmail"
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder={t('email_placeholder')}
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmationNumber">{t('confirmation_number')}</Label>
          <Input
            id="confirmationNumber"
            value={confirmationNumber}
            onChange={(e) => setConfirmationNumber(e.target.value)}
            placeholder={t('confirmation_placeholder')}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t('confirmation_help')}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          {t('common:back')}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!confirmationNumber || !senderEmail || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            t('submit_for_verification')
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {t('verification_time')}
      </p>
    </form>
  );
};