import { z } from "zod";

// ============= AUTH SCHEMAS =============
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: nameSchema,
  userRole: z.enum(['user', 'trainer', 'creator'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const totpCodeSchema = z
  .string()
  .length(6, "Code must be exactly 6 digits")
  .regex(/^\d+$/, "Code must contain only numbers");

export const backupCodeSchema = z
  .string()
  .trim()
  .min(8, "Backup code must be at least 8 characters")
  .max(32, "Backup code must be less than 32 characters")
  .regex(/^[A-Z0-9]+$/, "Invalid backup code format");

// ============= MEDICAL SCHEMAS =============
export const medicationSchema = z.object({
  medication_name: z
    .string()
    .trim()
    .min(1, "Medication name is required")
    .max(200, "Medication name must be less than 200 characters"),
  dosage: z
    .string()
    .trim()
    .min(1, "Dosage is required")
    .max(50, "Dosage must be less than 50 characters")
    .regex(/^[\d\.\s]+(mg|g|ml|mcg|IU|units?)?$/i, "Invalid dosage format (e.g., 100mg, 2.5ml)"),
  frequency: z
    .string()
    .trim()
    .min(1, "Frequency is required")
    .max(100, "Frequency must be less than 100 characters"),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((date) => new Date(date) <= new Date(), {
      message: "Start date cannot be in the future",
    }),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

export const testResultSchema = z.object({
  test_name: z
    .string()
    .trim()
    .min(1, "Test name is required")
    .max(200, "Test name must be less than 200 characters"),
  test_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((date) => new Date(date) <= new Date(), {
      message: "Test date cannot be in the future",
    }),
  result_value: z
    .string()
    .max(100, "Result value must be less than 100 characters")
    .optional(),
  result_unit: z
    .string()
    .max(50, "Result unit must be less than 50 characters")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

export const medicalRecordSchema = z.object({
  record_name: z
    .string()
    .trim()
    .min(1, "Record name is required")
    .max(200, "Record name must be less than 200 characters"),
  record_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((date) => new Date(date) <= new Date(), {
      message: "Record date cannot be in the future",
    }),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category must be less than 100 characters"),
  notes: z
    .string()
    .max(2000, "Notes must be less than 2000 characters")
    .optional(),
});

export const symptomSchema = z.object({
  symptom_name: z
    .string()
    .trim()
    .min(1, "Symptom name is required")
    .max(200, "Symptom name must be less than 200 characters"),
  severity: z
    .number()
    .min(1, "Severity must be at least 1")
    .max(10, "Severity must be at most 10"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
});

// ============= NUTRITION SCHEMAS =============
export const foodLogSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'fast']),
  food_name: z
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters"),
  calories: z
    .number()
    .min(0, "Calories cannot be negative")
    .max(10000, "Calories seems too high"),
  protein_grams: z
    .number()
    .min(0, "Protein cannot be negative")
    .max(500, "Protein value seems too high")
    .optional(),
  carbs_grams: z
    .number()
    .min(0, "Carbs cannot be negative")
    .max(1000, "Carbs value seems too high")
    .optional(),
  fat_grams: z
    .number()
    .min(0, "Fat cannot be negative")
    .max(500, "Fat value seems too high")
    .optional(),
  logged_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, "Invalid date format"),
});

export const mealSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters")
    .max(100, "Search query must be less than 100 characters"),
});

