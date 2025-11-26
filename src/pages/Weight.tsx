import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Plus, TrendingDown, ArrowLeft, Calendar as CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { formatWeight, parseWeight } from "@/lib/unitConversion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface WeightLog {
  id: string;
  weight_lbs: number;
  period: string;
  logged_at: string;
}

const Weight = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { preferredUnit, updatePreferredUnit, isLoading: prefsLoading } = useUserPreferences();
  const [morning, setMorning] = useState("");
  const [evening, setEvening] = useState("");
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null);

  useEffect(() => {
    fetchWeightLogs();
  }, []);

  const fetchWeightLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setWeightLogs(data || []);
    } catch (error) {
      console.error('Error fetching weight logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogWeight = async (period: "morning" | "evening") => {
    const weight = period === "morning" ? morning : evening;
    if (!weight) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to track your weight.",
          variant: "destructive",
        });
        return;
      }

      const weightLbs = parseWeight(weight, preferredUnit);

      const { error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: user.id,
          weight_lbs: weightLbs,
          period: period,
          logged_at: selectedDate.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Weight logged",
        description: `${period.charAt(0).toUpperCase() + period.slice(1)} weight has been recorded.`,
      });

      if (period === "morning") setMorning("");
      else setEvening("");
      
      fetchWeightLogs();
    } catch (error) {
      console.error('Error logging weight:', error);
      toast({
        title: "Error",
        description: "Failed to log weight. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditLog = async (log: WeightLog, newWeight: string) => {
    try {
      const weightLbs = parseWeight(newWeight, preferredUnit);
      
      const { error } = await supabase
        .from('weight_logs')
        .update({ weight_lbs: weightLbs })
        .eq('id', log.id);

      if (error) throw error;

      toast({
        title: "Weight updated",
        description: "Weight log has been updated successfully.",
      });
      
      setEditingLog(null);
      fetchWeightLogs();
    } catch (error) {
      console.error('Error updating weight:', error);
      toast({
        title: "Error",
        description: "Failed to update weight. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      toast({
        title: "Weight deleted",
        description: "Weight log has been removed.",
      });
      
      fetchWeightLogs();
    } catch (error) {
      console.error('Error deleting weight:', error);
      toast({
        title: "Error",
        description: "Failed to delete weight. Please try again.",
        variant: "destructive",
      });
    }
  };

  const groupedLogs = weightLogs.reduce((acc, log) => {
    const date = new Date(log.logged_at).toLocaleDateString();
    if (!acc[date]) acc[date] = {};
    acc[date][log.period] = log.weight_lbs;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const latestWeight = weightLogs.length > 0 ? weightLogs[0].weight_lbs : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Weight Tracking</h1>
            <p className="text-muted-foreground">Monitor your daily weight changes</p>
          </div>
        </div>
        
        <div className="w-32">
          <Select
            value={preferredUnit}
            onValueChange={(value) => updatePreferredUnit(value as 'imperial' | 'metric')}
            disabled={prefsLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="imperial">lbs</SelectItem>
              <SelectItem value="metric">kg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-primary text-primary-foreground shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Current Weight</h3>
          </div>
          <p className="text-4xl font-bold mb-2">
            {latestWeight > 0 ? formatWeight(latestWeight, preferredUnit) : 'No data'}
          </p>
          <p className="opacity-90">Latest recorded weight</p>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Logs</h3>
          <p className="text-4xl font-bold text-primary mb-2">{weightLogs.length}</p>
          <p className="text-muted-foreground">Weight entries tracked</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-card shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Log Weight</h3>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="morning">Morning Weight ({preferredUnit === 'imperial' ? 'lbs' : 'kg'})</Label>
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
              <Label htmlFor="evening">Evening Weight ({preferredUnit === 'imperial' ? 'lbs' : 'kg'})</Label>
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
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : Object.keys(groupedLogs).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No weight logs yet. Start tracking above!</p>
        ) : (
          <div className="space-y-3">
            {weightLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex-1">
                  <span className="font-medium">{new Date(log.logged_at).toLocaleDateString()}</span>
                  <span className="text-sm text-muted-foreground ml-3">
                    {log.period.charAt(0).toUpperCase() + log.period.slice(1)}
                  </span>
                </div>
                
                {editingLog?.id === log.id ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={formatWeight(log.weight_lbs, preferredUnit).split(' ')[0]}
                      className="w-24"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditLog(log, (e.target as HTMLInputElement).value);
                        }
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.activeElement as HTMLInputElement;
                      handleEditLog(log, input.value);
                    }}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingLog(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center">
                    <span className="font-semibold text-foreground">
                      {formatWeight(log.weight_lbs, preferredUnit)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLog(log)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLog(log.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Weight;
