import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Exercise } from "./types";

interface ExerciseVideoDialogProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseVideoDialog = ({ exercise, onClose }: ExerciseVideoDialogProps) => {
  const { t } = useTranslation(['videos', 'common']);

  if (!exercise) return null;

  return (
    <Dialog open={!!exercise} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {t(`exercises.${exercise.nameKey}`)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {exercise.youtubeId && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${exercise.youtubeId}`}
                title={t(`exercises.${exercise.nameKey}`)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {exercise.uploadedVideoUrl && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <video
                controls
                className="w-full h-full"
                src={exercise.uploadedVideoUrl}
              >
                {t('videos:watch_tutorial')}
              </video>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">{t('muscles_targeted')}</h4>
              <div className="flex flex-wrap gap-1">
                {exercise.muscles.map(muscle => (
                  <Badge key={muscle} variant="outline">
                    {t(`muscles.${muscle}`)}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('equipment_needed')}</h4>
              <p className="text-muted-foreground">
                {exercise.equipment.length > 0 
                  ? exercise.equipment.map(eq => t(`equipment.${eq}`)).join(", ")
                  : t('no_equipment')}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {exercise.externalUrl && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open(exercise.externalUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('related_exercises')}
              </Button>
            )}
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={onClose}
            >
              {t('common:close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
