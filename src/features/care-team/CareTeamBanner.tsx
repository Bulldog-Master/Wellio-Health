import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { useCareTeam } from './useCareTeam';

export function CareTeamBanner() {
  const { t } = useTranslation(['professional', 'common']);
  const navigate = useNavigate();
  const { coaches, clinicians, loading } = useCareTeam();

  // Don't show if loading or no connections
  if (loading) return null;
  
  const hasCoach = coaches.length > 0;
  const hasClinician = clinicians.length > 0;
  
  if (!hasCoach && !hasClinician) return null;

  const connectionCount = (hasCoach ? 1 : 0) + (hasClinician ? 1 : 0);
  const connectionText = connectionCount === 1
    ? (hasCoach ? t('connected_to_coach', 'Connected to a coach') : t('connected_to_clinician', 'Connected to a clinician'))
    : t('connected_to_both', 'Connected to coach & clinician');

  return (
    <button
      onClick={() => navigate('/care-team')}
      className="w-full flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <div>
          <p className="text-xs font-medium">{connectionText}</p>
          <p className="text-[10px] text-muted-foreground">
            {t('care_team_banner_desc', 'Your functional index is shared with your care team')}
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
