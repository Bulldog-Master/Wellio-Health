import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { RecoverySession, therapies } from './types';

interface SessionCardProps {
  session: RecoverySession;
  getTherapyName: (therapyId: string) => string;
}

export const SessionCard = ({ session, getTherapyName }: SessionCardProps) => {
  const therapyInfo = therapies.find(t => t.id === session.therapy_type);
  const Icon = therapyInfo?.icon || Activity;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${therapyInfo?.color || 'bg-muted'} flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{getTherapyName(session.therapy_type)}</h3>
            <Badge variant="outline" className="text-xs">
              {session.intensity}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {session.duration_minutes} min
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(session.session_date), 'MMM d, yyyy')}
            </span>
          </div>
          {session.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{session.notes}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
