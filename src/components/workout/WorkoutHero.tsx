import { Button } from "@/components/ui/button";
import { Dumbbell, Library, BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import workoutHero from "@/assets/workout-hero.jpg";

interface WorkoutHeroProps {
  onShowLibrary: () => void;
  onShowSampleLibrary: () => void;
}

const WorkoutHero = ({ onShowLibrary, onShowSampleLibrary }: WorkoutHeroProps) => {
  const { t } = useTranslation(['workout', 'common']);
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl h-64 md:h-80">
      <img 
        src={workoutHero} 
        alt="Workout Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/80 via-emerald-600/70 to-teal-600/60" />
      <div className="relative h-full flex flex-col justify-center items-start p-6 md:p-10 text-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/activity")}
          className="absolute top-4 left-4 hover:bg-white/10 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-8 h-8 text-white drop-shadow-glow" />
          <span className="text-sm font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            {t('your_training')}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg">
          {t('workout_log')}
        </h1>
        <p className="text-lg md:text-xl text-white/95 mb-6 max-w-2xl drop-shadow-md">
          {t('track_exercises_build_library')}
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button 
            size="lg" 
            onClick={onShowLibrary}
            className="bg-white text-green-600 hover:bg-white/90 shadow-lg"
          >
            <Library className="w-4 h-4 mr-2" />
            {t('personal_library')}
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={onShowSampleLibrary}
            className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-green-600 backdrop-blur-sm transition-all"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {t('sample_library')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutHero;
