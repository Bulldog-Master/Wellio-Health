import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Search, 
  Play, 
  Clock, 
  Dumbbell,
  Filter,
  Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Exercise {
  id: string;
  name: string;
  nameKey: string;
  category: string;
  difficulty: string;
  duration: string;
  equipment: string[];
  muscles: string[];
  thumbnailUrl: string;
  videoUrl: string;
}

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['videos', 'common', 'fitness']);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // Sample exercise data - in production this would come from database
  // Using translation keys for muscles and equipment
  const exercises: Exercise[] = [
    {
      id: "1",
      name: "Push-ups",
      nameKey: "pushups",
      category: "upper_body",
      difficulty: "beginner",
      duration: "5 min",
      equipment: [],
      muscles: ["chest", "triceps", "shoulders"],
      thumbnailUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400",
      videoUrl: "#"
    },
    {
      id: "2",
      name: "Squats",
      nameKey: "squats",
      category: "lower_body",
      difficulty: "beginner",
      duration: "5 min",
      equipment: [],
      muscles: ["quadriceps", "glutes", "hamstrings"],
      thumbnailUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400",
      videoUrl: "#"
    },
    {
      id: "3",
      name: "Plank",
      nameKey: "plank",
      category: "core",
      difficulty: "beginner",
      duration: "3 min",
      equipment: [],
      muscles: ["core", "shoulders", "back"],
      thumbnailUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400",
      videoUrl: "#"
    },
    {
      id: "4",
      name: "Deadlift",
      nameKey: "deadlift",
      category: "full_body",
      difficulty: "intermediate",
      duration: "8 min",
      equipment: ["barbell", "weights"],
      muscles: ["back", "glutes", "hamstrings", "core"],
      thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
      videoUrl: "#"
    },
    {
      id: "5",
      name: "Burpees",
      nameKey: "burpees",
      category: "cardio",
      difficulty: "intermediate",
      duration: "5 min",
      equipment: [],
      muscles: ["full_body"],
      thumbnailUrl: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400",
      videoUrl: "#"
    },
    {
      id: "6",
      name: "Yoga Sun Salutation",
      nameKey: "sun_salutation",
      category: "flexibility",
      difficulty: "beginner",
      duration: "10 min",
      equipment: ["yoga_mat"],
      muscles: ["full_body"],
      thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
      videoUrl: "#"
    }
  ];

  const categories = [
    { value: "all", labelKey: "all_categories" },
    { value: "upper_body", labelKey: "upper_body" },
    { value: "lower_body", labelKey: "lower_body" },
    { value: "core", labelKey: "core" },
    { value: "cardio", labelKey: "cardio" },
    { value: "flexibility", labelKey: "flexibility" },
    { value: "full_body", labelKey: "full_body" }
  ];

  const difficulties = [
    { value: "all", labelKey: "all_categories" },
    { value: "beginner", labelKey: "beginner" },
    { value: "intermediate", labelKey: "intermediate" },
    { value: "advanced", labelKey: "advanced" }
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || exercise.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/10 text-green-500";
      case "intermediate": return "bg-yellow-500/10 text-yellow-500";
      case "advanced": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const ExerciseContent = () => (
    <div className="space-y-6 max-w-4xl pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/activity')}
          className="shrink-0"
          aria-label={t('common:back')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('exercise_library')}</h1>
            <p className="text-muted-foreground">{t('exercise_library_desc')}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search_exercises')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('filter_by_category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {t(cat.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={t('filter_by_difficulty')} />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(diff => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {t(diff.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Exercise Count */}
      <p className="text-sm text-muted-foreground">
        {t('exercise_count', { count: filteredExercises.length })}
      </p>

      {/* Exercise Grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map(exercise => (
            <Card 
              key={exercise.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="relative aspect-video">
                <img 
                  src={exercise.thumbnailUrl} 
                  alt={exercise.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="rounded-full">
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
                <Badge className={`absolute top-2 right-2 ${getDifficultyColor(exercise.difficulty)}`}>
                  {t(exercise.difficulty)}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{t(`exercises.${exercise.nameKey}`)}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {exercise.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    {exercise.equipment.length > 0 
                      ? exercise.equipment.map(eq => t(`equipment.${eq}`)).join(", ") 
                      : t('no_equipment')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {exercise.muscles.slice(0, 3).map(muscle => (
                    <Badge key={muscle} variant="outline" className="text-xs">
                      {t(`muscles.${muscle}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">{t('no_exercises_found')}</h3>
          <p className="text-muted-foreground">{t('try_different_filters')}</p>
        </Card>
      )}
    </div>
  );

  return (
    <SubscriptionGate feature="exercise_library">
      <ExerciseContent />
    </SubscriptionGate>
  );
};

export default ExerciseLibrary;
