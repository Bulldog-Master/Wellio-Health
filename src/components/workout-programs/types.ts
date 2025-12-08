export interface WorkoutProgram {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
  start_date: string | null;
  workouts: any[];
  is_active: boolean;
}

export interface Completion {
  week_number: number;
  day_number: number;
}

export interface WorkoutFormData {
  name: string;
  description: string;
  duration_weeks: number;
  workouts: WorkoutItem[];
}

export interface WorkoutItem {
  week: number;
  day: number;
  name: string;
  exercises: string;
}

export interface SortableWorkoutItemProps {
  workout: WorkoutItem;
  idx: number;
  onUpdate: (idx: number, field: string, value: any) => void;
  onDelete: (idx: number) => void;
}

export interface SortableProgramWorkoutProps {
  id: string;
  workout: any;
  isCompleted: boolean;
  onToggle: () => void;
}
