import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Dumbbell, Clock, TrendingUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  };
}

const WorkoutTemplates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("workout_programs")
        .select("*")
        .or(`is_public.eq.true,user_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const programsWithProfiles = await Promise.all(
        (data || []).map(async (program) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, full_name")
            .eq("id", program.user_id)
            .single();
          
          return { ...program, profiles: profile };
        })
      );
      
      setPrograms(programsWithProfiles);
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

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === "all" || program.difficulty_level === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case "beginner": return "bg-green-500/10 text-green-500";
      case "intermediate": return "bg-yellow-500/10 text-yellow-500";
      case "advanced": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workout Templates</h1>
          <p className="text-muted-foreground">Browse and start structured workout programs</p>
        </div>
        <Button onClick={() => navigate("/workout-programs")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {["all", "beginner", "intermediate", "advanced"].map((level) => (
            <Button
              key={level}
              variant={filterDifficulty === level ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterDifficulty(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filteredPrograms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No workout programs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((program) => (
            <Card
              key={program.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/workout-template/${program.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="line-clamp-1">{program.name}</CardTitle>
                  {!program.is_public && (
                    <Badge variant="secondary">Private</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {program.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {program.difficulty_level && (
                    <Badge className={getDifficultyColor(program.difficulty_level)}>
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
                </div>
                <div className="text-sm text-muted-foreground">
                  By {program.profiles?.username || program.profiles?.full_name || "Anonymous"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutTemplates;