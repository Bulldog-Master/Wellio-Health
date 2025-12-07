import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon, Clock, Zap, Calendar, Loader2, Sunrise, Sunset } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkoutWindow {
  startHour: number;
  endHour: number;
  intensity: 'high' | 'moderate' | 'low';
  reason: string;
}

interface WeeklySchedule {
  [day: string]: {
    time: string;
    type: string;
    duration: number;
  };
}

interface CircadianAnalysis {
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  optimalWorkoutWindows: WorkoutWindow[];
  sleepQualityScore: number;
  recommendations: string[];
  peakEnergyHours: number[];
  avoidExerciseHours: number[];
  weeklyScheduleSuggestion: WeeklySchedule;
}

export const CircadianOptimizer: React.FC = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CircadianAnalysis | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Mock sleep and workout data for demo
      const sleepData = [
        { date: '2024-01-15', bedtime: '23:00', wakeTime: '07:00', quality: 7 },
        { date: '2024-01-14', bedtime: '23:30', wakeTime: '07:15', quality: 6 },
        { date: '2024-01-13', bedtime: '22:45', wakeTime: '06:45', quality: 8 },
      ];

      const workoutHistory = [
        { date: '2024-01-15', time: '07:30', type: 'Strength', duration: 60, performance: 8 },
        { date: '2024-01-13', time: '17:00', type: 'Cardio', duration: 45, performance: 7 },
        { date: '2024-01-11', time: '06:00', type: 'HIIT', duration: 30, performance: 9 },
      ];

      const { data, error } = await supabase.functions.invoke('circadian-optimizer', {
        body: { sleepData, workoutHistory, preferences: { preferMorning: true } }
      });

      if (error) throw error;
      setAnalysis(data);
      toast.success(t('common:success'));
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('common:error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };

  const getChronotypeIcon = (type: string) => {
    switch (type) {
      case 'early_bird': return <Sunrise className="w-5 h-5 text-yellow-500" />;
      case 'night_owl': return <Moon className="w-5 h-5 text-indigo-500" />;
      default: return <Sun className="w-5 h-5 text-orange-500" />;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  return (
    <div className="space-y-6">
      {!analysis ? (
        <Card className="p-6 bg-gradient-card">
          <div className="text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
              <Clock className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{t('circadian_optimizer')}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('circadian_optimizer_desc')}
            </p>
            <Button onClick={runAnalysis} disabled={isAnalyzing} size="lg">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common:loading')}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {t('analyze_rhythm')}
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t('common:overview')}</TabsTrigger>
            <TabsTrigger value="schedule">{t('weekly_schedule')}</TabsTrigger>
            <TabsTrigger value="tips">{t('common:recommendations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Chronotype Card */}
            <Card className="p-4 bg-gradient-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getChronotypeIcon(analysis.chronotype)}
                  <div>
                    <p className="text-sm text-muted-foreground">{t('your_chronotype')}</p>
                    <p className="font-semibold capitalize">
                      {analysis.chronotype.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('sleep_quality')}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={analysis.sleepQualityScore} className="w-20 h-2" />
                    <span className="font-semibold">{analysis.sleepQualityScore}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Optimal Workout Windows */}
            <Card className="p-4 bg-gradient-card">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  {t('optimal_workout_times')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {analysis.optimalWorkoutWindows.map((window, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getIntensityColor(window.intensity)}>
                        {window.intensity}
                      </Badge>
                      <span className="font-medium">
                        {formatHour(window.startHour)} - {formatHour(window.endHour)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[200px] text-right">
                      {window.reason}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Peak Energy Hours */}
            <Card className="p-4 bg-gradient-card">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  {t('peak_energy_hours')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap gap-2">
                  {analysis.peakEnergyHours.map((hour) => (
                    <Badge key={hour} variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                      {formatHour(hour)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card className="p-4 bg-gradient-card">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {t('suggested_weekly_schedule')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {Object.entries(analysis.weeklyScheduleSuggestion).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{day}</p>
                      <p className="text-sm text-muted-foreground">{schedule.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{schedule.type}</p>
                      <p className="text-sm text-muted-foreground">{schedule.duration} min</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <Card className="p-4 bg-gradient-card">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg">{t('personalized_recommendations')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="p-1 bg-primary/20 rounded-full mt-0.5">
                      <Sun className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Hours to Avoid */}
            <Card className="p-4 bg-gradient-card">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sunset className="w-5 h-5 text-red-500" />
                  {t('avoid_exercise_hours')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-wrap gap-2">
                  {analysis.avoidExerciseHours.map((hour) => (
                    <Badge key={hour} variant="secondary" className="bg-red-500/20 text-red-400">
                      {formatHour(hour)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={runAnalysis} variant="outline" className="w-full">
              {t('refresh_analysis')}
            </Button>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
