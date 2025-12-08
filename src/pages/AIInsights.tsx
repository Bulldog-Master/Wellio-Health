import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, TrendingUp, Activity, Apple, Dumbbell, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/ui";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionGate } from "@/components/common";
import { useNavigate } from "react-router-dom";

interface AIInsight {
  id: string;
  insight_type: string;
  insight_text: string;
  generated_at: string | null;
  data_summary: any;
}

const AIInsights = () => {
  const { toast } = useToast();
  const { t } = useTranslation('ai');
  const navigate = useNavigate();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingWorkouts, setIsGeneratingWorkouts] = useState(false);
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const getInsightTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      'meal_suggestions': t('insight_type_meal_suggestions'),
      'workout_recommendations': t('insight_type_workout_recommendations'),
      'weight': t('insight_type_weight'),
      'activity': t('insight_type_activity'),
      'nutrition': t('insight_type_nutrition'),
    };
    return typeMap[type] || t('insight_type_general');
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights');

      if (error) {
        if (error.message?.includes('429')) {
          throw new Error(t('rate_limit_exceeded'));
        }
        if (error.message?.includes('402')) {
          throw new Error(t('credits_exhausted'));
        }
        throw error;
      }

      toast({
        title: t('insights_generated'),
        description: t('insights_generated_desc'),
      });

      fetchInsights();
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: t('error'),
        description: error.message || t('failed_to_generate'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWorkouts = async () => {
    setIsGeneratingWorkouts(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-workout-recommendations');

      if (error) {
        if (error.message?.includes('429')) {
          throw new Error(t('rate_limit_exceeded'));
        }
        if (error.message?.includes('402')) {
          throw new Error(t('credits_exhausted'));
        }
        throw error;
      }

      toast({
        title: t('workout_recommendations_ready'),
        description: t('workout_recommendations_desc'),
      });

      fetchInsights();
    } catch (error: any) {
      console.error('Error generating workout recommendations:', error);
      toast({
        title: t('error'),
        description: error.message || t('failed_to_generate'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingWorkouts(false);
    }
  };

  const handleGenerateMeals = async () => {
    setIsGeneratingMeals(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-meal-suggestions');

      if (error) {
        if (error.message?.includes('429')) {
          throw new Error(t('rate_limit_exceeded'));
        }
        if (error.message?.includes('402')) {
          throw new Error(t('credits_exhausted'));
        }
        throw error;
      }

      toast({
        title: t('meal_suggestions_ready'),
        description: t('meal_suggestions_desc'),
      });

      fetchInsights();
    } catch (error: any) {
      console.error('Error generating meal suggestions:', error);
      toast({
        title: t('error'),
        description: error.message || t('failed_to_generate'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMeals(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return TrendingUp;
      case 'activity':
        return Activity;
      case 'nutrition':
      case 'meal_suggestions':
        return Apple;
      case 'workout_recommendations':
        return Dumbbell;
      default:
        return Brain;
    }
  };

  return (
    <SubscriptionGate feature="ai_insights">
      <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/premium')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{t('ai_insights')}</h1>
            <p className="text-muted-foreground">{t('personalized_recommendations')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateWorkouts} 
            disabled={isGeneratingWorkouts}
            variant="outline"
            className="gap-2"
          >
            <Dumbbell className={`w-4 h-4 ${isGeneratingWorkouts ? 'animate-spin' : ''}`} />
            {isGeneratingWorkouts ? t('generating') : t('workout_tips')}
          </Button>
          <Button 
            onClick={handleGenerateMeals} 
            disabled={isGeneratingMeals}
            variant="outline"
            className="gap-2"
          >
            <Apple className={`w-4 h-4 ${isGeneratingMeals ? 'animate-spin' : ''}`} />
            {isGeneratingMeals ? t('generating') : t('meal_ideas')}
          </Button>
          <Button 
            onClick={handleGenerateInsights} 
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? t('generating') : t('generate_insights')}
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-gradient-hero text-white shadow-glow">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('ai_powered_analysis')}</h3>
            <p className="text-white/90 mb-4">
              {t('ai_description')}
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>{t('general_insights')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span>{t('workout_plans')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4" />
                <span>{t('meal_ideas')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t('all')}</TabsTrigger>
          <TabsTrigger value="workout_recommendations">{t('workouts')}</TabsTrigger>
          <TabsTrigger value="meal_suggestions">{t('meals')}</TabsTrigger>
          <TabsTrigger value="general">{t('general')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
        {isLoading ? (
          <Card className="p-8 bg-gradient-card shadow-md">
            <p className="text-center text-muted-foreground">{t('loading_insights')}</p>
          </Card>
        ) : insights.filter(i => activeTab === 'all' || i.insight_type === activeTab || (activeTab === 'general' && !['workout_recommendations', 'meal_suggestions'].includes(i.insight_type))).length > 0 ? (
          insights
            .filter(i => activeTab === 'all' || i.insight_type === activeTab || (activeTab === 'general' && !['workout_recommendations', 'meal_suggestions'].includes(i.insight_type)))
            .map((insight) => {
            const Icon = getInsightIcon(insight.insight_type);
            return (
              <Card key={insight.id} className="p-6 bg-gradient-card shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg capitalize">
                        {getInsightTypeLabel(insight.insight_type)}
                      </h3>
                      {insight.generated_at && (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(insight.generated_at), "PP")}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground whitespace-pre-line">{insight.insight_text}</p>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 bg-gradient-card shadow-md">
            <div className="text-center space-y-4">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === 'all' ? t('no_insights_yet') : t('no_type_yet', { type: activeTab.replace(/_/g, ' ') })}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('start_tracking')}
                </p>
                <div className="flex gap-2 justify-center">
                  {activeTab === 'workout_recommendations' || activeTab === 'all' ? (
                    <Button onClick={handleGenerateWorkouts} disabled={isGeneratingWorkouts} variant="outline" className="gap-2">
                      <Dumbbell className={`w-4 h-4 ${isGeneratingWorkouts ? 'animate-spin' : ''}`} />
                      {t('generate_workouts')}
                    </Button>
                  ) : null}
                  {activeTab === 'meal_suggestions' || activeTab === 'all' ? (
                    <Button onClick={handleGenerateMeals} disabled={isGeneratingMeals} variant="outline" className="gap-2">
                      <Apple className={`w-4 h-4 ${isGeneratingMeals ? 'animate-spin' : ''}`} />
                      {t('generate_meals')}
                    </Button>
                  ) : null}
                  {(activeTab === 'general' || activeTab === 'all') && (
                    <Button onClick={handleGenerateInsights} disabled={isGenerating} className="gap-2">
                      <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      {t('generate_insights')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
        </TabsContent>
      </Tabs>
    </div>
    </SubscriptionGate>
  );
};

export default AIInsights;
