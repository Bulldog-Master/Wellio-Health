import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, TrendingUp, Activity, Apple, Dumbbell } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIInsight {
  id: string;
  insight_type: string;
  insight_text: string;
  generated_at: string | null;
  data_summary: any;
}

const AIInsights = () => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingWorkouts, setIsGeneratingWorkouts] = useState(false);
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

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
          throw new Error('AI rate limit exceeded. Please try again later.');
        }
        if (error.message?.includes('402')) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        throw error;
      }

      toast({
        title: "Insights generated",
        description: "New AI insights have been created based on your health data.",
      });

      fetchInsights();
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights. Please try again.",
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
          throw new Error('AI rate limit exceeded. Please try again later.');
        }
        if (error.message?.includes('402')) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        throw error;
      }

      toast({
        title: "Workout recommendations ready",
        description: "AI has generated personalized workout recommendations for you.",
      });

      fetchInsights();
    } catch (error: any) {
      console.error('Error generating workout recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations. Please try again.",
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
          throw new Error('AI rate limit exceeded. Please try again later.');
        }
        if (error.message?.includes('402')) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        throw error;
      }

      toast({
        title: "Meal suggestions ready",
        description: "AI has generated personalized meal suggestions for you.",
      });

      fetchInsights();
    } catch (error: any) {
      console.error('Error generating meal suggestions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate suggestions. Please try again.",
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">Personalized health recommendations</p>
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
            {isGeneratingWorkouts ? 'Generating...' : 'Workout Tips'}
          </Button>
          <Button 
            onClick={handleGenerateMeals} 
            disabled={isGeneratingMeals}
            variant="outline"
            className="gap-2"
          >
            <Apple className={`w-4 h-4 ${isGeneratingMeals ? 'animate-spin' : ''}`} />
            {isGeneratingMeals ? 'Generating...' : 'Meal Ideas'}
          </Button>
          <Button 
            onClick={handleGenerateInsights} 
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-gradient-hero text-white shadow-glow">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Health Analysis</h3>
            <p className="text-white/90 mb-4">
              Get personalized insights, workout recommendations, and meal suggestions based on your data.
              Our AI analyzes patterns to provide actionable recommendations for your health journey.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span>General Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span>Workout Plans</span>
              </div>
              <div className="flex items-center gap-2">
                <Apple className="w-4 h-4" />
                <span>Meal Ideas</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="workout_recommendations">Workouts</TabsTrigger>
          <TabsTrigger value="meal_suggestions">Meals</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
        {isLoading ? (
          <Card className="p-8 bg-gradient-card shadow-md">
            <p className="text-center text-muted-foreground">Loading insights...</p>
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
                        {insight.insight_type.replace(/_/g, ' ')}
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
                  {activeTab === 'all' ? 'No insights yet' : `No ${activeTab.replace(/_/g, ' ')} yet`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your health data, then use the buttons above to generate AI-powered recommendations.
                </p>
                <div className="flex gap-2 justify-center">
                  {activeTab === 'workout_recommendations' || activeTab === 'all' ? (
                    <Button onClick={handleGenerateWorkouts} disabled={isGeneratingWorkouts} variant="outline" className="gap-2">
                      <Dumbbell className={`w-4 h-4 ${isGeneratingWorkouts ? 'animate-spin' : ''}`} />
                      Generate Workouts
                    </Button>
                  ) : null}
                  {activeTab === 'meal_suggestions' || activeTab === 'all' ? (
                    <Button onClick={handleGenerateMeals} disabled={isGeneratingMeals} variant="outline" className="gap-2">
                      <Apple className={`w-4 h-4 ${isGeneratingMeals ? 'animate-spin' : ''}`} />
                      Generate Meals
                    </Button>
                  ) : null}
                  {(activeTab === 'general' || activeTab === 'all') && (
                    <Button onClick={handleGenerateInsights} disabled={isGenerating} className="gap-2">
                      <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      Generate Insights
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
  );
};

export default AIInsights;