// ============= PROFILE SCHEMAS =============
export const profileUpdateSchema = z.object({
  full_name: nameSchema.optional(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(13, "You must be at least 13 years old")
    .max(120, "Invalid age")
    .optional(),
  weight: z
    .number()
    .min(20, "Weight seems too low")
    .max(500, "Weight seems too high")
    .optional(),
  height: z
    .number()
    .min(50, "Height seems too low")
    .max(300, "Height seems too high")
    .optional(),
});

// ============= WORKOUT SCHEMAS =============
export const workoutLogSchema = z.object({
  workout_type: z
    .string()
    .trim()
    .min(1, "Workout type is required")
    .max(100, "Workout type must be less than 100 characters"),
  duration_minutes: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration seems too long (max 10 hours)"),
  calories_burned: z
    .number()
    .int("Calories must be a whole number")
    .min(0, "Calories cannot be negative")
    .max(5000, "Calories burned seems too high")
    .optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

// ============= BOOKING SCHEMAS =============
export const bookingSchema = z.object({
  trainer_id: z.string().uuid("Invalid trainer ID"),
  booking_type: z.enum(['session', 'program', 'consultation']),
  start_time: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Booking time must be in the future",
  }),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// ============= CONTACT/SUPPORT SCHEMAS =============
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .trim()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

// ============= URL/LINK SCHEMAS =============
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .max(500, "URL must be less than 500 characters");

// ============= TRAINER SCHEMAS =============
export const trainerProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .min(50, "Bio must be at least 50 characters")
    .max(2000, "Bio must be less than 2000 characters"),
  hourly_rate: z
    .number()
    .min(10, "Hourly rate must be at least $10")
    .max(1000, "Hourly rate must be less than $1000"),
  experience_years: z
    .number()
    .int("Experience years must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(50, "Experience seems too high"),
  location: z
    .string()
    .trim()
    .max(200, "Location must be less than 200 characters")
    .optional(),
  specialties: z
    .array(z.string().trim().max(100, "Specialty name too long"))
    .max(10, "Maximum 10 specialties allowed")
    .optional(),
  certifications: z
    .array(z.string().trim().max(150, "Certification name too long"))
    .max(15, "Maximum 15 certifications allowed")
    .optional(),
});

// ============= BODY MEASUREMENT SCHEMAS =============
export const bodyMeasurementSchema = z.object({
  chest_inches: z
    .number()
    .min(10, "Measurement seems too small")
    .max(100, "Measurement seems too large")
    .optional()
    .nullable(),
  waist_inches: z
    .number()
    .min(10, "Measurement seems too small")
    .max(100, "Measurement seems too large")
    .optional()
    .nullable(),
  hips_inches: z
    .number()
    .min(10, "Measurement seems too small")
    .max(100, "Measurement seems too large")
    .optional()
    .nullable(),
  left_arm_inches: z
    .number()
    .min(5, "Measurement seems too small")
    .max(50, "Measurement seems too large")
    .optional()
    .nullable(),
  right_arm_inches: z
    .number()
    .min(5, "Measurement seems too small")
    .max(50, "Measurement seems too large")
    .optional()
    .nullable(),
  left_thigh_inches: z
    .number()
    .min(5, "Measurement seems too small")
    .max(50, "Measurement seems too large")
    .optional()
    .nullable(),
  right_thigh_inches: z
    .number()
    .min(5, "Measurement seems too small")
    .max(50, "Measurement seems too large")
    .optional()
    .nullable(),
  left_calf_inches: z
    .number()
    .min(5, "Measurement seems too small")
    .max(50, "Measurement seems too large")
    .optional()
    .nullable(),
  right_calf_inches: z
    .number()
    .min(5, "Measurement seems too small")
    .max(50, "Measurement seems too large")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
}).refine((data) => {
  // At least one measurement must be provided
  const measurements = [
    data.chest_inches, data.waist_inches, data.hips_inches,
    data.left_arm_inches, data.right_arm_inches,
    data.left_thigh_inches, data.right_thigh_inches,
    data.left_calf_inches, data.right_calf_inches
  ];
  return measurements.some(m => m !== null && m !== undefined);
}, {
  message: "At least one measurement is required",
});

// ============= WEIGHT TRACKING SCHEMAS =============
export const weightLogSchema = z.object({
  weight_lbs: z
    .number()
    .min(50, "Weight seems too low")
    .max(1000, "Weight seems too high"),
  period: z.enum(['morning', 'evening']),
});

// ============= HABIT SCHEMAS =============
export const habitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Habit name must be at least 2 characters")
    .max(100, "Habit name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  target_frequency: z.enum(['daily', 'weekly', 'monthly']),
  target_count: z
    .number()
    .int("Count must be a whole number")
    .min(1, "Count must be at least 1")
    .max(100, "Count seems too high"),
});

// ============= FUNDRAISER SCHEMAS =============
export const fundraiserSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),
  goal_amount: z
    .number()
    .min(10, "Goal amount must be at least $10")
    .max(1000000, "Goal amount must be less than $1,000,000"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  location: z
    .string()
    .trim()
    .max(200, "Location must be less than 200 characters")
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((date) => new Date(date) > new Date(), {
      message: "End date must be in the future",
    }),
});

// ============= HELPER FUNCTIONS =============
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Validation failed" };
  }
};
