import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

export function ReferralSection() {
  const { t } = useTranslation('profile');
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [referralCode] = useState("WELLIO-" + Math.random().toString(36).substr(2, 6).toUpperCase());
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: t('copied'),
        description: t('referral_link_copied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_copy_link'),
        variant: "destructive",
      });
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('join_wellio'),
          text: t('start_fitness_journey'),
          url: referralLink,
        });
      } catch (error) {
        console.log(t('share_cancelled'));
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{t('share_invite_friends')}</h3>
      <p className="text-sm text-muted-foreground mb-4">{t('earn_rewards_description')}</p>
      
      <div className="flex gap-2 mb-4">
        <Input value={referralLink} readOnly className="flex-1" />
        <Button variant="outline" size="icon" onClick={copyToClipboard}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      
      <Button onClick={shareReferral} className="w-full gap-2">
        <Share2 className="w-4 h-4" />
        {t('share_link')}
      </Button>
    </Card>
  );
}
