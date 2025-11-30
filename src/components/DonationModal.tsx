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
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickAmounts = [10, 25, 50, 100];

  const handleDonate = async () => {
    const donationAmount = parseFloat(amount);
    
    if (!donationAmount || donationAmount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    // Rate limiting for donations
    const { data: { user } } = await supabase.auth.getUser();
    const rateLimitKey = `donation:${user?.id || 'anonymous'}`;
    const rateLimit = await rateLimiter.check(rateLimitKey, RATE_LIMITS.DONATION);

    if (!rateLimit.allowed) {
      toast.error(`Please wait ${Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes before making another donation`);
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

      toast.success('Thank you for your generous donation!');
      onSuccess();
      onOpenChange(false);
      setAmount('');
      setMessage('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation');
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
            Support This Cause
          </DialogTitle>
          <DialogDescription>
            Donate to "{fundraiserTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Quick Amount</Label>
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
            <Label htmlFor="amount">Custom Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Leave a supportive message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="anonymous">Donate Anonymously</Label>
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
            Cancel
          </Button>
          <Button
            onClick={handleDonate}
            disabled={isSubmitting || !amount}
            className="flex-1"
          >
            {isSubmitting ? 'Processing...' : 'Donate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
