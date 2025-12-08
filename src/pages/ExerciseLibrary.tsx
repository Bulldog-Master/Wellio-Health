import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Video, Filter } from "lucide-react";
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
import { 
  ExerciseCard, 
  ExerciseVideoDialog, 
  Exercise,
  categories, 
  difficulties, 
  sampleExercises 
} from "@/components/exercise-library";

const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['videos', 'common']);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filteredExercises = sampleExercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || exercise.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => setSelectedExercise(exercise)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">{t('no_exercises_found')}</h3>
          <p className="text-muted-foreground">{t('try_different_filters')}</p>
        </Card>
      )}

      <ExerciseVideoDialog
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );

  return (
    <SubscriptionGate feature="exercise_library">
      <ExerciseContent />
    </SubscriptionGate>
  );
};

export default ExerciseLibrary;
