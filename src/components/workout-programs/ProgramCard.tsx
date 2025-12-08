import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableProgramWorkout } from "./SortableProgramWorkout";
import { WorkoutProgram, Completion } from "./types";

interface ProgramCardProps {
  program: WorkoutProgram;
  completions: Completion[];
  progress: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleCompletion: (week: number, day: number) => void;
  onReorderWorkouts: (reorderedWorkouts: any[]) => void;
}

export const ProgramCard = ({
  program,
  completions,
  progress,
  onEdit,
  onDelete,
  onToggleCompletion,
  onReorderWorkouts
}: ProgramCardProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-workout-')[1]);
      const newIndex = parseInt(over.id.toString().split('-workout-')[1]);
      const reorderedWorkouts = arrayMove(program.workouts, oldIndex, newIndex);
      onReorderWorkouts(reorderedWorkouts);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold">{program.name}</h3>
          {program.description && (
            <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {program.duration_weeks} weeks • Started {program.start_date ? format(new Date(program.start_date), 'MMM dd, yyyy') : 'Not started'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {program.workouts && program.workouts.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center justify-between">
            <span>Workouts</span>
            <span className="text-xs text-muted-foreground font-normal">Drag to reorder</span>
          </h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={program.workouts.map((_: any, idx: number) => `program-${program.id}-workout-${idx}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {program.workouts.map((workout: any, idx: number) => {
                  const isCompleted = completions?.some(
                    c => c.week_number === workout.week && c.day_number === workout.day
                  );

                  return (
                    <SortableProgramWorkout
                      key={`program-${program.id}-workout-${idx}`}
                      id={`program-${program.id}-workout-${idx}`}
                      workout={workout}
                      isCompleted={isCompleted}
                      onToggle={() => onToggleCompletion(workout.week, workout.day)}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </Card>
  );
};
