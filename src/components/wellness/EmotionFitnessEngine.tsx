import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, Brain, Activity, TrendingUp, Smile, Frown, Meh, 
  Zap, Moon, Sun, Sparkles, Calendar, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MOODS = [
  { id: 'energized', icon: Zap, color: 'text-yellow-500' },
  { id: 'calm', icon: Sun, color: 'text-blue-400' },
  { id: 'motivated', icon: TrendingUp, color: 'text-green-500' },
  { id: 'stressed', icon: Activity, color: 'text-orange-500' },
  { id: 'tired', icon: Moon, color: 'text-purple-400' },
  { id: 'anxious', icon: Brain, color: 'text-red-400' },
];

const CYCLE_PHASES = [
  { id: 'menstrual', label: 'Menstrual', days: '1-5', color: 'bg-red-500/20 text-red-400' },
  { id: 'follicular', label: 'Follicular', days: '6-14', color: 'bg-pink-500/20 text-pink-400' },
  { id: 'ovulatory', label: 'Ovulatory', days: '15-17', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'luteal', label: 'Luteal', days: '18-28', color: 'bg-purple-500/20 text-purple-400' },
];

interface Analysis {
  overallMoodScore: number;
  workoutImpactOnMood: string;
  moodImpactOnPerformance: string;
  bestWorkoutMoods: string[];
  avoidWorkoutMoods: string[];
  cycleInsights: {
    currentPhase: string;
    energyLevel: string;
    recommendedIntensity: string;
    bestExerciseTypes: string[];
    nutritionTips: string[];
  } | null;
  patterns: { observation: string; recommendation: string }[];
  weeklyRecommendation: string;
  stressManagement: string;
}

