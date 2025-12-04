import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CryptoPaymentInfoProps {
  cryptoCurrency: string;
  amountUsd: number;
  onBack: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

// Placeholder wallet addresses - would be generated per transaction
const WALLET_ADDRESSES: Record<string, string> = {
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  USDT: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  USDC: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};

export const CryptoPaymentInfo = ({
  cryptoCurrency,
  amountUsd,
  onBack,
  onConfirm,
  isProcessing
}: CryptoPaymentInfoProps) => {
  const { t } = useTranslation(['payments', 'common']);
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);

  const walletAddress = WALLET_ADDRESSES[cryptoCurrency] || WALLET_ADDRESSES.ETH;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success(t('address_copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          {t('crypto_warning')}
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label className="text-muted-foreground">{t('send_crypto', { crypto: cryptoCurrency })}</Label>
            <p className="text-2xl font-bold mt-1">${amountUsd.toFixed(2)} USD</p>
            <p className="text-sm text-muted-foreground">
              {t('equivalent_in', { crypto: cryptoCurrency })}
            </p>
          </div>

          <div>
            <Label className="text-muted-foreground">{t('wallet_address')}</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                {walletAddress}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyAddress}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {t('payment_expires', { minutes: 30 })}
          </div>
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="txHash">{t('transaction_hash')}</Label>
        <Input
          id="txHash"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder={t('tx_hash_placeholder')}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {t('tx_hash_help')}
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          {t('common:back')}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('confirming')}
            </>
          ) : (
            t('i_sent_payment')
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {t('crypto_verification_time')}
      </p>
    </form>
  );
};