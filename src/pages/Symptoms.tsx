import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Symptom {
  id: string;
  symptom_name: string;
  severity: number | null;
  description: string | null;
  logged_at: string | null;
}

const Symptoms = () => {
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [symptomName, setSymptomName] = useState("");
  const [severity, setSeverity] = useState([5]);
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSymptoms(data || []);
    } catch (error) {
      console.error('Error fetching symptoms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSymptom = async () => {
    if (!symptomName) {
      toast({
        title: "Missing information",
        description: "Please enter a symptom name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('symptoms')
        .insert({
          user_id: user.id,
          symptom_name: symptomName,
          severity: severity[0],
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: "Symptom logged",
        description: `${symptomName} has been recorded.`,
      });

      setSymptomName("");
      setSeverity([5]);
      setDescription("");
      fetchSymptoms();
    } catch (error) {
      console.error('Error logging symptom:', error);
      toast({
        title: "Error",
        description: "Failed to log symptom. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "text-green-500";
    if (severity <= 6) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <AlertCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Symptom Tracker</h1>
          <p className="text-muted-foreground">Monitor your health symptoms</p>
        </div>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-6">Log Symptom</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="symptom-name">Symptom Name</Label>
            <Input
              id="symptom-name"
              placeholder="e.g., Headache, Fatigue"
              value={symptomName}
              onChange={(e) => setSymptomName(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="severity">Severity: {severity[0]}/10</Label>
            <Slider
              id="severity"
              min={1}
              max={10}
              step={1}
              value={severity}
              onValueChange={setSeverity}
              className="mt-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Mild</span>
              <span>Severe</span>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 min-h-24"
            />
          </div>

          <Button onClick={handleAddSymptom} className="w-full gap-2">
            <Plus className="w-4 h-4" />
            Log Symptom
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-card shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Symptoms</h3>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : symptoms.length > 0 ? (
            symptoms.map((symptom) => (
              <div key={symptom.id} className="p-4 bg-secondary rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{symptom.symptom_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {symptom.logged_at && format(new Date(symptom.logged_at), "PPp")}
                    </p>
                  </div>
                  {symptom.severity && (
                    <span className={`font-bold ${getSeverityColor(symptom.severity)}`}>
                      {symptom.severity}/10
                    </span>
                  )}
                </div>
                {symptom.description && (
                  <p className="text-sm text-muted-foreground mt-2">{symptom.description}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No symptoms logged yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Symptoms;
