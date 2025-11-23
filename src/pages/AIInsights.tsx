import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, TrendingUp, Activity, Apple } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

      if (error) throw error;

      toast({
        title: "Insights generated",
        description: "New AI insights have been created based on your health data.",
      });

      fetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return TrendingUp;
      case 'activity':
        return Activity;
      case 'nutrition':
        return Apple;
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
        <Button 
          onClick={handleGenerateInsights} 
          disabled={isGenerating}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate Insights'}
        </Button>
      </div>

      <Card className="p-6 bg-gradient-hero text-white shadow-glow">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Health Analysis</h3>
            <p className="text-white/90">
              Get personalized insights based on your weight, activity, nutrition, and symptom tracking.
              Our AI analyzes patterns in your data to provide actionable recommendations for your health journey.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-8 bg-gradient-card shadow-md">
            <p className="text-center text-muted-foreground">Loading insights...</p>
          </Card>
        ) : insights.length > 0 ? (
          insights.map((insight) => {
            const Icon = getInsightIcon(insight.insight_type);
            return (
              <Card key={insight.id} className="p-6 bg-gradient-card shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg capitalize">{insight.insight_type} Insight</h3>
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
                <h3 className="text-lg font-semibold mb-2">No insights yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your health data, then generate AI insights to get personalized recommendations.
                </p>
                <Button onClick={handleGenerateInsights} disabled={isGenerating} className="gap-2">
                  <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  Generate Your First Insight
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
