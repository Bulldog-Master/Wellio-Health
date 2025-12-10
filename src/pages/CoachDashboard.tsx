import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CoachDashboardScreen } from '@/features/coach/CoachDashboardFeature';

const CoachDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['professional', 'common']);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkCoachRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user has coach or trainer role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['coach', 'trainer', 'admin']);

      if (roles && roles.length > 0) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };

    checkCoachRole();
  }, [navigate]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-8 px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common:back')}
          </Button>

          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Coach Access Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to be an approved coach or trainer to access this dashboard.
            </p>
            <Button onClick={() => navigate('/trainer-portal')}>
              Apply as Trainer/Coach
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common:back')}
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Coach Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your clients' progress and provide guidance
            </p>
          </div>
        </div>

        <CoachDashboardScreen />
      </div>
    </div>
  );
};

export default CoachDashboard;
