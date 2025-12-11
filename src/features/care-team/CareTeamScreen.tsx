// ========================================
// WELLIO HEALTH - CARE TEAM SCREEN
// Route: /care-team
//
// - Shows three sections: Supporters, Trainers & Coaches, Clinicians
// - Lets users add team members via invite codes
// - Shows professional tools for coaches/clinicians
// - Access log for viewing data access history
// ========================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, ArrowRight, UserPlus, TrendingUp, History,
  Users, Dumbbell, Stethoscope, MoreHorizontal 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useCareTeam } from './useCareTeam';
import { useProfessionalStatus } from './useProfessionalStatus';
import { CoachRow } from './CoachRow';
import { ClinicianRow } from './ClinicianRow';
import { InviteCodePanel } from './InviteCodePanel';
import { WhoCanSeeMyDataSection } from './WhoCanSeeMyDataSection';
import { InviteClientDialog } from './InviteClientDialog';
import { AddSupporterDialog } from './AddSupporterDialog';
import { AddTrainerDialog } from './AddTrainerDialog';
import { AddClinicianDialog } from './AddClinicianDialog';
import { DataAccessLogDialog } from './DataAccessLogDialog';

// ---------- PRESENTATIONAL SUBCOMPONENTS ----------

function SectionCard({ 
  title, 
  icon: Icon,
  children 
}: { 
  title: string; 
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-background p-4 space-y-3">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {title}
      </h2>
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
        {t('professional_tools_desc', `As a ${professionalType}, you can view aggregated functional trends for people who connect to you from your dashboard. Secure messaging is routed via xx network's cMixx for metadata protection.`)}
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
  const { t } = useTranslation(['care_team', 'professional', 'common']);
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

  // Dialog states
  const [showAddSupporter, setShowAddSupporter] = useState(false);
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [showAddClinician, setShowAddClinician] = useState(false);
  const [showAccessLog, setShowAccessLog] = useState(false);

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
      {/* Header with menu */}
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{t('care_team')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('subtitle')}
          </p>
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {t('body_text')}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowAccessLog(true)}>
              <History className="h-4 w-4 mr-2" />
              {t('who_viewed_data')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Section: Supporters */}
      <SectionCard title={t('supporters')} icon={Users}>
        <p className="text-xs text-muted-foreground">
          {t('supporters_empty')}
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAddSupporter(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {t('add_supporter')}
        </Button>
      </SectionCard>

      {/* Section: Trainers & Coaches */}
      <SectionCard title={t('trainers_coaches')} icon={Dumbbell}>
        {coach ? (
          <CoachRow
            coach={coach}
            onRevoke={handleRevokeAccess}
            revoking={revoking === coach.id}
          />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {t('trainers_empty')}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddTrainer(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t('add_trainer_coach')}
            </Button>
          </>
        )}
      </SectionCard>

      {/* Section: Clinicians */}
      <SectionCard title={t('clinicians')} icon={Stethoscope}>
        {clinician ? (
          <ClinicianRow
            clinician={clinician}
            onRevoke={handleRevokeAccess}
            revoking={revoking === clinician.id}
          />
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {t('clinicians_empty')}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddClinician(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t('add_clinician')}
            </Button>
          </>
        )}
      </SectionCard>

      {/* Section: Professional tools (if user is coach/clinician) */}
      {isProfessional && professionalType && (
        <>
          <SectionCard title={t('professional:your_invite_code')}>
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

      {/* Dialogs */}
      <AddSupporterDialog 
        open={showAddSupporter} 
        onOpenChange={setShowAddSupporter}
        onSuccess={fetchProfessionals}
      />
      <AddTrainerDialog 
        open={showAddTrainer} 
        onOpenChange={setShowAddTrainer}
        onSuccess={fetchProfessionals}
      />
      <AddClinicianDialog 
        open={showAddClinician} 
        onOpenChange={setShowAddClinician}
        onSuccess={fetchProfessionals}
      />
      <DataAccessLogDialog 
        open={showAccessLog} 
        onOpenChange={setShowAccessLog}
      />
    </div>
  );
};
