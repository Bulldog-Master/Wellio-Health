export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  exercise_category: string;
  record_type: string;
  record_value: number;
  record_unit: string;
  notes: string | null;
  video_url: string | null;
  achieved_at: string;
  created_at: string;
}

export interface PRHistory {
  id: string;
  previous_value: number;
  new_value: number;
  improvement_percentage: number | null;
  achieved_at: string;
}

export interface PRFormData {
  exercise_name: string;
  exercise_category: string;
  record_type: string;
  record_value: string;
  record_unit: string;
  notes: string;
  achieved_at: string;
}

export const exerciseCategories = [
  { value: "strength", label: "Strength", color: "bg-red-500", icon: "💪" },
  { value: "cardio", label: "Cardio", color: "bg-blue-500", icon: "🏃" },
  { value: "flexibility", label: "Flexibility", color: "bg-green-500", icon: "🧘" },
  { value: "endurance", label: "Endurance", color: "bg-orange-500", icon: "⚡" },
];

export const commonExercises: Record<string, string[]> = {
  strength: ["Bench Press", "Squat", "Deadlift", "Overhead Press", "Pull-ups", "Barbell Row"],
  cardio: ["5K Run", "10K Run", "Marathon", "Mile Run", "Cycling", "Swimming"],
  flexibility: ["Forward Fold", "Splits", "Bridge Hold", "Shoulder Flexibility"],
  endurance: ["Plank Hold", "Wall Sit", "Farmer's Carry", "Burpees"],
};

export const defaultFormData: PRFormData = {
  exercise_name: "",
  exercise_category: "strength",
  record_type: "weight",
  record_value: "",
  record_unit: "lbs",
  notes: "",
  achieved_at: new Date().toISOString().split('T')[0],
};
