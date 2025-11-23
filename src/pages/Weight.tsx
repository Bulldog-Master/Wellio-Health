import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Plus, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Weight = () => {
  const { toast } = useToast();
  const [morning, setMorning] = useState("");
  const [evening, setEvening] = useState("");

  const handleLogWeight = (period: "morning" | "evening") => {
    const weight = period === "morning" ? morning : evening;
    if (!weight) return;

    toast({
      title: "Weight logged",
      description: `${period.charAt(0).toUpperCase() + period.slice(1)} weight of ${weight} lbs has been recorded.`,
    });

    if (period === "morning") setMorning("");
    else setEvening("");
  };

  const recentWeights = [
    { date: "2024-01-15", morning: 166, evening: 168 },
    { date: "2024-01-14", morning: 167, evening: 169 },
    { date: "2024-01-13", morning: 167.5, evening: 169.5 },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Scale className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Weight Tracking</h1>
          <p className="text-muted-foreground">Monitor your daily weight changes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Current Progress</h3>
          </div>
          <p className="text-4xl font-bold mb-2">165 lbs</p>
          <p className="opacity-90">Down 2 lbs this week</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-2">Target</h3>
          <p className="text-4xl font-bold text-primary mb-2">155 lbs</p>
          <p className="text-muted-foreground">10 lbs to go</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">Log Today's Weight</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="morning">Morning Weight (lbs)</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="morning"
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={morning}
                  onChange={(e) => setMorning(e.target.value)}
                />
                <Button 
                  onClick={() => handleLogWeight("morning")}
                  disabled={!morning}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Log
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="evening">Evening Weight (lbs)</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="evening"
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={evening}
                  onChange={(e) => setEvening(e.target.value)}
                />
                <Button 
                  onClick={() => handleLogWeight("evening")}
                  disabled={!evening}
                  variant="secondary"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Log
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Weights</h3>
        <div className="space-y-3">
          {recentWeights.map((entry) => (
            <div key={entry.date} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <span className="font-medium">{entry.date}</span>
              <div className="flex gap-6 text-sm">
                <span className="text-muted-foreground">
                  Morning: <span className="font-semibold text-foreground">{entry.morning} lbs</span>
                </span>
                <span className="text-muted-foreground">
                  Evening: <span className="font-semibold text-foreground">{entry.evening} lbs</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Weight;
