import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Target, Award } from 'lucide-react';
import { format } from 'date-fns';
import type { Challenge } from './types';

interface ChallengeCardProps {
  challenge: Challenge;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'hard': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'extreme': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(['challenges']);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={() => navigate(`/progress-challenge/${challenge.id}`)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{challenge.title}</CardTitle>
          <Badge className={getDifficultyColor(challenge.difficulty_level)}>
            {t(`challenges:${challenge.difficulty_level}`)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span>{challenge.target_value} {challenge.target_unit}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(challenge.start_date), 'MMM dd')} - {format(new Date(challenge.end_date), 'MMM dd, yyyy')}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {challenge.participants_count} {t('challenges:participants')}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4 text-primary" />
          <span className="font-semibold">{challenge.points_reward} {t('challenges:points')}</span>
        </div>
        <div className="pt-2">
          <Badge variant="outline" className="capitalize">
            {challenge.challenge_type.replace('_', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
