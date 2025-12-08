import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, Crown, Sparkles, Plus } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import { useRecovery } from '@/hooks/recovery';
import { therapies, RecoveryFormDialog, SessionCard } from '@/components/recovery';

const Recovery = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['recovery', 'common']);
  const { isLoading: subscriptionLoading } = useSubscription();

  const {
    sessions,
    isLoading,
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleLogSession,
    getTherapyName,
    thisWeekSessions,
    totalMinutes,
  } = useRecovery();

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SubscriptionGate feature="recovery_tracking">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{t('recovery_hub')}</h1>
                <Badge variant="secondary" className="gap-1">
                  <Crown className="h-3 w-3" />
                  VIP
                </Badge>
              </div>
              <p className="text-muted-foreground">{t('recovery_description')}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{sessions.length}</div>
              <div className="text-xs text-muted-foreground">{t('total_sessions')}</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{thisWeekSessions.length}</div>
              <div className="text-xs text-muted-foreground">{t('this_week')}</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(totalMinutes / 60)}h</div>
              <div className="text-xs text-muted-foreground">{t('total_time')}</div>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-success mb-1" />
              <div className="text-xs text-muted-foreground">{t('stats')}</div>
            </Card>
          </div>

          {/* Therapy Types Grid */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('recovery_therapies')}</h2>
              <RecoveryFormDialog
                isOpen={dialogOpen}
                onOpenChange={setDialogOpen}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleLogSession}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {therapies.map((therapy) => {
                const Icon = therapy.icon;
                return (
                  <Card 
                    key={therapy.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setFormData({ ...formData, selectedTherapy: therapy.id });
                      setDialogOpen(true);
                    }}
                  >
                    <div className={`w-10 h-10 rounded-full ${therapy.color} flex items-center justify-center mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{t(therapy.nameKey)}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t(therapy.descKey)}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Sessions */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('recent_sessions')}</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </Card>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <Card className="p-8 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">{t('no_sessions')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('start_tracking')}</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('log_session')}
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    getTherapyName={getTherapyName}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SubscriptionGate>
  );
};

export default Recovery;
