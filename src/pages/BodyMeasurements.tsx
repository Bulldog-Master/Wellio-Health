import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ruler, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { bodyMeasurementSchema, validateAndSanitize } from "@/lib/validationSchemas";

interface Measurement {
  id: string;
  measured_at: string;
  chest_inches: number | null;
  waist_inches: number | null;
  hips_inches: number | null;
  left_arm_inches: number | null;
  right_arm_inches: number | null;
  left_thigh_inches: number | null;
  right_thigh_inches: number | null;
  left_calf_inches: number | null;
  right_calf_inches: number | null;
  notes: string | null;
}

const BodyMeasurements = () => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    chest: "",
    waist: "",
    hips: "",
    left_arm: "",
    right_arm: "",
    left_thigh: "",
    right_thigh: "",
    left_calf: "",
    right_calf: "",
    notes: ""
  });

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: true });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
      toast.error('Failed to load measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Validate measurements
      const validation = validateAndSanitize(bodyMeasurementSchema, {
        chest_inches: formData.chest ? parseFloat(formData.chest) : null,
        waist_inches: formData.waist ? parseFloat(formData.waist) : null,
        hips_inches: formData.hips ? parseFloat(formData.hips) : null,
        left_arm_inches: formData.left_arm ? parseFloat(formData.left_arm) : null,
        right_arm_inches: formData.right_arm ? parseFloat(formData.right_arm) : null,
        left_thigh_inches: formData.left_thigh ? parseFloat(formData.left_thigh) : null,
        right_thigh_inches: formData.right_thigh ? parseFloat(formData.right_thigh) : null,
        left_calf_inches: formData.left_calf ? parseFloat(formData.left_calf) : null,
        right_calf_inches: formData.right_calf ? parseFloat(formData.right_calf) : null,
        notes: formData.notes || undefined,
      });

      if (validation.success === false) {
        toast.error(validation.error);
        return;
      }

      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          ...validation.data,
        });

      if (error) throw error;

      toast.success('Measurements recorded!');
      setFormData({
        chest: "", waist: "", hips: "", left_arm: "", right_arm: "",
        left_thigh: "", right_thigh: "", left_calf: "", right_calf: "", notes: ""
      });
      fetchMeasurements();
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast.error('Failed to save measurements');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('body_measurements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Measurement deleted');
      fetchMeasurements();
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast.error('Failed to delete measurement');
    }
  };

  const chartData = measurements.map(m => ({
    date: format(new Date(m.measured_at), 'MMM dd'),
    chest: m.chest_inches,
    waist: m.waist_inches,
    hips: m.hips_inches
  }));

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2 p-4 border border-border rounded-lg">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Ruler className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Body Measurements</h1>
          <p className="text-muted-foreground">Track your body measurements over time</p>
        </div>
      </div>

      {/* Add Measurement Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Log New Measurements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Chest (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="36.0"
              value={formData.chest}
              onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
            />
          </div>
          <div>
            <Label>Waist (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="32.0"
              value={formData.waist}
              onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
            />
          </div>
          <div>
            <Label>Hips (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="38.0"
              value={formData.hips}
              onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
            />
          </div>
          <div>
            <Label>Left Arm (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="14.0"
              value={formData.left_arm}
              onChange={(e) => setFormData({ ...formData, left_arm: e.target.value })}
            />
          </div>
          <div>
            <Label>Right Arm (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="14.0"
              value={formData.right_arm}
              onChange={(e) => setFormData({ ...formData, right_arm: e.target.value })}
            />
          </div>
          <div>
            <Label>Left Thigh (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="22.0"
              value={formData.left_thigh}
              onChange={(e) => setFormData({ ...formData, left_thigh: e.target.value })}
            />
          </div>
          <div>
            <Label>Right Thigh (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="22.0"
              value={formData.right_thigh}
              onChange={(e) => setFormData({ ...formData, right_thigh: e.target.value })}
            />
          </div>
          <div>
            <Label>Left Calf (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="15.0"
              value={formData.left_calf}
              onChange={(e) => setFormData({ ...formData, left_calf: e.target.value })}
            />
          </div>
          <div>
            <Label>Right Calf (inches)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="15.0"
              value={formData.right_calf}
              onChange={(e) => setFormData({ ...formData, right_calf: e.target.value })}
            />
          </div>
        </div>
        <div className="mb-4">
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Add any notes about your measurements..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <Button onClick={handleSubmit} className="gap-2">
          <Plus className="w-4 h-4" />
          Save Measurements
        </Button>
      </Card>

      {/* Charts */}
      {measurements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Measurement Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" label={{ value: 'Inches', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="chest" stroke="#8884d8" name="Chest" />
              <Line type="monotone" dataKey="waist" stroke="#82ca9d" name="Waist" />
              <Line type="monotone" dataKey="hips" stroke="#ffc658" name="Hips" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Measurement History</h3>
        {measurements.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No measurements recorded yet</p>
        ) : (
          <div className="space-y-2">
            {measurements.slice().reverse().map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{format(new Date(m.measured_at), 'PPP')}</p>
                  <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                    {m.chest_inches && <span>Chest: {m.chest_inches}"</span>}
                    {m.waist_inches && <span>Waist: {m.waist_inches}"</span>}
                    {m.hips_inches && <span>Hips: {m.hips_inches}"</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(m.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BodyMeasurements;
