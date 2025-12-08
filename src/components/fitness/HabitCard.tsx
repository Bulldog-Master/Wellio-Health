import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import type { Habit } from "@/hooks/fitness/useHabits";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: () => void;
  onDelete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  isCompleted, 
  onComplete, 
  onDelete 
}) => {
  return (
    <div className="p-4 bg-secondary rounded-lg flex items-center justify-between hover:bg-secondary/80 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <Button
          size="icon"
          variant={isCompleted ? "default" : "outline"}
          onClick={onComplete}
          disabled={isCompleted}
          className={isCompleted ? "bg-primary" : ""}
        >
          <Check className="w-4 h-4" />
        </Button>
        <div>
          <h4 className="font-semibold">{habit.name}</h4>
          {habit.description && (
            <p className="text-sm text-muted-foreground">{habit.description}</p>
          )}
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
