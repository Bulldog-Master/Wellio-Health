import { Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OnboardingStep3Props {
  formData: {
    goal: string;
    fitness_level: string;
    target_weight: string;
  };
  updateField: (field: string, value: string) => void;
}

export function OnboardingStep3({ formData, updateField }: OnboardingStep3Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Your fitness goals</h2>
        <p className="text-muted-foreground">What would you like to achieve?</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Primary Goal</Label>
          <RadioGroup value={formData.goal} onValueChange={(v) => updateField("goal", v)}>
            <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
              <RadioGroupItem value="leaner" id="leaner" />
              <Label htmlFor="leaner" className="font-normal cursor-pointer flex-1">
                Get Leaner (Lose Weight)
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
              <RadioGroupItem value="stronger" id="stronger" />
              <Label htmlFor="stronger" className="font-normal cursor-pointer flex-1">
                Get Stronger (Build Muscle)
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
              <RadioGroupItem value="maintain" id="maintain" />
              <Label htmlFor="maintain" className="font-normal cursor-pointer flex-1">
                Maintain Current Weight
              </Label>
            </div>
          </RadioGroup>
        </div>

        {(formData.goal === "leaner" || formData.goal === "stronger") && (
          <div>
            <Label htmlFor="target_weight">Target Weight (lbs)</Label>
            <Input
              id="target_weight"
              type="number"
              step="0.1"
              value={formData.target_weight}
              onChange={(e) => updateField("target_weight", e.target.value)}
              placeholder="170"
            />
          </div>
        )}

        <div>
          <Label>Fitness Level</Label>
          <RadioGroup value={formData.fitness_level} onValueChange={(v) => updateField("fitness_level", v)}>
            <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner" className="font-normal cursor-pointer flex-1">
                Beginner - New to fitness
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate" className="font-normal cursor-pointer flex-1">
                Intermediate - Regular exercise
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded hover:bg-accent cursor-pointer">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced" className="font-normal cursor-pointer flex-1">
                Advanced - Experienced athlete
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
