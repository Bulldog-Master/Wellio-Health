import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, CheckCircle2, Clock, TrendingUp, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProgramExercise {
  id: string;
  week_number: number;
  day_number: number;
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  duration_minutes: number | null;
  notes: string | null;
  sort_order: number;
}

interface WorkoutProgram {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number | null;
  difficulty_level?: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Enrollment {
  id: string;
  current_week: number;
  current_day: number;
  status: string;
  started_at: string;
}

const WorkoutTemplateDetail = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (programId) {
      fetchProgramDetails();
      checkEnrollment();
    }
  }, [programId]);

  const fetchProgramDetails = async () => {
    try {
      const { data: programData, error: programError } = await supabase
        .from("workout_programs")
        .select("*")
        .eq("id", programId)
        .single();

      if (programError) throw programError;
      
      // Fetch profile separately
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", programData.user_id)
        .single();
      
      setProgram({ ...programData, profiles: profile });

      const { data: exercisesData, error: exercisesError } = await supabase
        .from("program_exercises")
        .select("*")
        .eq("program_id", programId)
        .order("week_number", { ascending: true })
        .order("day_number", { ascending: true })
        .order("sort_order", { ascending: true });

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("program_enrollments")
        .select("*")
        .eq("program_id", programId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      setEnrollment(data);
    } catch (error: any) {
      console.error("Error checking enrollment:", error);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to enroll");

      const { error } = await supabase
        .from("program_enrollments")
        .insert({
          user_id: user.id,
          program_id: programId,
          current_week: 1,
          current_day: 1,
          status: "active",
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "You've enrolled in this program",
      });

      checkEnrollment();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const groupExercisesByWeek = () => {
    const weeks: { [key: number]: { [key: number]: ProgramExercise[] } } = {};
    exercises.forEach((exercise) => {
      if (!weeks[exercise.week_number]) {
        weeks[exercise.week_number] = {};
      }
      if (!weeks[exercise.week_number][exercise.day_number]) {
        weeks[exercise.week_number][exercise.day_number] = [];
      }
      weeks[exercise.week_number][exercise.day_number].push(exercise);
    });
    return weeks;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Program not found</p>
            <Button onClick={() => navigate("/workout-templates")} className="mt-4">
              Back to Templates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weeklyExercises = groupExercisesByWeek();

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/workout-templates")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Templates
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{program.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                {program.difficulty_level && (
                  <Badge variant="secondary">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {program.difficulty_level}
                  </Badge>
                )}
                {program.duration_weeks && (
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    {program.duration_weeks} weeks
                  </Badge>
                )}
                {enrollment && (
                  <Badge className="bg-green-500/10 text-green-500">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Enrolled
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {program.description || "No description provided"}
              </p>
              <Separator className="my-4" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Created by</span>
                <span className="font-medium">
                  {program.profiles?.username || program.profiles?.full_name || "Anonymous"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Program Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(weeklyExercises).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No exercises added to this program yet
                </p>
              ) : (
                <Tabs defaultValue="week-1">
                  <TabsList className="mb-4">
                    {Object.keys(weeklyExercises).map((week) => (
                      <TabsTrigger key={week} value={`week-${week}`}>
                        Week {week}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {Object.entries(weeklyExercises).map(([week, days]) => (
                    <TabsContent key={week} value={`week-${week}`} className="space-y-4">
                      {Object.entries(days).map(([day, dayExercises]) => (
                        <Card key={day}>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Day {day}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {dayExercises.map((exercise) => (
                                <div
                                  key={exercise.id}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-medium">{exercise.exercise_name}</h4>
                                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                      {exercise.sets && (
                                        <span>{exercise.sets} sets</span>
                                      )}
                                      {exercise.reps && (
                                        <span>{exercise.reps} reps</span>
                                      )}
                                      {exercise.duration_minutes && (
                                        <span>{exercise.duration_minutes} min</span>
                                      )}
                                    </div>
                                    {exercise.notes && (
                                      <p className="text-sm text-muted-foreground mt-2">
                                        {exercise.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollment ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Enrolled</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Week {enrollment.current_week}, Day {enrollment.current_day}
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => navigate("/workout")}>
                    <Play className="mr-2 h-4 w-4" />
                    Continue Workout
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {enrolling ? "Enrolling..." : "Start Program"}
                </Button>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Program Details</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>• {program.duration_weeks || 0} weeks of training</p>
                  <p>• {Object.keys(weeklyExercises).length} weeks planned</p>
                  <p>• {exercises.length} total exercises</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTemplateDetail;