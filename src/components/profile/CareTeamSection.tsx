import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Users, Loader2 } from 'lucide-react';
import { useCareTeam, CoachRow, ClinicianRow, JoinByCode } from '@/features/care-team';

interface CareTeamSectionProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export const CareTeamSection = ({ open: controlledOpen, onOpenChange, defaultOpen = false }: CareTeamSectionProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  const { t } = useTranslation(['professional', 'profile', 'common']);
  const {
    professionals,
    loading,
    revoking,
    hasCoach,
    hasClinician,
    fetchProfessionals,
    handleRevokeAccess
  } = useCareTeam();

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{t('my_care_team')}</CardTitle>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </div>
            <CardDescription>{t('my_care_team_desc')}</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <>
                {/* Connected Professionals */}
                {professionals.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">{t('connected_professionals')}</h4>
                    {professionals.map((professional) => (
                      professional.professional_type === 'coach' ? (
                        <CoachRow
                          key={professional.id}
                          coach={professional}
                          onRevoke={handleRevokeAccess}
                          revoking={revoking === professional.id}
                        />
                      ) : (
                        <ClinicianRow
                          key={professional.id}
                          clinician={professional}
                          onRevoke={handleRevokeAccess}
                          revoking={revoking === professional.id}
                        />
                      )
                    ))}
                  </div>
                )}

                {/* Join by Code Section */}
                {(!hasCoach || !hasClinician) && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">{t('add_professional')}</h4>
                    <JoinByCode onSuccess={fetchProfessionals} />
                  </div>
                )}

                {/* Empty State */}
                {professionals.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('no_professionals_connected')}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
