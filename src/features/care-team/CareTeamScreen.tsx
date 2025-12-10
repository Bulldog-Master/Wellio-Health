// ========================================
// WELLIO HEALTH - CARE TEAM SCREEN
// Route: /care-team
//
// - Shows current professional relationships
// - Lets users join a pro via invite code (JoinByCode)
// - Shows invite code panel for professionals (coach/clinician)
// - Links pros to their dashboards (/coach, /clinician)
// ========================================

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCareTeam } from './useCareTeam';
import { useProfessionalStatus } from './useProfessionalStatus';
import { CoachRow } from './CoachRow';
import { ClinicianRow } from './ClinicianRow';
import { JoinByCode } from './JoinByCode';
import { InviteCodePanel } from './InviteCodePanel';

// ---------- PRESENTATIONAL SUBCOMPONENTS ----------

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-background p-4 space-y-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

// ---------- MAIN SCREEN ---------------------------

export const CareTeamScreen = () => {
  const { t } = useTranslation(['professional', 'common']);
  const navigate = useNavigate();
  const {
    coaches,
    clinicians,
    loading,
    revoking,
    fetchProfessionals,
    handleRevokeAccess,
  } = useCareTeam();

  const { isProfessional, professionalType, isCoach, isClinician, loading: professionalLoading } = useProfessionalStatus();

  const isLoading = loading || professionalLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const coach = coaches[0];
  const clinician = clinicians[0];

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs text-muted-foreground">
          {t('care_team_description', 'Connect with coaches and clinicians who can see your functional wellness index and trends — without exposing your raw health logs.')}
        </p>
      </header>

      {/* Section: Connections (user as client/patient) */}
      <SectionCard title={t('connections', 'Connections')}>
        <div className="space-y-3">
          {/* Coach row or JoinByCode */}
          {coach ? (
            <CoachRow
              coach={coach}
              onRevoke={handleRevokeAccess}
              revoking={revoking === coach.id}
            />
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t('coach_connect_prompt', 'Have a trainer or coach? Enter their invite code to connect.')}
              </p>
              <JoinByCode role="coach" onSuccess={fetchProfessionals} />
            </div>
          )}

          {/* Clinician row or JoinByCode */}
          {clinician ? (
            <ClinicianRow
              clinician={clinician}
              onRevoke={handleRevokeAccess}
              revoking={revoking === clinician.id}
            />
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t('clinician_connect_prompt', 'Working with a doctor or clinician? Enter their invite code to share your trends.')}
              </p>
              <JoinByCode role="clinician" onSuccess={fetchProfessionals} />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Section: Professional tools (if user is coach/clinician) */}
      {isProfessional && professionalType && (
        <>
          <SectionCard title={t('your_invite_code')}>
            <InviteCodePanel professionalType={professionalType} />
          </SectionCard>

          <SectionCard title={t('professional_tools', 'Professional tools')}>
            <p className="text-xs text-muted-foreground mb-3">
              {t('professional_tools_desc', `As a ${professionalType}, you can view aggregated functional trends for people who connect to you from your dashboard. Secure messaging is routed via xx network's cMix for metadata protection.`)}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {isCoach && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/coach')}
                  className="justify-between"
                >
                  {t('open_coach_dashboard', 'Open Coach Dashboard')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              
              {isClinician && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/clinician')}
                  className="justify-between"
                >
                  {t('open_clinician_dashboard', 'Open Clinician Dashboard')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
};
