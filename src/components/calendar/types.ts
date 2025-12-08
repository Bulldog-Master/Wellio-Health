export interface FitnessEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  is_recurring: boolean;
  color: string | null;
  completed: boolean;
  created_at: string;
}

export interface EventType {
  value: string;
  label: string;
  color: string;
}

export const eventTypes: EventType[] = [
  { value: "workout", label: "Workout", color: "bg-blue-500" },
  { value: "cardio", label: "Cardio", color: "bg-green-500" },
  { value: "meal", label: "Meal Prep", color: "bg-orange-500" },
  { value: "rest", label: "Rest Day", color: "bg-purple-500" },
  { value: "appointment", label: "Appointment", color: "bg-pink-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

export interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location: string;
}

export const initialEventFormData: EventFormData = {
  title: "",
  description: "",
  event_type: "workout",
  start_time: "",
  end_time: "",
  location: "",
};
