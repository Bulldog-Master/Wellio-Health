import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useCareTeam } from './useCareTeam';
import { useProfessionalStatus } from './useProfessionalStatus';
import { CoachRow } from './CoachRow';
import { ClinicianRow } from './ClinicianRow';
import { JoinByCode } from './JoinByCode';
import { InviteCodePanel } from './InviteCodePanel';

export const CareTeamScreen = () => {
  const { t } = useTranslation(['professional', 'common']);
  const {
    coaches,
    clinicians,
    loading,
    revoking,
    fetchProfessionals,
    handleRevokeAccess
  } = useCareTeam();

  const { isProfessional, professionalType, loading: professionalLoading } = useProfessionalStatus();

  if (loading || professionalLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const coach = coaches[0]; // User can have one coach
  const clinician = clinicians[0]; // User can have one clinician

  return (
    <div className="space-y-6">
      {/* Coach Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('my_coaches')}</h2>
        {coach ? (
          <CoachRow
            coach={coach}
            onRevoke={handleRevokeAccess}
            revoking={revoking === coach.id}
          />
        ) : (
          <JoinByCode role="coach" onSuccess={fetchProfessionals} />
        )}
      </section>

      {/* Clinician Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t('my_clinicians')}</h2>
        {clinician ? (
          <ClinicianRow
            clinician={clinician}
            onRevoke={handleRevokeAccess}
            revoking={revoking === clinician.id}
          />
        ) : (
          <JoinByCode role="clinician" onSuccess={fetchProfessionals} />
        )}
      </section>

      {/* Professional's Invite Code Panel */}
      {isProfessional && professionalType && (
        <section className="space-y-3 pt-4 border-t">
          <h2 className="text-lg font-semibold">{t('your_invite_code')}</h2>
          <InviteCodePanel professionalType={professionalType} />
        </section>
      )}
    </div>
  );
};
