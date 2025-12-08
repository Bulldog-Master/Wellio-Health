export interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  difficulty_level: string;
  points_reward: number;
  creator_id: string;
  participants_count?: number;
}

export interface ChallengeFormData {
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  difficulty_level: string;
  points_reward: number;
  is_public: boolean;
  max_participants: number;
}

export const initialChallengeFormData: ChallengeFormData = {
  title: "",
  description: "",
  challenge_type: "workout_count",
  target_value: 30,
  target_unit: "workouts",
  start_date: "",
  end_date: "",
  difficulty_level: "medium",
  points_reward: 100,
  is_public: true,
  max_participants: 100,
};
