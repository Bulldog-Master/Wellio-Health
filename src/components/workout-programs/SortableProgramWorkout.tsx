import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle, Circle } from "lucide-react";
import { SortableProgramWorkoutProps } from "./types";

export const SortableProgramWorkout = ({ id, workout, isCompleted, onToggle }: SortableProgramWorkoutProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 border rounded-lg hover:bg-accent/50"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      <div
        className="flex items-center gap-2 flex-1 cursor-pointer"
        onClick={onToggle}
      >
        {isCompleted ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{workout.name}</p>
          <p className="text-xs text-muted-foreground">
            Week {workout.week}, Day {workout.day}
          </p>
        </div>
      </div>
    </div>
  );
};
