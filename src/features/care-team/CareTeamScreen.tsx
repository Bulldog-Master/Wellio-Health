import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2 } from 'lucide-react';
import { useCareTeam } from './useCareTeam';
import { CoachRow } from './CoachRow';
import { ClinicianRow } from './ClinicianRow';
import { JoinByCode } from './JoinByCode';

export const CareTeamScreen = () => {
  const { t } = useTranslation(['professional', 'common']);
  const {
    coaches,
    clinicians,
    loading,
    revoking,
    hasCoach,
    hasClinician,
    fetchProfessionals,
    handleRevokeAccess
  } = useCareTeam();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connected Coaches */}
      {coaches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('my_coaches')}</CardTitle>
            <CardDescription>{t('coaches_supporting_you')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {coaches.map((coach) => (
              <CoachRow
                key={coach.id}
                coach={coach}
                onRevoke={handleRevokeAccess}
                revoking={revoking === coach.id}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Connected Clinicians */}
      {clinicians.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('my_clinicians')}</CardTitle>
            <CardDescription>{t('clinicians_supporting_you')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clinicians.map((clinician) => (
              <ClinicianRow
                key={clinician.id}
                clinician={clinician}
                onRevoke={handleRevokeAccess}
                revoking={revoking === clinician.id}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {coaches.length === 0 && clinicians.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">{t('no_professionals_connected')}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {t('connect_professional_desc')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Join by Code - Show if user doesn't have both coach and clinician */}
      {(!hasCoach || !hasClinician) && (
        <JoinByCode onSuccess={fetchProfessionals} />
      )}
    </div>
  );
};