export const EmotionFitnessEngine: React.FC = () => {
  const { t } = useTranslation(['fitness', 'common']);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [stressLevel, setStressLevel] = useState([5]);
  const [sleepQuality, setSleepQuality] = useState([7]);
  const [trackCycle, setTrackCycle] = useState(false);
  const [cyclePhase, setCyclePhase] = useState<string | null>(null);
  const [cycleDay, setCycleDay] = useState([14]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleAnalyze = async () => {
    if (!selectedMood) {
      toast.error(t('common:select_mood_first'));
      return;
    }

    setIsAnalyzing(true);
    try {
      const emotionData = {
        mood: selectedMood,
        energyLevel: energyLevel[0],
        stressLevel: stressLevel[0],
        sleepQuality: sleepQuality[0],
        timestamp: new Date().toISOString()
      };

      const workoutData = {
        recentWorkouts: 5,
        avgDuration: 45,
        preferredTypes: ['strength', 'cardio']
      };

      const cycleData = trackCycle ? {
        currentPhase: cyclePhase,
        cycleDay: cycleDay[0],
        tracking: true
      } : null;

      const { data, error } = await supabase.functions.invoke('emotion-fitness-analysis', {
        body: { emotionData, workoutData, cycleData }
      });

      if (error) throw error;
      setAnalysis(data);
      toast.success(t('analysis_complete'));
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('common:error_occurred'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoodIcon = (moodId: string) => {
    if (moodId === 'positive') return <Smile className="w-5 h-5 text-green-500" />;
    if (moodId === 'negative') return <Frown className="w-5 h-5 text-red-500" />;
    return <Meh className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="log" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="log">{t('log_emotions')}</TabsTrigger>
          <TabsTrigger value="insights">{t('insights')}</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4 mt-4">
          {/* Mood Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                {t('current_mood')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {MOODS.map((mood) => {
                  const Icon = mood.icon;
                  return (
                    <Button
                      key={mood.id}
                      variant={selectedMood === mood.id ? 'default' : 'outline'}
                      className="flex flex-col items-center gap-2 h-auto py-4"
                      onClick={() => setSelectedMood(mood.id)}
                    >
                      <Icon className={`w-6 h-6 ${mood.color}`} />
                      <span className="text-xs">{t(`mood_${mood.id}`)}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Energy & Stress Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                {t('energy_stress_levels')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t('energy_level')}: {energyLevel[0]}/10
                </Label>
                <Slider
                  value={energyLevel}
                  onValueChange={setEnergyLevel}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t('stress_level')}: {stressLevel[0]}/10
                </Label>
                <Slider
                  value={stressLevel}
                  onValueChange={setStressLevel}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  {t('sleep_quality')}: {sleepQuality[0]}/10
                </Label>
                <Slider
                  value={sleepQuality}
                  onValueChange={setSleepQuality}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Cycle Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                {t('cycle_tracking')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="cycle-toggle">{t('track_menstrual_cycle')}</Label>
                <Switch
                  id="cycle-toggle"
                  checked={trackCycle}
                  onCheckedChange={setTrackCycle}
                />
              </div>

              {trackCycle && (
                <>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2 block">
                      {t('cycle_day')}: {cycleDay[0]}
                    </Label>
                    <Slider
                      value={cycleDay}
                      onValueChange={(val) => {
                        setCycleDay(val);
                        // Auto-detect phase based on day
                        const day = val[0];
                        if (day <= 5) setCyclePhase('menstrual');
                        else if (day <= 14) setCyclePhase('follicular');
                        else if (day <= 17) setCyclePhase('ovulatory');
                        else setCyclePhase('luteal');
                      }}
                      max={28}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {CYCLE_PHASES.map((phase) => (
                      <Button
                        key={phase.id}
                        variant={cyclePhase === phase.id ? 'default' : 'outline'}
                        className={`flex flex-col items-center gap-1 h-auto py-3 ${
                          cyclePhase === phase.id ? '' : phase.color
                        }`}
                        onClick={() => setCyclePhase(phase.id)}
                      >
                        <span className="text-sm font-medium">{t(`phase_${phase.id}`)}</span>
                        <span className="text-xs opacity-70">{t('days')} {phase.days}</span>
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <Button 
            onClick={handleAnalyze} 
            className="w-full" 
            size="lg"
            disabled={isAnalyzing || !selectedMood}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common:analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {t('analyze_correlation')}
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 mt-4">
          {analysis ? (
            <>
              {/* Overall Score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {analysis.overallMoodScore}/10
                    </div>
                    <p className="text-muted-foreground">{t('overall_wellness_score')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {getMoodIcon(analysis.workoutImpactOnMood)}
                        <span className="font-medium capitalize">{analysis.workoutImpactOnMood}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('workout_impact_mood')}</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {getMoodIcon(analysis.moodImpactOnPerformance)}
                        <span className="font-medium capitalize">{analysis.moodImpactOnPerformance}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('mood_impact_performance')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cycle Insights */}
              {analysis.cycleInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-pink-500" />
                      {t('cycle_insights')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('current_phase')}</span>
                      <Badge variant="outline" className="capitalize">
                        {t(`phase_${analysis.cycleInsights.currentPhase}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('energy_level')}</span>
                      <Badge variant={analysis.cycleInsights.energyLevel === 'high' ? 'default' : 'secondary'}>
                        {t(`level_${analysis.cycleInsights.energyLevel}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t('recommended_intensity')}</span>
                      <Badge variant="outline">
                        {t(`intensity_${analysis.cycleInsights.recommendedIntensity}`)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('best_exercises')}</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.cycleInsights.bestExerciseTypes.map((type, i) => (
                          <Badge key={i} variant="secondary">{type}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('nutrition_tips')}</p>
                      <ul className="text-sm space-y-1">
                        {analysis.cycleInsights.nutritionTips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patterns & Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    {t('patterns_recommendations')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.patterns.map((pattern, i) => (
                    <div key={i} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium mb-1">{pattern.observation}</p>
                      <p className="text-sm text-muted-foreground">{pattern.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Weekly Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('weekly_recommendation')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{analysis.weeklyRecommendation}</p>
                </CardContent>
              </Card>

              {/* Stress Management */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('stress_management')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{analysis.stressManagement}</p>
                </CardContent>
              </Card>

              <Button onClick={handleAnalyze} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('refresh_analysis')}
              </Button>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('no_analysis_yet')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('log_emotions_first')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
