import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, CheckCircle2, Circle, Edit, Trash2, List, CalendarDays, Clock, Dumbbell } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface ScheduledWorkout {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  metadata: any;
  completed: boolean;
  created_at: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string | null;
  exercises: any;
}

const timeOfDayOptions = [
  { value: "morning", label: "Morning (6AM - 12PM)", icon: "🌅" },
  { value: "afternoon", label: "Afternoon (12PM - 6PM)", icon: "☀️" },
  { value: "evening", label: "Evening (6PM - 12AM)", icon: "🌙" },
];

const WorkoutSchedule = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    timeOfDay: "morning",
    exerciseType: "",
    duration: "",
    intensity: "medium",
    templateId: "",
  });

  useEffect(() => {
    fetchScheduledWorkouts();
    fetchTemplates();
    
    const channel = supabase
      .channel('scheduled_workouts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fitness_events' }, () => fetchScheduledWorkouts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentDate]);

  const fetchScheduledWorkouts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from("fitness_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("event_type", "workout")
        .gte("start_time", monthStart.toISOString())
        .lte("start_time", monthEnd.toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      setScheduledWorkouts(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("workout_routines")
        .select("id, name, description, exercises")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleScheduleWorkout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in");

      if (!formData.title || !formData.date) {
        toast({ title: "Error", description: "Title and date are required", variant: "destructive" });
        return;
      }

      const [year, month, day] = formData.date.split('-');
      let hour = 9; // default morning
      if (formData.timeOfDay === "afternoon") hour = 14;
      if (formData.timeOfDay === "evening") hour = 19;
      
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, 0, 0);
      const startTime = localDate.toISOString();

      const metadata = {
        timeOfDay: formData.timeOfDay,
        exerciseType: formData.exerciseType,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        intensity: formData.intensity,
        templateId: formData.templateId || undefined,
      };

      if (editingWorkout) {
        const { error } = await supabase
          .from("fitness_events")
          .update({
            title: formData.title,
            description: formData.description || null,
            start_time: startTime,
            metadata,
          })
          .eq("id", editingWorkout);

        if (error) throw error;
        toast({ title: "Success!", description: "Workout updated" });
      } else {
        const { error } = await supabase
          .from("fitness_events")
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            event_type: "workout",
            start_time: startTime,
            metadata,
            completed: false,
          });

        if (error) throw error;
        toast({ title: "Success!", description: "Workout scheduled" });
      }

      setIsDialogOpen(false);
      setEditingWorkout(null);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCompleteWorkout = async (workout: ScheduledWorkout) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark as completed
      const { error: updateError } = await supabase
        .from("fitness_events")
        .update({ completed: true })
        .eq("id", workout.id);

      if (updateError) throw updateError;

      // Save to activity history
      const metadata = workout.metadata || {};
      const { error: insertError } = await supabase
        .from("activity_logs")
        .insert({
          user_id: user.id,
          activity_type: metadata.exerciseType || workout.title,
          duration_minutes: metadata.duration || 30,
          logged_at: workout.start_time,
          time_of_day: metadata.timeOfDay || null,
          notes: workout.description || null,
        });

      if (insertError) throw insertError;

      toast({ title: "Great job!", description: "Workout completed and saved to history" });
      fetchScheduledWorkouts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fitness_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Workout removed from schedule" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditWorkout = (workout: ScheduledWorkout) => {
    const metadata = (workout.metadata as any) || {};
    setFormData({
      title: workout.title,
      description: workout.description || "",
      date: format(parseISO(workout.start_time), "yyyy-MM-dd"),
      timeOfDay: metadata.timeOfDay || "morning",
      exerciseType: metadata.exerciseType || "",
      duration: metadata.duration?.toString() || "",
      intensity: metadata.intensity || "medium",
      templateId: metadata.templateId || "",
    });
    setEditingWorkout(workout.id);
    setIsDialogOpen(true);
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Calculate total duration from exercises
      let totalDuration = 0;
      let exerciseTypes: string[] = [];
      
      if (template.exercises && Array.isArray(template.exercises)) {
        template.exercises.forEach((exercise: any) => {
          if (exercise.sets && exercise.reps) {
            // Estimate 2 minutes per set for strength exercises
            totalDuration += (exercise.sets * 2);
          }
          if (exercise.name) {
            exerciseTypes.push(exercise.name);
          }
        });
      }
      
      // If no duration calculated, default to 30
      if (totalDuration === 0) totalDuration = 30;
      
      setFormData(prev => ({
        ...prev,
        title: template.name,
        description: template.description || "",
        duration: totalDuration.toString(),
        exerciseType: exerciseTypes.slice(0, 3).join(", ") + (exerciseTypes.length > 3 ? "..." : ""),
        templateId: templateId,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      timeOfDay: "morning",
      exerciseType: "",
      duration: "",
      intensity: "medium",
      templateId: "",
    });
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  const getWorkoutsForDay = (day: Date) => {
    return scheduledWorkouts.filter(workout => 
      isSameDay(parseISO(workout.start_time), day)
    );
  };

  const getWeekWorkouts = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    
    return scheduledWorkouts.filter(workout => {
      const workoutDate = parseISO(workout.start_time);
      return isWithinInterval(workoutDate, { start: weekStart, end: weekEnd });
    });
  };

  const getTimeOfDayIcon = (timeOfDay: string) => {
    const option = timeOfDayOptions.find(o => o.value === timeOfDay);
    return option?.icon || "⏰";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Workout Schedule</h1>
            <p className="text-muted-foreground">Plan your workouts and track completion</p>
          </div>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Workout
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="calendar">
              <CalendarDays className="mr-2 h-4 w-4" /> Calendar
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" /> Weekly List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl">
                    {format(currentDate, "MMMM yyyy")}
                  </CardTitle>
                  <Button variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center font-semibold text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                  {getDaysInMonth().map(day => {
                    const workouts = getWorkoutsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-24 p-2 border rounded-lg ${
                          !isSameMonth(day, currentDate) ? "bg-muted/50" : "bg-card"
                        } ${isToday ? "border-primary" : "border-border"}`}
                      >
                        <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                        <div className="space-y-1">
                          {workouts.map(workout => (
                            <div
                              key={workout.id}
                              className={`text-xs p-1 rounded cursor-pointer ${
                                workout.completed ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
                              }`}
                              onClick={() => handleEditWorkout(workout)}
                            >
                              <div className="flex items-center gap-1">
                                {workout.completed ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                                <span className="truncate">{workout.title}</span>
                              </div>
                              {workout.metadata?.timeOfDay && (
                                <span className="ml-4">{getTimeOfDayIcon(workout.metadata.timeOfDay)}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl">
                    {format(startOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d")} - {format(endOfWeek(currentDate, { weekStartsOn: 0 }), "MMM d, yyyy")}
                  </CardTitle>
                  <Button variant="outline" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {getWeekWorkouts().length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No workouts scheduled this week</p>
                    ) : (
                      getWeekWorkouts().map(workout => {
                        const metadata = workout.metadata || {};
                        const timeOption = timeOfDayOptions.find(o => o.value === metadata.timeOfDay);
                        return (
                          <Card key={workout.id} className={workout.completed ? "border-success" : ""}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{workout.title}</h3>
                                    {workout.completed && (
                                      <Badge variant="outline" className="bg-success/20 text-success border-success">
                                        Completed
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <CalendarIcon className="h-4 w-4" />
                                      {format(parseISO(workout.start_time), "EEEE, MMM d, yyyy")}
                                    </div>
                                    {timeOption && (
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {timeOption.icon} {timeOption.label}
                                      </div>
                                    )}
                                    {metadata.duration && (
                                      <div className="flex items-center gap-2">
                                        <Dumbbell className="h-4 w-4" />
                                        {metadata.duration} minutes
                                      </div>
                                    )}
                                  </div>
                                  {workout.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{workout.description}</p>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {!workout.completed && (
                                    <Button size="sm" onClick={() => handleCompleteWorkout(workout)}>
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => handleEditWorkout(workout)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteWorkout(workout.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWorkout ? "Edit" : "Schedule"} Workout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {templates.length > 0 && (
                <div>
                  <Label>Load from Template</Label>
                  <Select value={formData.templateId} onValueChange={handleLoadTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Workout Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Upper Body Strength"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Time of Day *</Label>
                  <Select value={formData.timeOfDay} onValueChange={(v) => setFormData(prev => ({ ...prev, timeOfDay: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOfDayOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exercise Type</Label>
                  <Input
                    value={formData.exerciseType}
                    onChange={(e) => setFormData(prev => ({ ...prev, exerciseType: e.target.value }))}
                    placeholder="e.g., Weightlifting, Cardio"
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <Label>Intensity</Label>
                <Select value={formData.intensity} onValueChange={(v) => setFormData(prev => ({ ...prev, intensity: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="intense">Intense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add workout details, exercises, etc."
                  rows={4}
                />
              </div>

              <Button onClick={handleScheduleWorkout} className="w-full">
                {editingWorkout ? "Update" : "Schedule"} Workout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkoutSchedule;
