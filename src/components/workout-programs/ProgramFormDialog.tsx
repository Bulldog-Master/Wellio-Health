import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
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
import { SortableWorkoutItem } from "./SortableWorkoutItem";
import { WorkoutFormData, WorkoutItem } from "./types";

interface ProgramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProgramId: string | null;
  initialData?: WorkoutFormData;
  onSave: (formData: WorkoutFormData) => Promise<boolean>;
}

const defaultFormData: WorkoutFormData = {
  name: "",
  description: "",
  duration_weeks: 4,
  workouts: []
};

export const ProgramFormDialog = ({
  open,
  onOpenChange,
  editingProgramId,
  initialData,
  onSave
}: ProgramFormDialogProps) => {
  const [formData, setFormData] = useState<WorkoutFormData>(initialData || defaultFormData);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);

      setFormData({
        ...formData,
        workouts: arrayMove(formData.workouts, oldIndex, newIndex)
      });
    }
  };

  const updateWorkout = (idx: number, field: string, value: any) => {
    const newWorkouts = [...formData.workouts];
    (newWorkouts[idx] as any)[field] = value;
    setFormData({ ...formData, workouts: newWorkouts });
  };

  const deleteWorkout = (idx: number) => {
    const newWorkouts = formData.workouts.filter((_, i) => i !== idx);
    setFormData({ ...formData, workouts: newWorkouts });
  };

  const addWorkout = () => {
    setFormData({
      ...formData,
      workouts: [
        ...formData.workouts,
        { week: 1, day: 1, name: "", exercises: "" }
      ]
    });
  };

  const handleSave = async () => {
    const success = await onSave(formData);
    if (success) {
      setFormData(defaultFormData);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(defaultFormData);
    } else if (initialData) {
      setFormData(initialData);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Program
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProgramId ? 'Edit' : 'Create'} Workout Program</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Program Name</Label>
            <Input
              placeholder="e.g., 12-Week Strength Builder"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe your program..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Duration (weeks)</Label>
            <Input
              type="number"
              min="1"
              value={formData.duration_weeks}
              onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Workouts</Label>
              <span className="text-xs text-muted-foreground">Drag to reorder</span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.workouts.map((_, idx) => `workout-${idx}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {formData.workouts.map((workout, idx) => (
                    <SortableWorkoutItem
                      key={`workout-${idx}`}
                      workout={workout}
                      idx={idx}
                      onUpdate={updateWorkout}
                      onDelete={deleteWorkout}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <Button variant="outline" size="sm" onClick={addWorkout} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </Button>
          </div>

          <Button onClick={handleSave} className="w-full">
            {editingProgramId ? 'Update' : 'Create'} Program
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
