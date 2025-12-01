import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, TrendingUp, Plus, Calendar, Target, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";

interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  exercise_category: string;
  record_type: string;
  record_value: number;
  record_unit: string;
  notes: string | null;
  video_url: string | null;
  achieved_at: string;
  created_at: string;
}

interface PRHistory {
  id: string;
  previous_value: number;
  new_value: number;
  improvement_percentage: number | null;
  achieved_at: string;
}

const exerciseCategories = [
  { value: "strength", label: "Strength", color: "bg-red-500", icon: "💪" },
  { value: "cardio", label: "Cardio", color: "bg-blue-500", icon: "🏃" },
  { value: "flexibility", label: "Flexibility", color: "bg-green-500", icon: "🧘" },
  { value: "endurance", label: "Endurance", color: "bg-orange-500", icon: "⚡" },
];

const commonExercises = {
  strength: ["Bench Press", "Squat", "Deadlift", "Overhead Press", "Pull-ups", "Barbell Row"],
  cardio: ["5K Run", "10K Run", "Marathon", "Mile Run", "Cycling", "Swimming"],
  flexibility: ["Forward Fold", "Splits", "Bridge Hold", "Shoulder Flexibility"],
  endurance: ["Plank Hold", "Wall Sit", "Farmer's Carry", "Burpees"],
};

