import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Dumbbell, Youtube, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Exercise } from "./types";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

export const ExerciseCard = ({ exercise, onClick }: ExerciseCardProps) => {
  const { t } = useTranslation('videos');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/10 text-green-500";
      case "intermediate": return "bg-yellow-500/10 text-yellow-500";
      case "advanced": return "bg-red-500/10 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
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
        <div className="absolute top-2 left-2 flex gap-1">
          {exercise.youtubeId && (
            <Badge variant="secondary" className="bg-red-600 text-white text-xs">
              <Youtube className="h-3 w-3" />
            </Badge>
          )}
          {exercise.externalUrl && (
            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
              <ExternalLink className="h-3 w-3" />
            </Badge>
          )}
        </div>
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
  );
};
