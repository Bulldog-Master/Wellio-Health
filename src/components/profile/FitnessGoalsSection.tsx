import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Target, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileFormData } from "@/hooks/profile/useProfile";

interface FitnessGoalsSectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
}

export function FitnessGoalsSection({
  open,
  onOpenChange,
  formData,
  setFormData
}: FitnessGoalsSectionProps) {
  const { t } = useTranslation('profile');

  return (
    <Card className="bg-gradient-card shadow-md overflow-hidden">
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">{t('fitness_goals')}</h3>
              <p className="text-sm text-muted-foreground">{t('track_progress_goals')}</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 pt-0 space-y-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetWeight">{t('target_weight')}</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="targetWeight"
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    className="flex-1"
                  />
                  <Select 
                    value={formData.targetWeightUnit} 
                    onValueChange={(value: "lbs" | "kg") => setFormData({ ...formData, targetWeightUnit: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">{t('lbs')}</SelectItem>
                      <SelectItem value="kg">{t('kg')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="goal">{t('goal_type')}</Label>
                <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leaner">{t('get_leaner')}</SelectItem>
                    <SelectItem value="stronger">{t('get_stronger')}</SelectItem>
                    <SelectItem value="maintain">{t('maintain')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="moveGoal">{t('daily_move_goal')}</Label>
                <Input
                  id="moveGoal"
                  type="number"
                  value={formData.moveGoal}
                  onChange={(e) => setFormData({ ...formData, moveGoal: e.target.value })}
                  className="mt-1.5"
                  placeholder="500"
                />
                <p className="text-xs text-muted-foreground mt-1">{t('calories')}</p>
              </div>
              <div>
                <Label htmlFor="exerciseGoal">{t('daily_exercise_goal')}</Label>
                <Input
                  id="exerciseGoal"
                  type="number"
                  value={formData.exerciseGoal}
                  onChange={(e) => setFormData({ ...formData, exerciseGoal: e.target.value })}
                  className="mt-1.5"
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground mt-1">{t('minutes')}</p>
              </div>
              <div>
                <Label htmlFor="standGoal">{t('daily_stand_goal')}</Label>
                <Input
                  id="standGoal"
                  type="number"
                  value={formData.standGoal}
                  onChange={(e) => setFormData({ ...formData, standGoal: e.target.value })}
                  className="mt-1.5"
                  placeholder="12"
                />
                <p className="text-xs text-muted-foreground mt-1">{t('hours')}</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
