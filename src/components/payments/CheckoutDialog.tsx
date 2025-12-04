import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { ETransferForm } from './ETransferForm';
import { CryptoPaymentInfo } from './CryptoPaymentInfo';
import { Loader2, ShieldCheck } from 'lucide-react';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: 'subscription' | 'addon' | 'product';
  itemName: string;
  amount: number;
  billingCycle?: 'monthly' | 'yearly';
  onSuccess?: () => void;
}

export const CheckoutDialog = ({
  open,
  onOpenChange,
  itemType,
  itemName,
  amount,
  billingCycle = 'monthly',
  onSuccess
}: CheckoutDialogProps) => {
  const { t } = useTranslation(['payments', 'common']);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');

  const handleMethodSelect = (methodKey: string) => {
    setSelectedMethod(methodKey);
  };

  const handleProceed = () => {
    if (!selectedMethod) return;

    // For e-transfer and crypto, show additional forms
    if (selectedMethod === 'etransfer' || selectedMethod.startsWith('crypto_')) {
      setStep('details');
    } else {
      // For card/PayPal, would integrate with payment provider
      setStep('confirm');
    }
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Placeholder for actual payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess?.();
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('checkout')}</DialogTitle>
          <DialogDescription>
            {t('checkout_description', { item: itemName })}
          </DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('item')}</span>
            <span className="font-medium">{itemName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('billing')}</span>
            <span>{billingCycle === 'yearly' ? t('yearly') : t('monthly')}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>{t('total')}</span>
            <span>${amount.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        {step === 'select' && (
          <>
            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onSelect={handleMethodSelect}
              amount={amount}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                {t('common:cancel')}
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedMethod}
                onClick={handleProceed}
              >
                {t('continue')}
              </Button>
            </div>
          </>
        )}

        {/* E-Transfer Details */}
        {step === 'details' && selectedMethod === 'etransfer' && (
          <ETransferForm
            amount={amount}
            onBack={handleBack}
            onSubmit={handleConfirm}
            isProcessing={isProcessing}
          />
        )}

        {/* Crypto Payment Details */}
        {step === 'details' && selectedMethod?.startsWith('crypto_') && (
          <CryptoPaymentInfo
            cryptoCurrency={selectedMethod.replace('crypto_', '').toUpperCase()}
            amountUsd={amount}
            onBack={handleBack}
            onConfirm={handleConfirm}
            isProcessing={isProcessing}
          />
        )}

        {/* Confirmation Step (for card/PayPal) */}
        {step === 'confirm' && !selectedMethod?.startsWith('crypto_') && selectedMethod !== 'etransfer' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              {t('secure_payment')}
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="font-medium mb-2">{itemName}</p>
              <p className="text-2xl font-bold">${amount.toFixed(2)} USD</p>
              <p className="text-sm text-muted-foreground mt-1">
                {billingCycle === 'yearly' ? t('yearly') : t('monthly')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                {t('common:back')}
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  t('confirm_payment')
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};