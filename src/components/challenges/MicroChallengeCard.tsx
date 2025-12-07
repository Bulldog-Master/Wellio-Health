import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Timer, 
  Users, 
  Share2, 
  Trophy,
  Play,
  CheckCircle,
  Flame
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MicroChallenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  duration_minutes: number;
  points_reward: number;
  total_completions: number;
  viral_score: number;
  share_code: string | null;
  creator_id: string;
}

interface MicroChallengeCardProps {
  challenge: MicroChallenge;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export const MicroChallengeCard = ({ 
  challenge, 
  isCompleted = false,
  onComplete 
}: MicroChallengeCardProps) => {
  const { t } = useTranslation(['challenges', 'common']);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.duration_minutes * 60);
  const [progress, setProgress] = useState(0);

  const getChallengeTypeIcon = () => {
    switch (challenge.challenge_type) {
      case 'quick_burst': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'daily_dare': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'friend_face_off': return <Users className="w-5 h-5 text-blue-500" />;
      case 'community_wave': return <Trophy className="w-5 h-5 text-purple-500" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getChallengeTypeBadge = () => {
    const typeKey = challenge.challenge_type.replace(/_/g, '_');
    return t(`micro_${typeKey}`, { defaultValue: challenge.challenge_type });
  };

  const startChallenge = () => {
    setIsActive(true);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeChallenge = async (shareToFeed: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('micro_challenge_completions')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          time_taken_seconds: (challenge.duration_minutes * 60) - timeLeft,
          shared_to_feed: shareToFeed
        });

      if (error) throw error;

      toast.success(t('challenge_completed'));
      setIsActive(false);
      onComplete?.();
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast.error(t('common:error'));
    }
  };

  const shareChallenge = async () => {
    if (challenge.share_code) {
      const shareUrl = `${window.location.origin}/challenge/${challenge.share_code}`;
      try {
        await navigator.share({
          title: challenge.title,
          text: t('share_challenge_text', { title: challenge.title }),
          url: shareUrl
        });
      } catch {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t('link_copied'));
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    return (
      <Card className="p-4 bg-gradient-card border-green-500/30">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div className="flex-1">
            <h4 className="font-semibold">{challenge.title}</h4>
            <p className="text-sm text-muted-foreground">{t('completed')}</p>
          </div>
          <Badge variant="secondary">+{challenge.points_reward} {t('points')}</Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getChallengeTypeIcon()}
          <Badge variant="outline">{getChallengeTypeBadge()}</Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Timer className="w-4 h-4" />
          <span>{challenge.duration_minutes} {t('minutes')}</span>
        </div>
      </div>

      <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
      {challenge.description && (
        <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {challenge.total_completions} {t('completions')}
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-4 h-4" />
          +{challenge.points_reward} {t('points')}
        </span>
      </div>

      {isActive ? (
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-3xl font-bold">{formatTime(timeLeft)}</span>
          </div>
          <p className="text-center text-sm">
            {t('target')}: {challenge.target_value} {challenge.target_unit}
          </p>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-2">
            <Button 
              onClick={() => completeChallenge(false)} 
              className="flex-1"
              variant="outline"
            >
              {t('complete')}
            </Button>
            <Button 
              onClick={() => completeChallenge(true)} 
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t('complete_and_share')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button onClick={startChallenge} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            {t('start_challenge')}
          </Button>
          <Button variant="outline" size="icon" onClick={shareChallenge}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
};
