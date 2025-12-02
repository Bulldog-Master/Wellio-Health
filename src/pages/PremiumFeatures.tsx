import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Crown, 
  Brain, 
  BarChart3, 
  Users, 
  Dumbbell, 
  Video, 
  FileText,
  Shield,
  Sparkles,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";

const PremiumFeatures = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['subscription', 'common', 'medical']);
  const { hasFullAccess, isVIP, isAdmin, isLoading } = useSubscription();

  // Redirect non-premium users
  if (!isLoading && !hasFullAccess) {
    navigate('/subscription');
    return null;
  }

  const premiumFeatures = [
    {
      icon: Brain,
      title: t('feature_ai_insights'),
      description: t('ai_insights_desc', { defaultValue: 'Get AI-powered recommendations and insights based on your fitness data' }),
      route: '/insights',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: BarChart3,
      title: t('feature_advanced_analytics'),
      description: t('analytics_desc', { defaultValue: 'Deep dive into your progress with detailed charts and metrics' }),
      route: '/analytics',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Users,
      title: t('feature_trainer_search'),
      description: t('trainer_desc', { defaultValue: 'Find and book sessions with professional trainers' }),
      route: '/trainer/marketplace',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Dumbbell,
      title: t('feature_custom_challenges'),
      description: t('challenges_desc', { defaultValue: 'Create and participate in custom fitness challenges' }),
      route: '/progress-challenges',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: Video,
      title: t('feature_live_sessions'),
      description: t('live_sessions_desc', { defaultValue: 'Join or host live workout sessions with others' }),
      route: '/live-workout-sessions',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: FileText,
      title: t('medical:health'),
      description: t('medical:track_medications_tests'),
      route: '/medical',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('premium_features_title', { defaultValue: 'Premium Features' })}</h1>
            <p className="text-muted-foreground">{t('premium_features_desc', { defaultValue: 'Exclusive features for VIP members' })}</p>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            {isAdmin ? <Shield className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isAdmin ? t('common:admin_access') : t('common:vip_access')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('full_access_description')}
            </p>
          </div>
        </div>
      </Card>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {premiumFeatures.map((feature) => (
          <Card 
            key={feature.route}
            className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(feature.route)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
              <Zap className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Card>
        ))}
      </div>

      {/* Unlimited Features */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {t('unlimited_access', { defaultValue: 'Unlimited Access' })}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {t('feature_unlimited_workouts')}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {t('feature_custom_programs')}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {t('feature_priority_support')}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {t('feature_team_collaboration')}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {t('feature_api_access')}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            {t('medical_records', { defaultValue: 'Medical Records' })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PremiumFeatures;
