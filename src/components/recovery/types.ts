import { Heart, Zap, Snowflake, Flame, Wind, Waves, Activity } from 'lucide-react';

export interface RecoverySession {
  id: string;
  user_id: string;
  therapy_type: string;
  duration_minutes: number;
  intensity: string | null;
  temperature: string | null;
  location: string | null;
  cost: number | null;
  notes: string | null;
  session_date: string;
  created_at: string;
}

export interface RecoveryFormData {
  selectedTherapy: string | null;
  duration: string;
  intensity: string;
  temperature: string;
  location: string;
  cost: string;
  notes: string;
}

export const defaultFormData: RecoveryFormData = {
  selectedTherapy: null,
  duration: '',
  intensity: 'medium',
  temperature: '',
  location: '',
  cost: '',
  notes: '',
};

export const therapies = [
  { id: 'massage', icon: Heart, color: 'text-pink-500 bg-pink-500/10', nameKey: 'massage_therapy', descKey: 'massage_description' },
  { id: 'red_light', icon: Zap, color: 'text-red-500 bg-red-500/10', nameKey: 'red_light_therapy', descKey: 'red_light_description' },
  { id: 'cold_plunge', icon: Snowflake, color: 'text-cyan-500 bg-cyan-500/10', nameKey: 'cold_plunge', descKey: 'cold_plunge_description' },
  { id: 'sauna', icon: Flame, color: 'text-orange-500 bg-orange-500/10', nameKey: 'sauna', descKey: 'sauna_description' },
  { id: 'oxygen', icon: Wind, color: 'text-blue-500 bg-blue-500/10', nameKey: 'oxygen_therapy', descKey: 'oxygen_description' },
  { id: 'cryotherapy', icon: Snowflake, color: 'text-indigo-500 bg-indigo-500/10', nameKey: 'cryotherapy', descKey: 'cryo_description' },
  { id: 'float_tank', icon: Waves, color: 'text-teal-500 bg-teal-500/10', nameKey: 'float_tank', descKey: 'float_description' },
  { id: 'compression', icon: Activity, color: 'text-purple-500 bg-purple-500/10', nameKey: 'compression_therapy', descKey: 'compression_description' },
  { id: 'infrared', icon: Flame, color: 'text-amber-500 bg-amber-500/10', nameKey: 'infrared_therapy', descKey: 'infrared_description' },
  { id: 'stretching', icon: Heart, color: 'text-green-500 bg-green-500/10', nameKey: 'stretching_mobility', descKey: 'stretching_description' },
];
