// ========================================
// WELLIO HEALTH - CARE TEAM SCREEN
// Route: /care-team
//
// - Shows current professional relationships
// - Lets users join a pro via invite code (JoinByCode)
// - Shows invite code panel for professionals (coach/clinician)
// - Links pros to their dashboards (/coach, /clinician)
// - Explains "Who can see my data?"
// ========================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, UserPlus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useCareTeam } from './useCareTeam';
import { useProfessionalStatus } from './useProfessionalStatus';
import { CoachRow } from './CoachRow';
import { ClinicianRow } from './ClinicianRow';
import { JoinByCode } from './JoinByCode';
import { InviteCodePanel } from './InviteCodePanel';
import { WhoCanSeeMyDataSection } from './WhoCanSeeMyDataSection';
import { InviteClientDialog } from './InviteClientDialog';

// ---------- PRESENTATIONAL SUBCOMPONENTS ----------

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-background p-4 space-y-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

interface ProfessionalToolsPanelProps {
  professionalType: 'coach' | 'clinician';
  isCoach: boolean;
  isClinician: boolean;
}

function ProfessionalToolsPanel({ professionalType, isCoach, isClinician }: ProfessionalToolsPanelProps) {
  const { t } = useTranslation(['professional', 'common']);
  const navigate = useNavigate();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Fetch invite code for dialog
  const fetchInviteCode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from('professional_invite_codes')
      .select('code')
      .eq('professional_id', user.id)
      .eq('professional_type', professionalType)
      .eq('is_active', true)
      .maybeSingle();
    
    if (data?.code) {
      setInviteCode(data.code);
      setShowInviteDialog(true);
    }
  };

  const roleLabel = isCoach ? 'coach' : isClinician ? 'clinician' : 'professional';

  return (
    <SectionCard title={t('professional_tools', 'Professional tools')}>
      <p className="text-xs text-muted-foreground mb-3">
        {t('professional_tools_desc', `As a ${professionalType}, you can view aggregated functional trends for people who connect to you from your dashboard. Secure messaging is routed via xx network's cMix for metadata protection.`)}
      </p>
      
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
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

        <Button
          variant="outline"
          size="sm"
          onClick={fetchInviteCode}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {t('invite_client', `Invite a ${roleLabel}`)}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/pro/insights')}
          className="opacity-60"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          {t('view_growth_revenue', 'View client growth & revenue')}
        </Button>
      </div>

      {showInviteDialog && inviteCode && (
        <InviteClientDialog
          code={inviteCode}
          onClose={() => setShowInviteDialog(false)}
        />
      )}
    </SectionCard>
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
  const hasCoach = !!coach;
  const hasClinician = !!clinician;

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

          <ProfessionalToolsPanel 
            professionalType={professionalType}
            isCoach={isCoach}
            isClinician={isClinician}
          />
        </>
      )}

      {/* Section: "Who can see my data?" */}
      <WhoCanSeeMyDataSection careTeam={{ hasCoach, hasClinician }} />
    </div>
  );
};
