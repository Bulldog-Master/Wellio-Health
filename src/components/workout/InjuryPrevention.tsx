import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Heart,
  Activity,
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Target,
  Clock
} from 'lucide-react';

interface InjuryAnalysis {
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
  primaryConcerns: Array<{
    area: string;
    risk: 'low' | 'moderate' | 'high';
    reason: string;
  }>;
  recommendations: Array<{
    priority: 'immediate' | 'short-term' | 'long-term';
    action: string;
    benefit: string;
  }>;
  recoveryStatus: 'well-rested' | 'adequate' | 'needs-rest' | 'overtrained';
  workloadAnalysis: {
    weeklyTrend: 'increasing' | 'stable' | 'decreasing';
    sustainabilityScore: number;
    suggestedRestDays: number;
  };
  preventiveMeasures: string[];
}

const InjuryPrevention: React.FC = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<InjuryAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t('common:error'),
          description: t('common:login_required'),
          variant: 'destructive',
        });
        return;
      }

      // Fetch workout data from last 14 days
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const [workoutsRes, recoveryRes, wearableRes] = await Promise.all([
        supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', twoWeeksAgo.toISOString())
          .order('logged_at', { ascending: false }),
        supabase
          .from('recovery_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('session_date', twoWeeksAgo.toISOString().split('T')[0])
          .order('session_date', { ascending: false }),
        supabase
          .from('wearable_data')
          .select('*')
          .eq('user_id', user.id)
          .gte('recorded_date', twoWeeksAgo.toISOString().split('T')[0])
          .order('recorded_date', { ascending: false }),
      ]);

      const { data, error } = await supabase.functions.invoke('predict-injury-risk', {
        body: {
          workoutData: workoutsRes.data || [],
          recoveryData: recoveryRes.data || [],
          sleepData: wearableRes.data || [],
          userId: user.id,
        },
      });

      if (error) throw error;

      setAnalysis(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching injury analysis:', error);
      toast({
        title: t('common:error'),
        description: t('injury_analysis_error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'moderate': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getRiskBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level) {
      case 'low': return 'secondary';
      case 'moderate': return 'outline';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getRecoveryIcon = (status: string) => {
    switch (status) {
      case 'well-rested': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'adequate': return <Minus className="h-5 w-5 text-yellow-500" />;
      case 'needs-rest': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'overtrained': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'immediate': return <Zap className="h-4 w-4 text-red-500" />;
      case 'short-term': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'long-term': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('injury_prevention')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('injury_prevention')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAnalysis}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            {t('common:last_updated')}: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {analysis ? (
          <>
            {/* Overall Risk Score */}
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${getRiskColor(analysis.overallRiskLevel)}`} />
                <span className="text-sm font-medium capitalize">
                  {t(`risk_${analysis.overallRiskLevel}`)}
                </span>
              </div>
              <div className="text-4xl font-bold mb-2">{analysis.riskScore}</div>
              <p className="text-sm text-muted-foreground">{t('risk_score')}</p>
              <Progress 
                value={analysis.riskScore} 
                className="mt-2 h-2"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20">
                {getRecoveryIcon(analysis.recoveryStatus)}
                <span className="text-xs mt-1 text-center capitalize">
                  {t(`recovery_${analysis.recoveryStatus.replace('-', '_')}`)}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20">
                {getTrendIcon(analysis.workloadAnalysis.weeklyTrend)}
                <span className="text-xs mt-1 text-center capitalize">
                  {t(`trend_${analysis.workloadAnalysis.weeklyTrend}`)}
                </span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/20">
                <Moon className="h-5 w-5 text-indigo-500" />
                <span className="text-xs mt-1 text-center">
                  {analysis.workloadAnalysis.suggestedRestDays} {t('rest_days')}
                </span>
              </div>
            </div>

            {/* Primary Concerns */}
            {analysis.primaryConcerns.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  {t('primary_concerns')}
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {analysis.primaryConcerns.map((concern, index) => (
                      <div 
                        key={index}
                        className="flex items-start justify-between p-2 rounded bg-muted/20"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-sm">{concern.area}</span>
                          <p className="text-xs text-muted-foreground">{concern.reason}</p>
                        </div>
                        <Badge variant={getRiskBadgeVariant(concern.risk)} className="ml-2">
                          {concern.risk}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                {t('recommendations')}
              </h4>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg bg-muted/20 border-l-2 border-primary/50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityIcon(rec.priority)}
                        <span className="text-xs uppercase text-muted-foreground">
                          {t(`priority_${rec.priority.replace('-', '_')}`)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{rec.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{rec.benefit}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Preventive Measures */}
            {analysis.preventiveMeasures.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  {t('preventive_measures')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.preventiveMeasures.map((measure, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {measure}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sustainability Score */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('workload_sustainability')}</span>
                <span className="text-lg font-bold">{analysis.workloadAnalysis.sustainabilityScore}%</span>
              </div>
              <Progress 
                value={analysis.workloadAnalysis.sustainabilityScore} 
                className="h-2"
              />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('no_analysis_available')}</p>
            <Button onClick={fetchAnalysis} className="mt-4">
              {t('generate_analysis')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InjuryPrevention;
