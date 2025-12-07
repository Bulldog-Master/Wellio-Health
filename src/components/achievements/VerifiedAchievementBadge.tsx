import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VerifiedBadgeData {
  achievement: {
    type: string;
    value: number;
    unit: string;
    achievedAt: string;
  };
  verification: {
    hash: string;
    signedAt: string;
    platform: string;
    version: string;
  };
  shareUrl: string;
}

interface VerifiedAchievementBadgeProps {
  achievementId: string;
  achievementType: string;
  value: number;
  unit: string;
  achievedAt: string;
  onBadgeGenerated?: (badge: VerifiedBadgeData) => void;
}

export const VerifiedAchievementBadge: React.FC<VerifiedAchievementBadgeProps> = ({
  achievementId,
  achievementType,
  value,
  unit,
  achievedAt,
  onBadgeGenerated,
}) => {
  const { t } = useTranslation(['fitness', 'common']);
  const [isLoading, setIsLoading] = useState(false);
  const [badge, setBadge] = useState<VerifiedBadgeData | null>(null);
  const [copied, setCopied] = useState(false);

  const generateVerifiedBadge = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('common:error'));
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sign-achievement`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            achievementId,
            achievementType,
            value,
            unit,
            achievedAt,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to sign achievement');
      }

      const data = await response.json();
      setBadge(data.badge);
      onBadgeGenerated?.(data.badge);
      toast.success(t('verified_badge_generated'));
    } catch (error) {
      console.error('Error generating badge:', error);
      toast.error(t('common:error'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!badge) return;
    
    const shareText = `🏆 ${t('verified_achievement')}: ${achievementType}\n📊 ${value} ${unit}\n✅ ${t('verified_by_wellio')}\n🔗 ${badge.shareUrl}`;
    
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success(t('common:copied_to_clipboard'));
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = () => {
    if (!badge) return;
    
    const text = `🏆 ${t('just_achieved')}: ${achievementType} - ${value} ${unit}! Verified by Wellio ✅`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(badge.shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => !badge && generateVerifiedBadge()}
          disabled={isLoading}
          className="gap-2"
        >
          <Shield className="w-4 h-4 text-green-500" />
          {isLoading ? t('common:loading') : t('get_verified_badge')}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            {t('verified_achievement')}
          </DialogTitle>
        </DialogHeader>

        {badge ? (
          <div className="space-y-4">
            {/* Badge Display */}
            <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  {t('verified')}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  #{badge.verification.hash}
                </span>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">{achievementType}</h3>
                <p className="text-3xl font-bold text-primary">
                  {value} <span className="text-lg">{unit}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(badge.achievement.achievedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-green-500/20">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>{t('signed_by')}</span>
                  <span className="font-semibold text-green-600">{badge.verification.platform}</span>
                  <span>•</span>
                  <span>{t('crypto_verified')}</span>
                </div>
              </div>
            </div>

            {/* Share Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? t('common:copied') : t('common:copy')}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareOnSocial}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t('common:share')}
              </Button>
            </div>

            {/* Verification Link */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{t('verification_link')}</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs truncate">{badge.shareUrl}</code>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => window.open(badge.shareUrl, '_blank')}>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('generating_badge')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};