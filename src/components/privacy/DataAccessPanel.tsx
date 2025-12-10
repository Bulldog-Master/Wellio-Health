import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, UserX, Users, Stethoscope, Dumbbell, Eye, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface DataAccessor {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: 'coach' | 'clinician';
  status: 'active' | 'pending' | 'revoked';
  connectedAt: string;
  canSee: string[];
}

export const DataAccessPanel = () => {
  const { t } = useTranslation(['privacy', 'common']);
  const [accessors, setAccessors] = useState<DataAccessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetchDataAccessors();
  }, []);

  const fetchDataAccessors = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch coaches
      const { data: coaches } = await supabase
        .from('coach_clients')
        .select(`
          id,
          coach_id,
          status,
          created_at,
          profiles:coach_id (
            display_name,
            avatar_url
          )
        `)
        .eq('client_id', user.id)
        .in('status', ['active', 'pending']);

      // Fetch clinicians
      const { data: clinicians } = await supabase
        .from('clinician_patients')
        .select(`
          id,
          clinician_id,
          status,
          created_at,
          profiles:clinician_id (
            display_name,
            avatar_url
          )
        `)
        .eq('patient_id', user.id)
        .in('status', ['active', 'pending']);

      const allAccessors: DataAccessor[] = [];

      // Map coaches
      coaches?.forEach((coach: any) => {
        allAccessors.push({
          id: coach.id,
          userId: coach.coach_id,
          displayName: coach.profiles?.display_name || t('common:anonymous'),
          avatarUrl: coach.profiles?.avatar_url,
          role: 'coach',
          status: coach.status,
          connectedAt: coach.created_at,
          canSee: ['functional_index', 'workout_trends', 'activity_summary']
        });
      });

      // Map clinicians
      clinicians?.forEach((clinician: any) => {
        allAccessors.push({
          id: clinician.id,
          userId: clinician.clinician_id,
          displayName: clinician.profiles?.display_name || t('common:anonymous'),
          avatarUrl: clinician.profiles?.avatar_url,
          role: 'clinician',
          status: clinician.status,
          connectedAt: clinician.created_at,
          canSee: ['functional_index', 'wellness_trends', 'recovery_summary']
        });
      });

      setAccessors(allAccessors);
    } catch (error) {
      console.error('Error fetching data accessors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (accessor: DataAccessor) => {
    setRevoking(accessor.id);
    try {
      const table = accessor.role === 'coach' ? 'coach_clients' : 'clinician_patients';
      
      const { error } = await supabase
        .from(table)
        .update({ status: 'revoked' })
        .eq('id', accessor.id);

      if (error) throw error;

      // Log the revocation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('security_logs').insert({
          user_id: user.id,
          event_type: 'data_access_revoked',
          event_data: {
            revoked_user_id: accessor.userId,
            role: accessor.role,
            accessor_name: accessor.displayName
          }
        });
      }

      toast.success(t('privacy:access_revoked'));
      setAccessors(prev => prev.filter(a => a.id !== accessor.id));
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error(t('privacy:revoke_failed'));
    } finally {
      setRevoking(null);
    }
  };

  const getRoleIcon = (role: 'coach' | 'clinician') => {
    return role === 'coach' 
      ? <Dumbbell className="h-4 w-4" />
      : <Stethoscope className="h-4 w-4" />;
  };

  const getRoleLabel = (role: 'coach' | 'clinician') => {
    return role === 'coach' ? t('privacy:coach') : t('privacy:clinician');
  };

  const getCanSeeLabel = (item: string) => {
    const labels: Record<string, string> = {
      functional_index: t('privacy:can_see_functional_index'),
      workout_trends: t('privacy:can_see_workout_trends'),
      activity_summary: t('privacy:can_see_activity_summary'),
      wellness_trends: t('privacy:can_see_wellness_trends'),
      recovery_summary: t('privacy:can_see_recovery_summary')
    };
    return labels[item] || item;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>{t('privacy:who_can_see_data')}</CardTitle>
        </div>
        <CardDescription>
          {t('privacy:data_access_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {accessors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('privacy:no_data_accessors')}</p>
            <p className="text-sm mt-1">{t('privacy:data_is_private')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accessors.map(accessor => (
              <div 
                key={accessor.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={accessor.avatarUrl} />
                    <AvatarFallback>
                      {accessor.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{accessor.displayName}</span>
                      <Badge variant="outline" className="text-xs">
                        {getRoleIcon(accessor.role)}
                        <span className="ml-1">{getRoleLabel(accessor.role)}</span>
                      </Badge>
                      {accessor.status === 'pending' && (
                        <Badge variant="secondary" className="text-xs">
                          {t('privacy:pending')}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {t('privacy:connected_since', {
                          date: new Date(accessor.connectedAt).toLocaleDateString()
                        })}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Eye className="h-3 w-3" />
                        <span>{t('privacy:can_see')}:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {accessor.canSee.map(item => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {getCanSeeLabel(item)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {t('privacy:cannot_see_note')}
                    </p>
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={revoking === accessor.id}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      {t('privacy:revoke')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('privacy:revoke_access_title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('privacy:revoke_access_description', { name: accessor.displayName })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRevoke(accessor)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t('privacy:confirm_revoke')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
