import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Target, Save, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const FitnessGoals = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('fitness');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal: "",
    target_weight: "",
    target_weight_unit: "lbs",
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("goal, target_weight, target_weight_unit")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        // Convert from lbs (stored) to display unit
        let displayWeight = data.target_weight || 0;
        const displayUnit = data.target_weight_unit || "lbs";
        
        if (displayWeight && displayUnit === "kg") {
          displayWeight = displayWeight * 0.453592; // Convert lbs back to kg for display
        }

        setFormData({
          goal: data.goal || "",
          target_weight: displayWeight ? displayWeight.toFixed(1) : "",
          target_weight_unit: displayUnit,
        });
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Convert to lbs for storage (database stores everything in lbs)
      let targetWeightLbs = formData.target_weight ? parseFloat(formData.target_weight) : null;
      if (targetWeightLbs && formData.target_weight_unit === "kg") {
        targetWeightLbs = targetWeightLbs * 2.20462; // Convert kg to lbs
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          goal: formData.goal,
          target_weight: targetWeightLbs,
          target_weight_unit: formData.target_weight_unit,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      toast.success(t('goals_updated'));
    } catch (error: any) {
      toast.error(t('failed_to_save'));
      console.error("Profile save error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t('fitness_goals')}</h1>
          <p className="text-muted-foreground">{t('set_track_fitness_targets')}</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Target className="w-5 h-5 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-semibold">{t('your_goals')}</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal">{t('primary_goal')}</Label>
            <Select
              value={formData.goal}
              onValueChange={(value) => setFormData({ ...formData, goal: value })}
            >
              <SelectTrigger id="goal">
                <SelectValue placeholder={t('select_your_goal')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose_weight">{t('lose_weight')}</SelectItem>
                <SelectItem value="maintain_weight">{t('maintain_weight')}</SelectItem>
                <SelectItem value="gain_weight">{t('gain_weight')}</SelectItem>
                <SelectItem value="build_muscle">{t('build_muscle')}</SelectItem>
                <SelectItem value="improve_fitness">{t('improve_fitness')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_weight">{t('target_weight')}</Label>
              <Input
                id="target_weight"
                type="number"
                step="0.1"
                placeholder={t('enter_target_weight')}
                value={formData.target_weight}
                onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_weight_unit">{t('unit')}</Label>
              <Select
                value={formData.target_weight_unit}
                onValueChange={(value) => setFormData({ ...formData, target_weight_unit: value })}
              >
                <SelectTrigger id="target_weight_unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} className="gap-2" disabled={isLoading}>
            <Save className="w-4 h-4" />
            {t('save_goals')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default FitnessGoals;
