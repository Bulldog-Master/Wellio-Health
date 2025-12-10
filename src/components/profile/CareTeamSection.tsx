import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronDown, Users, Dumbbell, Stethoscope, UserX, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JoinByCode } from '@/components/professional';

interface Professional {
  id: string;
  professional_id: string;
  professional_type: 'coach' | 'clinician';
  started_at: string;
  professional: {
    display_name: string;
    avatar_url?: string;
  };
}

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
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchProfessionals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch coach relationships
      const { data: coachData } = await supabase
        .from('coach_clients')
        .select(`
          id,
          coach_id,
          created_at,
          coach:profiles!coach_clients_coach_id_fkey(display_name, avatar_url)
        `)
        .eq('client_id', user.id)
        .eq('status', 'active');

      // Fetch clinician relationships
      const { data: clinicianData } = await supabase
        .from('clinician_patients')
        .select(`
          id,
          clinician_id,
          created_at,
          clinician:profiles!clinician_patients_clinician_id_fkey(display_name, avatar_url)
        `)
        .eq('patient_id', user.id)
        .eq('status', 'active');

      const combined: Professional[] = [];

      if (coachData) {
        coachData.forEach((item: any) => {
          combined.push({
            id: item.id,
            professional_id: item.coach_id,
            professional_type: 'coach',
            started_at: item.created_at,
            professional: item.coach
          });
        });
      }

      if (clinicianData) {
        clinicianData.forEach((item: any) => {
          combined.push({
            id: item.id,
            professional_id: item.clinician_id,
            professional_type: 'clinician',
            started_at: item.created_at,
            professional: item.clinician
          });
        });
      }

      setProfessionals(combined);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleRevokeAccess = async (professional: Professional) => {
    setRevoking(professional.id);
    try {
      const table = professional.professional_type === 'coach' ? 'coach_clients' : 'clinician_patients';
      
      const { error } = await supabase
        .from(table)
        .update({ status: 'inactive' })
        .eq('id', professional.id);

      if (error) throw error;

      setProfessionals(prev => prev.filter(p => p.id !== professional.id));
      toast.success(t('access_revoked'));
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error(t('common:error'));
    } finally {
      setRevoking(null);
    }
  };

  const hasCoach = professionals.some(p => p.professional_type === 'coach');
  const hasClinician = professionals.some(p => p.professional_type === 'clinician');

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
                      <div 
                        key={professional.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={professional.professional.avatar_url} />
                            <AvatarFallback>
                              {professional.professional.display_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{professional.professional.display_name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {professional.professional_type === 'coach' ? (
                                  <><Dumbbell className="w-3 h-3 mr-1" />{t('coach')}</>
                                ) : (
                                  <><Stethoscope className="w-3 h-3 mr-1" />{t('clinician')}</>
                                )}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {t('since')} {new Date(professional.started_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('revoke_access_title')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('revoke_access_desc', { name: professional.professional.display_name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevokeAccess(professional)}
                                disabled={revoking === professional.id}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {revoking === professional.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {t('revoke_access')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
