import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Footprints, Moon, Utensils, Target } from "lucide-react";

interface ReportHighlightsProps {
  highlights: string[];
}

export const ReportHighlights: React.FC<ReportHighlightsProps> = ({ highlights }) => {
  const { t } = useTranslation('fitness');

  const getHighlightMessage = (highlight: string) => {
    const messages: Record<string, { icon: React.ReactNode; message: string; color: string }> = {
      workout_streak: { 
        icon: <Trophy className="w-5 h-5" />, 
        message: t('highlight_workout_streak'),
        color: 'text-yellow-500'
      },
      workout_consistent: { 
        icon: <Award className="w-5 h-5" />, 
        message: t('highlight_workout_consistent'),
        color: 'text-blue-500'
      },
      steps_champion: { 
        icon: <Footprints className="w-5 h-5" />, 
        message: t('highlight_steps_champion'),
        color: 'text-green-500'
      },
      steps_active: { 
        icon: <Footprints className="w-5 h-5" />, 
        message: t('highlight_steps_active'),
        color: 'text-teal-500'
      },
      sleep_great: { 
        icon: <Moon className="w-5 h-5" />, 
        message: t('highlight_sleep_great'),
        color: 'text-purple-500'
      },
      nutrition_balanced: { 
        icon: <Utensils className="w-5 h-5" />, 
        message: t('highlight_nutrition_balanced'),
        color: 'text-orange-500'
      },
    };
    return messages[highlight] || { icon: <Target className="w-5 h-5" />, message: highlight, color: 'text-primary' };
  };

  if (highlights.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {t('weekly_highlights')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.map((highlight, index) => {
            const { icon, message, color } = getHighlightMessage(highlight);
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                <div className={color}>{icon}</div>
                <span className="font-medium">{message}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
