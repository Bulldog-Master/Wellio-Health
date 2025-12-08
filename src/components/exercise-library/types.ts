export interface Exercise {
  id: string;
  name: string;
  nameKey: string;
  category: string;
  difficulty: string;
  duration: string;
  equipment: string[];
  muscles: string[];
  thumbnailUrl: string;
  youtubeId?: string;
  uploadedVideoUrl?: string;
  externalUrl?: string;
}

export interface FilterOption {
  value: string;
  labelKey: string;
}

export const categories: FilterOption[] = [
  { value: "all", labelKey: "all_categories" },
  { value: "upper_body", labelKey: "upper_body" },
  { value: "lower_body", labelKey: "lower_body" },
  { value: "core", labelKey: "core" },
  { value: "cardio", labelKey: "cardio" },
  { value: "flexibility", labelKey: "flexibility" },
  { value: "full_body", labelKey: "full_body" }
];

export const difficulties: FilterOption[] = [
  { value: "all", labelKey: "all_categories" },
  { value: "beginner", labelKey: "beginner" },
  { value: "intermediate", labelKey: "intermediate" },
  { value: "advanced", labelKey: "advanced" }
];

export const sampleExercises: Exercise[] = [
  {
    id: "1",
    name: "Push-ups",
    nameKey: "pushups",
    category: "upper_body",
    difficulty: "beginner",
    duration: "5 min",
    equipment: [],
    muscles: ["chest", "triceps", "shoulders"],
    thumbnailUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400",
    youtubeId: "IODxDxX7oi4",
    externalUrl: "https://www.muscleandstrength.com/exercises/push-up.html"
  },
  {
    id: "2",
    name: "Squats",
    nameKey: "squats",
    category: "lower_body",
    difficulty: "beginner",
    duration: "5 min",
    equipment: [],
    muscles: ["quadriceps", "glutes", "hamstrings"],
    thumbnailUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400",
    youtubeId: "ultWZbUMPL8",
    externalUrl: "https://www.muscleandstrength.com/exercises/squat.html"
  },
  {
    id: "3",
    name: "Plank",
    nameKey: "plank",
    category: "core",
    difficulty: "beginner",
    duration: "3 min",
    equipment: [],
    muscles: ["core", "shoulders", "back"],
    thumbnailUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400",
    youtubeId: "ASdvN_XEl_c",
    externalUrl: "https://www.muscleandstrength.com/exercises/plank.html"
  },
  {
    id: "4",
    name: "Deadlift",
    nameKey: "deadlift",
    category: "full_body",
    difficulty: "intermediate",
    duration: "8 min",
    equipment: ["barbell", "weights"],
    muscles: ["back", "glutes", "hamstrings", "core"],
    thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
    youtubeId: "op9kVnSso6Q",
    externalUrl: "https://www.muscleandstrength.com/exercises/deadlift.html"
  },
  {
    id: "5",
    name: "Burpees",
    nameKey: "burpees",
    category: "cardio",
    difficulty: "intermediate",
    duration: "5 min",
    equipment: [],
    muscles: ["full_body"],
    thumbnailUrl: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400",
    youtubeId: "dZgVxmf6jkA",
    externalUrl: "https://www.muscleandstrength.com/exercises/burpee.html"
  },
  {
    id: "6",
    name: "Yoga Sun Salutation",
    nameKey: "sun_salutation",
    category: "flexibility",
    difficulty: "beginner",
    duration: "10 min",
    equipment: ["yoga_mat"],
    muscles: ["full_body"],
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    youtubeId: "73sjOu0g58M",
    externalUrl: "https://www.yogajournal.com/poses/sun-salutation/"
  }
];
