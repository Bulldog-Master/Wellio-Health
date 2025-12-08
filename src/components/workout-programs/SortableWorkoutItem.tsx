import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Trash2 } from "lucide-react";
import { SortableWorkoutItemProps } from "./types";

export const SortableWorkoutItem = ({ workout, idx, onUpdate, onDelete }: SortableWorkoutItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `workout-${idx}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Week</Label>
              <Input
                type="number"
                min="1"
                value={workout.week}
                onChange={(e) => onUpdate(idx, 'week', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label className="text-xs">Day</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={workout.day}
                onChange={(e) => onUpdate(idx, 'day', parseInt(e.target.value))}
              />
            </div>
          </div>
          <Input
            placeholder="Workout name"
            value={workout.name}
            onChange={(e) => onUpdate(idx, 'name', e.target.value)}
          />
          <Textarea
            placeholder="Exercises (one per line)"
            value={workout.exercises}
            onChange={(e) => onUpdate(idx, 'exercises', e.target.value)}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(idx)}
          className="self-start"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};