const PersonalRecords = () => {
  const { toast } = useToast();
  const { t } = useTranslation(['records', 'errors']);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [history, setHistory] = useState<{ [key: string]: PRHistory[] }>({});
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
  const [formData, setFormData] = useState({
    exercise_name: "",
    exercise_category: "strength",
    record_type: "weight",
    record_value: "",
    record_unit: "lbs",
    notes: "",
    achieved_at: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel('pr_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_records'
        },
        () => fetchRecords()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: recordsData, error: recordsError } = await supabase
        .from("personal_records")
        .select("*")
        .eq("user_id", user.id)
        .order("achieved_at", { ascending: false });

      if (recordsError) throw recordsError;
      setRecords(recordsData || []);

      // Fetch history for each record
      if (recordsData && recordsData.length > 0) {
        const historyMap: { [key: string]: PRHistory[] } = {};
        
        for (const record of recordsData) {
          const { data: historyData } = await supabase
            .from("pr_history")
            .select("*")
            .eq("pr_id", record.id)
            .order("achieved_at", { ascending: false })
            .limit(5);
          
          if (historyData) {
            historyMap[record.id] = historyData;
          }
        }
        
        setHistory(historyMap);
      }
    } catch (error: any) {
      toast({
        title: t('records:error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in");

      if (!formData.exercise_name || !formData.record_value) {
        toast({
          title: t('records:error'),
          description: t('records:name_value_required'),
          variant: "destructive",
        });
        return;
      }

      const recordValue = parseFloat(formData.record_value);

      if (editingRecord) {
        // Update existing record
        const previousValue = editingRecord.record_value;
        
        // Save to history if value improved
        if (recordValue > previousValue) {
          const improvement = ((recordValue - previousValue) / previousValue) * 100;
          
          await supabase.from("pr_history").insert({
            user_id: user.id,
            pr_id: editingRecord.id,
            previous_value: previousValue,
            new_value: recordValue,
            improvement_percentage: improvement,
          });

          // Trigger celebration
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        const { error } = await supabase
          .from("personal_records")
          .update({
            exercise_name: formData.exercise_name,
            exercise_category: formData.exercise_category,
            record_type: formData.record_type,
            record_value: recordValue,
            record_unit: formData.record_unit,
            notes: formData.notes || null,
            achieved_at: formData.achieved_at,
          })
          .eq("id", editingRecord.id);

        if (error) throw error;

        toast({
          title: recordValue > previousValue ? t('records:new_pr') : t('records:record_updated'),
          description: recordValue > previousValue 
            ? t('records:improvement_message', { percent: ((recordValue - previousValue) / previousValue * 100).toFixed(1) })
            : t('records:record_updated_message'),
        });
      } else {
        // Create new record
        const { error } = await supabase
          .from("personal_records")
          .insert({
            user_id: user.id,
            exercise_name: formData.exercise_name,
            exercise_category: formData.exercise_category,
            record_type: formData.record_type,
            record_value: recordValue,
            record_unit: formData.record_unit,
            notes: formData.notes || null,
            achieved_at: formData.achieved_at,
          });

        if (error) throw error;

        // Trigger celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast({
          title: t('records:new_pr'),
          description: t('records:keep_crushing'),
        });
      }

      setIsDialogOpen(false);
      setEditingRecord(null);
      setFormData({
        exercise_name: "",
        exercise_category: "strength",
        record_type: "weight",
        record_value: "",
        record_unit: "lbs",
        notes: "",
        achieved_at: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      toast({
        title: t('records:error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: PersonalRecord) => {
    setEditingRecord(record);
    setFormData({
      exercise_name: record.exercise_name,
      exercise_category: record.exercise_category,
      record_type: record.record_type,
      record_value: record.record_value.toString(),
      record_unit: record.record_unit,
      notes: record.notes || "",
      achieved_at: record.achieved_at.split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("personal_records")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: t('records:deleted'),
        description: t('records:record_removed'),
      });
    } catch (error: any) {
      toast({
        title: t('records:error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredRecords = records.filter((record) => 
    filterCategory === "all" || record.exercise_category === filterCategory
  );

  const groupedRecords = filteredRecords.reduce((acc: { [key: string]: PersonalRecord[] }, record) => {
    if (!acc[record.exercise_category]) {
      acc[record.exercise_category] = [];
    }
    acc[record.exercise_category].push(record);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            {t('records:personal_records')}
          </h1>
          <p className="text-muted-foreground">{t('records:track_best_performances')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingRecord(null);
            setFormData({
              exercise_name: "",
              exercise_category: "strength",
              record_type: "weight",
              record_value: "",
              record_unit: "lbs",
              notes: "",
              achieved_at: new Date().toISOString().split('T')[0],
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('records:add_pr')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? t('records:update_record') : t('records:add_record')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('records:exercise_category')}</Label>
                <Select
                  value={formData.exercise_category}
                  onValueChange={(value) => {
                    setFormData({ 
                      ...formData, 
                      exercise_category: value,
                      exercise_name: "" 
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {t(`records:${cat.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('records:exercise_name')}</Label>
                <Select
                  value={formData.exercise_name}
                  onValueChange={(value) => setFormData({ ...formData, exercise_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('records:select_or_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {commonExercises[formData.exercise_category as keyof typeof commonExercises]?.map((exercise) => (
                      <SelectItem key={exercise} value={exercise}>
                        {exercise}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="mt-2"
                  placeholder={t('records:or_enter_custom')}
                  value={formData.exercise_name}
                  onChange={(e) => setFormData({ ...formData, exercise_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('records:record_type')}</Label>
                  <Select
                    value={formData.record_type}
                    onValueChange={(value) => setFormData({ ...formData, record_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">{t('records:weight')}</SelectItem>
                      <SelectItem value="reps">{t('records:reps')}</SelectItem>
                      <SelectItem value="time">{t('records:time')}</SelectItem>
                      <SelectItem value="distance">{t('records:distance')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('records:unit')}</Label>
                  <Select
                    value={formData.record_unit}
                    onValueChange={(value) => setFormData({ ...formData, record_unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.record_type === "weight" && (
                        <>
                          <SelectItem value="lbs">{t('records:lbs')}</SelectItem>
                          <SelectItem value="kg">{t('records:kg')}</SelectItem>
                        </>
                      )}
                      {formData.record_type === "time" && (
                        <>
                          <SelectItem value="seconds">{t('records:seconds')}</SelectItem>
                          <SelectItem value="minutes">{t('records:minutes')}</SelectItem>
                          <SelectItem value="hours">{t('records:hours')}</SelectItem>
                        </>
                      )}
                      {formData.record_type === "distance" && (
                        <>
                          <SelectItem value="miles">{t('records:miles')}</SelectItem>
                          <SelectItem value="km">{t('records:km')}</SelectItem>
                          <SelectItem value="meters">{t('records:meters')}</SelectItem>
                        </>
                      )}
                      {formData.record_type === "reps" && (
                        <SelectItem value="reps">{t('records:reps')}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t('records:value')}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.record_value}
                  onChange={(e) => setFormData({ ...formData, record_value: e.target.value })}
                  placeholder={t('records:placeholder_value')}
                />
              </div>

              <div>
                <Label>{t('records:date_achieved')}</Label>
                <Input
                  type="date"
                  value={formData.achieved_at}
                  onChange={(e) => setFormData({ ...formData, achieved_at: e.target.value })}
                />
              </div>

              <div>
                <Label>{t('records:notes_optional')}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('records:placeholder_notes')}
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingRecord ? t('records:update') : t('records:add')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={filterCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("all")}
        >
          {t('records:all')}
        </Button>
        {exerciseCategories.map((cat) => (
          <Button
            key={cat.value}
            variant={filterCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(cat.value)}
          >
            {cat.icon} {t(`records:${cat.value}`)}
          </Button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('records:no_records_yet')}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              {t('records:start_tracking')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([category, categoryRecords]) => {
            const categoryInfo = exerciseCategories.find(c => c.value === category);
            
            return (
              <div key={category}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>{categoryInfo?.icon}</span>
                  {t(`records:${categoryInfo?.value}`)}
                  <Badge variant="secondary">{categoryRecords.length}</Badge>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryRecords.map((record) => (
                    <Card key={record.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              {record.exercise_name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {record.record_type.charAt(0).toUpperCase() + record.record_type.slice(1)} PR
                            </CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-2">
                          {record.record_value} {record.record_unit}
                        </div>
                        
                        {history[record.id] && history[record.id].length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-green-600 mb-3">
                            <TrendingUp className="h-4 w-4" />
                            <span>
                              {t('records:improved_by', { percent: history[record.id][0].improvement_percentage?.toFixed(1) })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(record.achieved_at), 'MMM d, yyyy')}
                        </div>

                        {record.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {record.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PersonalRecords;