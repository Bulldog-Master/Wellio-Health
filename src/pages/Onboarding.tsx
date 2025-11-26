import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Target, Activity, TrendingUp } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "leaner",
    fitness_level: "beginner",
    target_weight: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          target_weight: parseFloat(formData.target_weight),
          goal: formData.goal,
          fitness_level: formData.fitness_level,
          onboarding_completed: true,
          height_unit: "inches",
          weight_unit: "lbs",
          target_weight_unit: "lbs",
        })
        .eq("id", user.id);

      if (error) throw error;

      // Request notification permissions
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      toast.success("Welcome to your fitness journey!");
      navigate("/");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.full_name || !formData.age || !formData.gender)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (step === 2 && (!formData.height || !formData.weight)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 md:p-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded ${
                  s < step ? "bg-primary" : s === step ? "bg-primary/60" : "bg-muted"
                } ${s !== 4 ? "mr-2" : ""}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {step} of 4
          </p>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <Activity className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Let's get to know you</h2>
              <p className="text-muted-foreground">Tell us a bit about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateField("age", e.target.value)}
                    placeholder="25"
                  />
                </div>

                <div>
                  <Label>Gender</Label>
                  <RadioGroup value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Measurements */}
        {step === 2 && (
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
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
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
        )}

        {/* Step 4: Reminders */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <Activity className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Stay on track</h2>
              <p className="text-muted-foreground">
                We'll send you helpful reminders to keep you motivated
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">📱 Enable Notifications</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get gentle reminders for meals, workouts, and weigh-ins to stay consistent
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if ("Notification" in window) {
                      const permission = await Notification.requestPermission();
                      if (permission === "granted") {
                        toast.success("Notifications enabled!");
                      }
                    }
                  }}
                >
                  Allow Notifications
                </Button>
              </Card>

              <div className="text-sm text-muted-foreground">
                You can customize your reminder preferences anytime in Settings
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {step < 4 ? (
            <Button onClick={nextStep} className="ml-auto">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={loading} className="ml-auto">
              {loading ? "Completing..." : "Get Started!"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
