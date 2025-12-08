import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { rateLimiter, RATE_LIMITS } from '@/lib/rateLimit';
import { useTranslation } from 'react-i18next';

interface DonationModalProps {
  fundraiserId: string;
  fundraiserTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DonationModal = ({
  fundraiserId,
  fundraiserTitle,
  open,
  onOpenChange,
  onSuccess
}: DonationModalProps) => {
  const { t } = useTranslation('fundraisers');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickAmounts = [10, 25, 50, 100];

  const handleDonate = async () => {
    const donationAmount = parseFloat(amount);
    
    if (!donationAmount || donationAmount <= 0) {
      toast.error(t('messages.invalid_amount'));
      return;
    }

    // Rate limiting for donations
    const { data: { user } } = await supabase.auth.getUser();
    const rateLimitKey = `donation:${user?.id || 'anonymous'}`;
    const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.DONATION);

    if (!rateLimit.allowed) {
      toast.error(t('messages.rate_limit', { minutes: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000) }));
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('fundraiser_donations')
        .insert({
          fundraiser_id: fundraiserId,
          donor_id: isAnonymous ? null : user?.id,
          amount: donationAmount,
          message: message.trim() || null,
          is_anonymous: isAnonymous
        });

      if (error) throw error;

      // Success - reset rate limit
      rateLimiter.reset(rateLimitKey);

      toast.success(t('messages.donation_success'));
      onSuccess();
      onOpenChange(false);
      setAmount('');
      setMessage('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(t('messages.donation_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            {t('donation.support_cause')}
          </DialogTitle>
          <DialogDescription>
            {t('donation.donate_to')} "{fundraiserTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('donation.quick_amount')}</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant={amount === quickAmount.toString() ? 'default' : 'outline'}
                  onClick={() => setAmount(quickAmount.toString())}
                  type="button"
                >
                  ${quickAmount}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t('donation.custom_amount')}</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder={t('donation.enter_amount')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t('donation.message_optional')}</Label>
            <Textarea
              id="message"
              placeholder={t('donation.message_placeholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous">{t('donation.donate_anonymously')}</Label>
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {t('donation.cancel')}
          </Button>
          <Button
            onClick={handleDonate}
            disabled={isSubmitting || !amount}
            className="flex-1"
          >
            {isSubmitting ? t('donation.processing') : t('donation.donate')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};