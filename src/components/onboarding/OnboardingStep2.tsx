import { TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OnboardingStep2Props {
  formData: {
    height: string;
    weight: string;
  };
  updateField: (field: string, value: string) => void;
}

export function OnboardingStep2({ formData, updateField }: OnboardingStep2Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Your measurements</h2>
        <p className="text-muted-foreground">This helps us personalize your experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="height">Height (inches)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => updateField("height", e.target.value)}
            placeholder="70"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Example: 5'10" = 70 inches
          </p>
        </div>

        <div>
          <Label htmlFor="weight">Current Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => updateField("weight", e.target.value)}
            placeholder="180"
          />
        </div>
      </div>
    </div>
  );
}
